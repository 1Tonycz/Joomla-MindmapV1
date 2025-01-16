<?php
/**
 * @package    Joomla.Cli
 *
 * @author     Jiří Hlaváč, jhlavac@agionet.cz
 * @copyright  Copyright (C) 2019 Agionet.cz. All rights reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */

/**
 */

// We are a valid entry point.
const _JEXEC = 1;

// Load system defines
if (file_exists(dirname(__DIR__) . '/defines.php'))
{
	require_once dirname(__DIR__) . '/defines.php';
}

if (!defined('_JDEFINES'))
{
	define('JPATH_BASE', dirname(__DIR__));
	require_once JPATH_BASE . '/includes/defines.php';
}

// Get the framework.
require_once JPATH_LIBRARIES . '/import.legacy.php';

// Bootstrap the CMS libraries.
require_once JPATH_LIBRARIES . '/cms.php';

// Configure error reporting to maximum for CLI output.
error_reporting(-1);
ini_set('display_errors', 1);

// Load Library language
$lang = JFactory::getLanguage();

// Try the files_joomla file in the current language (without allowing the loading of the file in the default language)
$lang->load('files_joomla.sys', JPATH_SITE, null, false, false)
// Fallback to the files_joomla file in the default language
|| $lang->load('files_joomla.sys', JPATH_SITE, null, true);

use Joomla\CMS\Factory;

JLoader::register('ContentHelperRoute', JPATH_SITE . '/components/com_content/helpers/route.php');

/**
 * A command line cron job to attempt to remove files that should have been deleted at update.
 *
 * @since  3.0
 */
class ContentJSONExport extends JApplicationWeb
{
	private $log = [];
	public $isError = false;
	
	public $poleKategorie;
	
	/**
	 * Entry point for CGI script
	 *
	 * @return  void
	 *
	 * @since   3.0
	 */
	public function doExecute()
	{
		$rootId = 2;
		$this->poleKategorie = [
			'color' => 2,
			'side' => 4
		];
		
		$nodes = new stdClass();
		$nodes->root = $this->getCategory($rootId);
		$nodes->root->layout = "map";
		$nodes->root->shape = "ellipse";

		$json = json_encode($nodes, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_LINE_TERMINATORS | JSON_PRETTY_PRINT);
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
		$result->link = "<a href='https://www.agionet.cz/". ContentHelperRoute::getCategoryRoute($id) . "'>";
		$result->text = $category->title;
		$result->notes = $category->description ?? "";
		$result->shape = "box";
		
		if (isset($category->fields[$this->poleKategorie['side']])) {
			$result->side = $category->fields[$this->poleKategorie['side']];
		}
		if (isset($category->fields[$this->poleKategorie['side']])) {
			$result->color = $category->fields[$this->poleKategorie['color']];
		}
		
		if ($category->level >= 2 ) {
			$result->collapsed = 1;
		}
		
		$result->children = [];
		
		// Clanky v kategorii
		$query = $db->getQuery(true)
				->select("c.id, c.title, c.introtext, c.fulltext, 'item' as nodeType")
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
				$content = new stdClass();
				$content->_type = "item";
				$content->id = uniqid();
				$content->link = "<a href='https://www.agionet.cz/". ContentHelperRoute::getArticleRoute($item->id, $id) . "'>";
				$content->text = str_replace('"', "'", $item->title);
				$content->notes = str_replace('"', "'", $item->introtext);
				
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

// Instantiate the application object, passing the class name to JCli::getInstance
// and use chaining to execute the application.
JApplicationWeb::getInstance('ContentJSONExport')->execute();
