<?php
/**
 * @package    Joomla.Cli
 *
 * @author     Jiří Hlaváč
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */

use Joomla\CMS\Factory;
use Joomla\CMS\Application\WebApplication;
use Joomla\CMS\Router\Route;
use Joomla\Component\Content\Administrator\Helper\AssociationsHelper;
use Joomla\Component\Content\Site\Helper\RouteHelper as ContentRouteHelper;

define('_JEXEC', 1);

$startTime = microtime(1);
$startMem  = memory_get_usage();

if (file_exists(dirname(__DIR__) . '/defines.php')) {
    include_once dirname(__DIR__) . '/defines.php';
}

require_once dirname(__DIR__) . '/includes/defines.php';

if (!file_exists(JPATH_LIBRARIES . '/vendor/autoload.php') || !is_dir(JPATH_PUBLIC . '/media/vendor')) {
    echo file_get_contents(JPATH_ROOT . '/templates/system/build_incomplete.html');
    exit;
}

require_once JPATH_BASE . '/includes/framework.php';

JDEBUG && \Joomla\CMS\Profiler\Profiler::getInstance('Application')->setStart($startTime, $startMem)->mark('afterLoad');

$container = Factory::getContainer();

error_reporting(-1);
ini_set('display_errors', 1);

$lang = Factory::getLanguage();
$lang->load('files_joomla.sys', JPATH_SITE, null, false, false)
|| $lang->load('files_joomla.sys', JPATH_SITE, null, true);

require_once(JPATH_SITE . '/components/com_content/src/Helper/RouteHelper.php');

class ContentJSONExport extends WebApplication
{
    private $log = [];
    public $isError = false;

    public $poleKategorie;

    public function doExecute()
    {
        $rootId = 2;
        $this->poleKategorie = [
            'side' => -1,
            'color' => -1,
            'collapsed' => 9
        ];

        $nodes = new stdClass();
        $nodes->root = $this->getCategory($rootId);
        $nodes->root->layout = "map";
        $nodes->root->shape = "ellipse";

        $json = json_encode($nodes, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        $file = __DIR__ . '/my-mind_export.json';
        file_put_contents($file, $json);

        if (!isset($_GET['echo']))
        {
            if (file_exists($file)) {
                header('Content-Description: File Transfer');
                header('Content-Type: application/json');
                header('Content-Disposition: attachment; filename="'.basename($file).'"');
                header('Expires: 0');
                header('Cache-Control: must-revalidate');
                header('Pragma: public');
                header('Content-Length: ' . filesize($file));
                readfile($file);
                exit;
            }
        }
        else {
            echo "<pre>";
            echo $json;
        }
    }

    public function getCategory($id)
    {
        $db = Factory::getDbo();
        $query = $db->getQuery(true)
            ->select("c.id, c.title, c.description, c.level")
            ->from("#__categories c")
            ->where("c.id = " . (int)$id)
            ->where("c.published = 1");
        $db->setQuery($query);
        $category = $db->loadObject();

        if ($category !== null)
        {
            $query = $db->getQuery(true)
                ->select("field_id, value")
                ->from("#__fields_values")
                ->where("item_id = " . (int)$id)
                ->where("field_id IN (" . implode(',', array_values($this->poleKategorie)) . ")");
            $db->setQuery($query);
            $category->fields = $db->loadAssocList("field_id", "value");
        }

        $result = new stdClass();
        $result->_type = "category";
        $result->id = uniqid();
        // Upravený link bez "../"
        $result->link = ContentRouteHelper::getCategoryRoute($id);
        $result->text = $category->title;
        $result->notes = $category->description ?? "";
        $result->shape = "box";

        if ($category->level >= 2 ) {
            $result->collapsed = 1;
        }

        if (isset($category->fields[$this->poleKategorie['side']])) {
            $result->side = $category->fields[$this->poleKategorie['side']];
        }
        if (isset($category->fields[$this->poleKategorie['color']])) { // Oprava indexu na 'color'
            $result->color = $category->fields[$this->poleKategorie['color']];
        }
        if (isset($category->fields[$this->poleKategorie['collapsed']])) {
            $result->collapsed = $category->fields[$this->poleKategorie['collapsed']] === 'true' ? 0 : 1;
        }

        $result->children = [];

        // Články v kategorii
        $query = $db->getQuery(true)
            ->select("c.id, c.title, c.introtext, c.fulltext, c.urls, 'item' as nodeType")
            ->from("#__content c")
            ->where("c.catid = " . (int)$id)
            ->where("c.state = 1")
            ->order("ordering");
        $db->setQuery($query);
        $items = $db->loadObjectList();

        if (!empty($items))
        {
            foreach ($items as $item)
            {
                $urls = json_decode($item->urls);
                $content = new stdClass();
                $content->_type = "item";
                $content->id = uniqid();
                // Upravený link bez "../"
                $content->link = ContentRouteHelper::getArticleRoute($item->id, $id);
                $content->text = str_replace('"', "'", $item->title);
                $content->notes = str_replace('"', "'", $item->introtext);

                $content->urlLink = $urls->urla;
                $content->urlText = $urls->urlatext;

                $result->children[] = $content;
            }
        }

        // Podkategorie
        $query = $db->getQuery(true)
            ->select("id")
            ->from("#__categories")
            ->where("parent_id = " . (int)$id)
            ->where("published = 1")
            ->order("lft");
        $db->setQuery($query);
        $children = $db->loadColumn();

        foreach ($children as $child)
        {
            $result->children[] = $this->getCategory($child);
        }

        return $result;
    }

    public function renderLog($toFile = false)
    {
        $text = str_repeat("=", 45) . ($toFile ? PHP_EOL : "<br>") . date("c") . ($toFile ? PHP_EOL : "<br>") . str_repeat("-", 45) . ($toFile ? PHP_EOL : "<br>");
        foreach ($this->log as $i => $row) {
            $text .= "#" . ($i+1) . "|" . ($row[1] == 1 ? "SUCCESS|" : "ERROR|") . $row[0] . ($toFile ? PHP_EOL : "<br>");
        }
        $text .= str_repeat("=", 45) . ($toFile ? PHP_EOL : "<br>");

        if ($toFile)
        {
            \Joomla\CMS\Filesystem\Folder::create('logs');
            file_put_contents(__DIR__ . '/logs/updatestock_' . date("Ymd") . '.log', $text, FILE_APPEND);

            $deleteTime = time() - 14 * 24*3600;
            foreach (\Joomla\CMS\Filesystem\Folder::files(__DIR__ . '/logs', '\.log$', false, true) as $logfile) {
                if (stat($logfile)['ctime'] < $deleteTime) {
                    \Joomla\CMS\Filesystem\File::delete($logfile);
                }
            }

            echo "UpdateStockFromMagion => " . ($this->isError ? "Error" : "Success") . PHP_EOL;
        }
        else {
            echo $text;
        }
    }
}

// Nastavení aliasů pro session
$container->alias('session.web', 'session.web.site')
    ->alias('session', 'session.web.site')
    ->alias('JSession', 'session.web.site')
    ->alias(\Joomla\CMS\Session\Session::class, 'session.web.site')
    ->alias(\Joomla\Session\Session::class, 'session.web.site')
    ->alias(\Joomla\Session\SessionInterface::class, 'session.web.site');

$app = $container->get(\Joomla\CMS\Application\SiteApplication::class);

// Nastavení globální aplikace
Factory::$application = $app;
WebApplication::getInstance('ContentJSONExport')->execute();
?>
