function jsExpandG (el) {
  const event = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  
  const plusBtn = el.closest('.item').querySelector('g.toggle');
  if(plusBtn) {
    plusBtn.dispatchEvent(event);
  } else {
  	el.closest('.content').querySelector('button.notes[data-modal-target="#modal"]').dispatchEvent(event);
  }
} 


(
  () => {
  var __defProp = Object.defineProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __export = (target, all2) => {
    __markAsModule(target);
    for (var name in all2)
      __defProp(target, name, { get: all2[name], enumerable: true });
  };

  // Petrovo a Martinovo funkce na Expand buttonu kategorie jakoby na plus "G"
      
 

  // .js/html.js
  function node(name, attrs) {
    let node11 = document.createElement(name);
    Object.assign(node11, attrs);
    return node11;
  }

  // .js/svg.js
  var NS = "http://www.w3.org/2000/svg";
  function node2(name, attrs) {
    let node11 = document.createElementNS(NS, name);
    for (let attr in attrs) {
      node11.setAttribute(attr, attrs[attr]);
    }
    return node11;
  }
  function group() {
    return node2("g");
  }
  
  function foreignObject() {
    let fo = node2("foreignObject");
    fo.setAttribute("width", "100%");
    fo.setAttribute("height", "100%");
    return fo;
  }
  // .js/pubsub.js
  var subscribers = new Map();
  function publish(message, publisher, data) {
    let subs = subscribers.get(message) || [];
    subs.forEach((sub) => {
      if (typeof sub == "function") {
        sub(message, publisher, data);
      } else {
        sub.handleMessage(message, publisher, data);
      }
    });
  }
  function subscribe(message, subscriber) {
    if (!subscribers.has(message)) {
      subscribers.set(message, []);
    }
    let subs = subscribers.get(message) || [];
    let index2 = subs.indexOf(subscriber);
    if (index2 == -1) {
      subs.push(subscriber);
    }
  }
  // .js/history.js
  var index = 0;
  var actions = [];
  function reset() {
    index = 0;
    actions = [];
  }
  // .js/layout/layout.js
  var OPPOSITE = {
    left: "right",
    right: "left",
    top: "bottom",
    bottom: "top"
  };
  var Layout = class {
    constructor(id, label, childDirection = "right") {
      this.id = id;
      this.label = label;
      this.childDirection = childDirection;
      this.SPACING_CHILD = 4;
      repo2.set(this.id, this);
    }
    get option() {
      return new Option(this.label, this.id);
    }
    getChildDirection(_child) {
      return this.childDirection;
    }
    computeAlignment(item) {
      let direction = item.isRoot ? this.childDirection : item.parent.resolvedLayout.getChildDirection(item);
      if (direction == "left") {
        return "right";
      }
      return "left";
    }
    pick(item, dir) {
      if (!item.collapsed) {
        var children = item.children;
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          if (this.getChildDirection(child) == dir) {
            return child;
          }
        }
      }
      if (item.isRoot) {
        return item;
      }
      let childItem = item;
      var parentLayout = childItem.parent.resolvedLayout;
      var thisChildDirection = parentLayout.getChildDirection(item);
      if (thisChildDirection == dir) {
        return childItem;
      } else if (thisChildDirection == OPPOSITE[dir]) {
        return childItem.parent;
      } else {
        return parentLayout.pickSibling(childItem, dir == "left" || dir == "top" ? -1 : 1);
      }
    }
    pickSibling(item, dir) {
      if (item.isRoot) {
        return item;
      }
      var children = item.parent.children;
      var index2 = children.indexOf(item);
      index2 += dir;
      index2 = (index2 + children.length) % children.length;
      return children[index2];
    }
    positionToggle(item, point) {
      item.dom.toggle.setAttribute("transform", `translate(${point.map(Math.round)})`);
    }
    getChildAnchor(item, side) {
      let { position, contentPosition, contentSize } = item;
      if (side == "left" || side == "right") {
        var pos = position[0] + contentPosition[0];
        if (side == "left") {
          pos += contentSize[0];
        }
      } else {
        var pos = position[1] + contentPosition[1];
        if (side == "top") {
          pos += contentSize[1];
        }
      }
      return pos;
    }
    computeChildrenBBox(children, childIndex) {
      let bbox = [0, 0];
      var rankIndex = (childIndex + 1) % 2;
      children.forEach((child) => {
        const { size } = child;
        bbox[rankIndex] = Math.max(bbox[rankIndex], size[rankIndex]);
        bbox[childIndex] += size[childIndex];
      });
      if (children.length > 1) {
        bbox[childIndex] += this.SPACING_CHILD * (children.length - 1);
      }
      return bbox;
    }
  };
  var repo2 = new Map();

  // .js/layout/graph.js
  var SPACING_RANK = 16;
  var R = SPACING_RANK / 2;
  var GraphLayout = class extends Layout {
    update(item) {
      let totalHeight = this.layoutItem(item, this.childDirection);
      if (this.childDirection == "left" || this.childDirection == "right") {
        this.drawLinesHorizontal(item, this.childDirection);
      } else {
        this.drawLinesVertical(item, this.childDirection, totalHeight);
      }
    }
    layoutItem(item, rankDirection) {
      const { contentSize, children } = item;
      let rankIndex = rankDirection == "left" || rankDirection == "right" ? 0 : 1;
      let childIndex = (rankIndex + 1) % 2;
      let rankSize = contentSize[rankIndex];
      let childSize = contentSize[childIndex];
      if (!item.collapsed && children.length > 0) {
        let bbox = this.computeChildrenBBox(children, childIndex);
        rankSize += bbox[rankIndex] + SPACING_RANK;
        childSize = Math.max(childSize, bbox[childIndex]);
        let offset = [0, 0];
        if (rankDirection == "right") {
          offset[0] = contentSize[0] + SPACING_RANK;
        }
        if (rankDirection == "bottom") {
          offset[1] = contentSize[1] + SPACING_RANK;
        }
        offset[childIndex] = Math.round((childSize - bbox[childIndex]) / 2);
        this.layoutChildren(children, rankDirection, offset, bbox);
      }
      let labelPos = 0;
      if (rankDirection == "left") {
        labelPos = rankSize - contentSize[0];
      }
      if (rankDirection == "top") {
        labelPos = rankSize - contentSize[1];
      }
      let contentPosition = [Math.round((childSize - contentSize[childIndex]) / 2), labelPos];
      if (rankIndex == 0) {
        contentPosition = contentPosition.reverse();
      }
      item.contentPosition = contentPosition;
      return rankIndex == 0 ? childSize : rankSize;
    }
    layoutChildren(children, rankDirection, offset, bbox) {
      var rankIndex = rankDirection == "left" || rankDirection == "right" ? 0 : 1;
      var childIndex = (rankIndex + 1) % 2;
      children.forEach((child) => {
        const { size } = child;
        if (rankDirection == "left") {
          offset[0] = bbox[0] - size[0];
        }
        if (rankDirection == "top") {
          offset[1] = bbox[1] - size[1];
        }
        child.position = offset;
        offset[childIndex] += size[childIndex] + this.SPACING_CHILD;
      });
      return bbox;
    }
    drawLinesHorizontal(item, side) {
      const { contentPosition, contentSize, resolvedShape, resolvedColor, children, dom } = item;
      if (children.length == 0) {
        return;
      }
      const dirModifier = side == "right" ? 1 : -1;
      let itemAnchor = [
        contentPosition[0] + (side == "right" ? contentSize[0] : 0) + dirModifier * 0.5,
        resolvedShape.getVerticalAnchor(item)
      ];
      let cross = [
        itemAnchor[0] + dirModifier * R,
        itemAnchor[1]
      ];
      this.positionToggle(item, cross);
      if (item.collapsed) {
        return;
      }
      let d = [];
      if (children.length == 1) {
        var child = children[0];
        const { position, resolvedShape: resolvedShape2 } = child;
        let childAnchor = [
          this.getChildAnchor(child, side),
          resolvedShape2.getVerticalAnchor(child) + position[1]
        ];
        let midX = (itemAnchor[0] + childAnchor[0]) / 2;
        d.push(`M ${itemAnchor}`, `C ${[midX, itemAnchor[1]]} ${[midX, childAnchor[1]]} ${childAnchor}`);
        let path2 = node2("path", { d: d.join(" "), stroke: resolvedColor, fill: "none" });
        dom.connectors.append(path2);
        return;
      }
      d.push(`M ${itemAnchor}`, `L ${cross}`);
      const firstChild = children[0];
      const lastChild = children[children.length - 1];
      const cornerEndX = cross[0] + dirModifier * R;
      const sweep = dirModifier > 0 ? 0 : 1;
      let firstAnchor = [
        this.getChildAnchor(firstChild, side),
        firstChild.resolvedShape.getVerticalAnchor(firstChild) + firstChild.position[1]
      ];
      let lastAnchor = [
        this.getChildAnchor(lastChild, side),
        lastChild.resolvedShape.getVerticalAnchor(lastChild) + lastChild.position[1]
      ];
      d.push(`M ${firstAnchor}`, `L ${cornerEndX} ${firstAnchor[1]}`, `A ${R} ${R} 0 0 ${sweep} ${cross[0]} ${firstAnchor[1] + R}`, `L ${cross[0]} ${lastAnchor[1] - R}`, `A ${R} ${R} 0 0 ${sweep} ${cornerEndX} ${lastAnchor[1]}`, `L ${lastAnchor}`);
      for (let i = 1; i < children.length - 1; i++) {
        const c = children[i];
        const y = c.resolvedShape.getVerticalAnchor(c) + c.position[1];
        let lineStart = [cross[0], y];
        let childAnchor = [this.getChildAnchor(c, side), y];
        d.push(`M ${lineStart}`, `L ${childAnchor}`);
      }
      let path = node2("path", { d: d.join(" "), stroke: resolvedColor, fill: "none" });
      dom.connectors.append(path);
    }
    drawLinesVertical(item, side, totalHeight) {
      const { contentSize, resolvedShape, resolvedColor, children, dom } = item;
      if (children.length == 0) {
        return;
      }
      const dirModifier = side == "bottom" ? 1 : -1;
      let itemAnchor = [
        resolvedShape.getHorizontalAnchor(item),
        side == "bottom" ? resolvedShape.getVerticalAnchor(item) : totalHeight - contentSize[1]
      ];
      let cross = [
        itemAnchor[0],
        (side == "bottom" ? contentSize[1] : itemAnchor[1]) + (R * dirModifier + 0.5)
      ];
      this.positionToggle(item, cross);
      if (item.collapsed) {
        return;
      }
      let d = [];
      d.push(`M ${itemAnchor}`, `L ${cross}`);
      if (children.length == 1) {
        let child = children[0];
        let childAnchor = [cross[0], this.getChildAnchor(child, side)];
        d.push(`M ${cross}`, `L ${childAnchor}`);
        let path2 = node2("path", { d: d.join(" "), stroke: resolvedColor, fill: "none" });
        dom.connectors.append(path2);
        return;
      }
      const firstChild = children[0];
      const lastChild = children[children.length - 1];
      const cornerEndY = cross[1] + dirModifier * R;
      const sweep = dirModifier > 0 ? 1 : 0;
      let firstAnchor = [
        firstChild.resolvedShape.getHorizontalAnchor(firstChild) + firstChild.position[0],
        this.getChildAnchor(firstChild, side)
      ];
      let lastAnchor = [
        lastChild.resolvedShape.getHorizontalAnchor(lastChild) + lastChild.position[0],
        this.getChildAnchor(lastChild, side)
      ];
      d.push(`M ${firstAnchor}`, `L ${firstAnchor[0]} ${cornerEndY}`, `A ${R} ${R} 0 0 ${sweep} ${firstAnchor[0] + R} ${cross[1]}`, `L ${lastAnchor[0] - R} ${cross[1]}`, `A ${R} ${R} 0 0 ${sweep} ${lastAnchor[0]} ${cornerEndY}`, `L ${lastAnchor}`);
      for (var i = 1; i < children.length - 1; i++) {
        const c = children[i];
        const x = c.resolvedShape.getHorizontalAnchor(c) + c.position[0];
        let lineStart = [x, cross[1]];
        let childAnchor = [x, this.getChildAnchor(c, side)];
        d.push(`M ${lineStart}`, `L ${childAnchor}`);
      }
      let path = node2("path", { d: d.join(" "), stroke: resolvedColor, fill: "none" });
      dom.connectors.append(path);
    }
  };
  new GraphLayout("graph-bottom", "Bottom", "bottom");
  new GraphLayout("graph-top", "Top", "top");
  new GraphLayout("graph-left", "Left", "left");
  new GraphLayout("graph-right", "Right", "right");

  // .js/layout/tree.js
  var SPACING_RANK2 = 32;
  var R2 = SPACING_RANK2 / 4;
  var LINE_OFFSET = SPACING_RANK2 / 2;
  var TreeLayout = class extends Layout {
    update(item) {
      let totalWidth = this.layoutItem(item, this.childDirection);
      this.drawLines(item, this.childDirection, totalWidth);
    }
    layoutItem(item, rankDirection) {
      const { contentSize, children } = item;
      let rankSize = contentSize[0];
      if (!item.collapsed && children.length > 0) {
        let bbox = this.computeChildrenBBox(children, 1);
        rankSize = Math.max(rankSize, bbox[0] + SPACING_RANK2);
        let offset = [SPACING_RANK2, contentSize[1] + this.SPACING_CHILD];
        if (rankDirection == "left") {
          offset[0] = rankSize - bbox[0] - SPACING_RANK2;
        }
        this.layoutChildren(children, rankDirection, offset, bbox);
      }
      let labelPos = 0;
      if (rankDirection == "left") {
        labelPos = rankSize - contentSize[0];
      }
      item.contentPosition = [labelPos, 0];
      return rankSize;
    }
    layoutChildren(children, rankDirection, offset, bbox) {
      children.forEach((child) => {
        const { size } = child;
        let left = offset[0];
        if (rankDirection == "left") {
          left += bbox[0] - size[0];
        }
        child.position = [left, offset[1]];
        offset[1] += size[1] + this.SPACING_CHILD;
      });
    }
    drawLines(item, direction, totalWidth) {
      const { resolvedShape, resolvedColor, children, dom } = item;
      const dirModifier = direction == "right" ? 1 : -1;
      const lineX = (direction == "left" ? totalWidth - LINE_OFFSET : LINE_OFFSET) + 0.5;
      const toggleDistance = TOGGLE_SIZE + 2;
      let pointAnchor = [
        lineX,
        resolvedShape.getVerticalAnchor(item)
      ];
      this.positionToggle(item, [pointAnchor[0], pointAnchor[1] + toggleDistance]);
      if (children.length == 0 || item.collapsed) {
        return;
      }
      let lastChild = children[children.length - 1];
      let lineEnd = [
        lineX,
        lastChild.resolvedShape.getVerticalAnchor(lastChild) + lastChild.position[1] - R2
      ];
      let d = [`M ${pointAnchor}`, `L ${lineEnd}`];
      let sweep = dirModifier > 0 ? 0 : 1;
      children.forEach((child) => {
        const { resolvedShape: resolvedShape2, position } = child;
        const y = resolvedShape2.getVerticalAnchor(child) + position[1];
        d.push(`M ${lineX} ${y - R2}`, `A ${R2} ${R2} 0 0 ${sweep} ${lineX + dirModifier * R2} ${y}`, `L ${this.getChildAnchor(child, direction)} ${y}`);
      });
      let path = node2("path", { d: d.join(" "), stroke: resolvedColor, fill: "none" });
      dom.connectors.append(path);
    }
  };
  new TreeLayout("tree-left", "Left", "left");
  new TreeLayout("tree-right", "Right", "right");

  // .js/layout/map.js
  var MapLayout = class extends GraphLayout {
    constructor() {
      super(...arguments);
      this.LINE_THICKNESS = 8;
    }
    update(item) {
      if (item.isRoot) {
        this.layoutRoot(item);
      } else {
        var side = this.getChildDirection(item);
        repo2.get(`graph-${side}`).update(item);
      }
    }
    getChildDirection(child) {
      while (!child.parent.isRoot) {
        child = child.parent;
      }
      let side = child.side;
      if (side) {
        return side;
      }
      let counts = { left: 0, right: 0 };
      child.parent.children.forEach((sibling) => {
        let side2 = sibling.side;
        if (!side2) {
          side2 = counts.right > counts.left ? "left" : "right";
          sibling.side = side2;
        }
        counts[side2]++;
      });
      return child.side;
    }
    pickSibling(item, dir) {
      if (item.isRoot) {
        return item;
      }
      const parent = item.parent;
      var children = parent.children;
      if (parent.isRoot) {
        var side = this.getChildDirection(item);
        children = children.filter((child) => this.getChildDirection(child) == side);
      }
      var index2 = children.indexOf(item);
      index2 += dir;
      index2 = (index2 + children.length) % children.length;
      return children[index2];
    }
    layoutRoot(item) {
      const { children, contentSize } = item;
      let childrenLeft = [];
      let childrenRight = [];
      let contentPosition = [0, 0];
      children.forEach((child) => {
        var side = this.getChildDirection(child);
        if (side == "left") {
          childrenLeft.push(child);
        } else {
          childrenRight.push(child);
        }
      });
      let bboxLeft = this.computeChildrenBBox(childrenLeft, 1);
      let bboxRight = this.computeChildrenBBox(childrenRight, 1);
      let height = Math.max(bboxLeft[1], bboxRight[1], contentSize[1]);
      let left = 0;
      this.layoutChildren(childrenLeft, "left", [left, Math.round((height - bboxLeft[1]) / 2)], bboxLeft);
      left += bboxLeft[0];
      if (childrenLeft.length) {
        left += SPACING_RANK;
      }
      contentPosition[0] = left;
      left += contentSize[0];
      if (childrenRight.length) {
        left += SPACING_RANK;
      }
      this.layoutChildren(childrenRight, "right", [left, Math.round((height - bboxRight[1]) / 2)], bboxRight);
      left += bboxRight[0];
      contentPosition[1] = Math.round((height - contentSize[1]) / 2);
      item.contentPosition = contentPosition;
      this.drawRootConnectors(item, "left", childrenLeft);
      this.drawRootConnectors(item, "right", childrenRight);
    }
    drawRootConnectors(item, direction, children) {
      if (children.length == 0 || item.collapsed) {
        return;
      }
      const { contentSize, contentPosition, resolvedShape, dom } = item;
      let x1 = contentPosition[0] + contentSize[0] / 2;
      let y1 = resolvedShape.getVerticalAnchor(item);
      const half = this.LINE_THICKNESS / 2;
      let paths = children.map((child) => {
        const { resolvedColor, resolvedShape: resolvedShape2, position } = child;
        let x2 = this.getChildAnchor(child, direction);
        let y2 = resolvedShape2.getVerticalAnchor(child) + position[1];
        let angle = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
        let dx = Math.cos(angle) * half;
        let dy = Math.sin(angle) * half;
        let d = [
          `M ${x1 - dx} ${y1 - dy}`,
          `Q ${(x2 + x1) / 2} ${y2} ${x2} ${y2}`,
          `Q ${(x2 + x1) / 2} ${y2} ${x1 + dx} ${y1 + dy}`,
          `Z`
        ];
        let attrs = {
          d: d.join(" "),
          fill: resolvedColor,
          stroke: resolvedColor
        };
        return node2("path", attrs);
      });
      dom.connectors.append(...paths);
    }
  };
  new MapLayout("map", "Map");

  // .js/shape/shape.js
  var VERTICAL_OFFSET = 0.5;
  var Shape = class {
    constructor(id, label) {
      this.id = id;
      this.label = label;
      repo3.set(this.id, this);
    }
    get option() {
      return new Option(this.label, this.id);
    }
    update(item) {
      item.dom.content.style.borderColor = item.resolvedColor;
    }
    getHorizontalAnchor(item) {
      const { contentPosition, contentSize } = item;
      return Math.round(contentPosition[0] + contentSize[0] / 2) + 0.5;
    }
    getVerticalAnchor(item) {
      const { contentPosition, contentSize } = item;
      return contentPosition[1] + Math.round(contentSize[1] * VERTICAL_OFFSET) + 0.5;
    }
  };
  var repo3 = new Map();

  // .js/shape/box.js
  var Box = class extends Shape {
    constructor() {
      super("box", "Box");
    }
  };
  new Box();

  // .js/shape/ellipse.js
  var Ellipse = class extends Shape {
    constructor() {
      super("ellipse", "Ellipse");
    }
  };
  new Ellipse();

  // .js/shape/underline.js
  var VERTICAL_OFFSET2 = -4;
  var Underline = class extends Shape {
    constructor() {
      super("underline", "Underline");
    }
    update(item) {
      const { contentPosition, resolvedColor, contentSize, dom } = item;
      let left = contentPosition[0];
      let right = left + contentSize[0];
      let top = this.getVerticalAnchor(item);
      let d = [
        `M ${left} ${top}`,
        `L ${right} ${top}`
      ];
      let path = node2("path", { d: d.join(" "), stroke: resolvedColor, fill: "none" });
      dom.connectors.append(path);
    }
    getVerticalAnchor(item) {
      const { contentPosition, contentSize } = item;
      return contentPosition[1] + contentSize[1] + VERTICAL_OFFSET2 + 0.5;
    }
  };
  new Underline();

  // .js/ui/ui.js
  var node10 = document.querySelector("#ui");
  function getWidth() {
    return node10.hidden ? 0 : node10.offsetWidth;
  }
  function onClick3(e) {
    let target = e.target;
    let current2 = target;
    
    while (true) {
      let command = current2.dataset.command;
      if (command) {
        repo.get(command).execute();
        return;
      }
      if (current2.parentNode instanceof Element) {
        current2 = current2.parentNode;
      } else {
        return;
      }
    }
  }
  function restore() {
    let parts = {};
    location.search.substring(1).split("&").forEach((item) => {
      let keyvalue = item.split("=").map(decodeURIComponent);
      parts[keyvalue[0]] = keyvalue[1];
    });
    setThrobber(false);
  }
  
  // .js/command/command.js
  var PAN_AMOUNT = 15;
  var repo = new Map();

  var Command = class {
    constructor(id, label) {
      this.label = label;
      this.editMode = false;
      repo.set(id, this);
    }
    get isValid() {
      return this.editMode === null || this.editMode == editing;
    }
  };
  new class Center extends Command {
    constructor() {
      super("center", "Center map");
      this.keys = [{ code: "End" }];
    }
    execute() {
      currentMap.center();
    }
  }();
  new class ZoomIn extends Command {
    constructor() {
      super("zoom-in", "Zoom in");
      this.keys = [{ key: "+" }];
    }
    execute() {
      currentMap.adjustFontSize(1);
    }
  }();
  new class ZoomOut extends Command {
    constructor() {
      super("zoom-out", "Zoom out");
      this.keys = [{ key: "-" }];
    }
    execute() {
      currentMap.adjustFontSize(-1);
    }
  }();

  new class Pan extends Command {
    constructor() {
      super("pan", "Pan the map");
      this.keys = [
        { code: "KeyW", ctrlKey: false, altKey: false, metaKey: false },
        { code: "KeyA", ctrlKey: false, altKey: false, metaKey: false },
        { code: "KeyS", ctrlKey: false, altKey: false, metaKey: false },
        { code: "KeyD", ctrlKey: false, altKey: false, metaKey: false }
      ];
      this.codes = [];
    }
    execute(e) {
      const { code } = e;
      var index2 = this.codes.indexOf(code);
      if (index2 > -1) {
        return;
      }
      if (!this.codes.length) {
        window.addEventListener("keyup", this);
        this.interval = setInterval(() => this.step(), 50);
      }
      this.codes.push(code);
      this.step();
    }
    step() {
      const dirs = {
        "KeyW": [0, 1],
        "KeyA": [1, 0],
        "KeyS": [0, -1],
        "KeyD": [-1, 0]
      };
      let offset = [0, 0];
      this.codes.forEach((code) => {
        offset[0] += dirs[code][0] * PAN_AMOUNT;
        offset[1] += dirs[code][1] * PAN_AMOUNT;
      });
      currentMap.moveBy(offset);
    }
    handleEvent(e) {
      const { code } = e;
      var index2 = this.codes.indexOf(code);
      if (index2 > -1) {
        this.codes.splice(index2, 1);
        if (!this.codes.length) {
          window.removeEventListener("keyup", this);
          clearInterval(this.interval);
        }
      }
    }
  }();
  
  new class Fold extends Command {
    constructor() {
      super("fold", "Fold/Unfold");
      this.keys = [{ key: "f", ctrlKey: false }];
    }
    execute() {
      let item = currentItem;
      item.collapsed = !item.collapsed;
      currentMap.ensureItemVisibility(item);
    }
  }();

  // .js/item.js
  var TOGGLE_SIZE = 10;
  var UPDATE_OPTIONS = {
    parent: true,
    children: false
  };
  var Item = class {
    constructor() {
      this._id = generateId();
      this._parent = null;
      this._collapsed = false;
      this._icon = "";
      this._notes = "";
      this._color = "";
      this._value = null;
      this._side = null;
      this._shape = null;
      this._layout = null;
      this._urlLink = null;
      this._urlText = null;
      this.originalText = "";
      this.dom = {
        node: group(),
        connectors: group(),
        content: node("div"),
        notes: node("button"),
        link: node("a"),
        icon: node("span"),
        value: node("span"),
        text: node("button"), // node("div"),
        toggle: buildToggle()
      };
      this.children = [];
      const { dom } = this;
      dom.node.classList.add("item");
      dom.content.classList.add("content");
      dom.notes.setAttribute("data-modal-target","#modal");
      dom.notes.classList.add("notes");
      dom.notes.setAttribute("title", "zobrazit");
      dom.link.classList.add("link");
      dom.icon.classList.add("icon");
      dom.value.classList.add("value");
       // dom.text.setAttribute("data-modal-target","#modal");
      dom.text.setAttribute("onclick","jsExpandG(this)");
      dom.text.classList.add("text");
        dom.text.classList.add("js-expand-g");
   // dom.notes.append(dom.text);
      dom.icon.classList.add("icon");
      this.notes = "";
      let fo = foreignObject();
      dom.node.append(dom.connectors, fo);
      fo.append(dom.content);
        
        dom.content.append(dom.value, dom.icon, dom.notes, dom.text, dom.link);  // dom.text, --- vrátit pře dom.link
      
        dom.toggle.addEventListener("click", (_) => {
        this.collapsed = !this.collapsed;
        selectItem(this);
      });
      this.updateToggle();
    }
    static fromJSON(data) {
      return new this().fromJSON(data);
    }
    get id() {
      return this._id;
    }
    get parent() {
      return this._parent;
    }
    set parent(parent) {
      this._parent = parent;
      this.update({ children: true });
    }
    get size() {
      const bbox = this.dom.node.getBBox();
      return [bbox.width, bbox.height];
    }
    get position() {
      const { node: node11 } = this.dom;
      const transform = node11.getAttribute("transform");
      return transform.match(/\d+/g).map(Number);
    }
    set position(position) {
      const { node: node11 } = this.dom;
      const transform = `translate(${position.join(" ")})`;
      node11.setAttribute("transform", transform);
    }
    get contentSize() {
      const { content } = this.dom;
      const fo = content.parentNode;
      return [fo.getAttribute("width"), fo.getAttribute("height")].map(Number);
    }
    get contentPosition() {
      const { content } = this.dom;
      const fo = content.parentNode;
      return [fo.getAttribute("x"), fo.getAttribute("y")].map(Number);
    }
    set contentPosition(position) {
      const { content } = this.dom;
      const fo = content.parentNode;
      fo.setAttribute("x", String(position[0]));
      fo.setAttribute("y", String(position[1]));
    }
    toJSON() {
      let data = {
        id: this.id,
        text: this.text,
        notes: this.notes,
        link: this.link
      };
      if (this._side) {
        data.side = this._side;
      }
      if (this._color) {
        data.color = this._color;
      }
      if (this._icon) {
        data.icon = this._icon;
      }
      if (this._layout) {
        data.layout = this._layout.id;
      }
      if (this._shape) {
        data.shape = this._shape.id;
      }
      if (this._collapsed) {
        data.collapsed = true;
      }
      if (this._urlLink) {
        data.urlLink = this._urlLink;
      }
      if (this._urlText) {
        data.urlText = this._urlText;
      }
      if (this.children.length) {
        data.children = this.children.map((child) => child.toJSON());
      }
      return data;
    }
    fromJSON(data) {
      this.text = data.text;
      if (data.id) {
        this._id = data.id;
      }
      if (data.notes) {
        this.notes = data.notes;
      }
      if (data.link){
        this.link = data.link;
      }
      if (data.side) {
        this._side = data.side;
      }
      if (data.color) {
        this._color = data.color;
      }
      if (data.icon) {
        this._icon = data.icon;
      }
      if (data.collapsed) {
        this.collapsed = !!data.collapsed;
      }
      if (data.layout) {
        this._layout = repo2.get(data.layout);
      }
      if (data.shape) {
        this.shape = repo3.get(data.shape);
      }
      if (data.urlLink) {
        this._urlLink = data.urlLink;
      }
      if (data.urlText) {
        this._urlText = data.urlText;
      }
      (data.children || []).forEach((child) => {
        this.insertChild(Item.fromJSON(child));
      });
      return this;
    }
    mergeWith(data) {
      var dirty = 0;
      if (this.text != data.text && !this.dom.text.contentEditable) {
        this.text = data.text;
      }
      if (this._side != data.side) {
        this._side = data.side || null;
        dirty = 1;
      }
      if (this._color != data.color) {
        this._color = data.color || "";
        dirty = 2;
      }
      if (this._icon != data.icon) {
        this._icon = data.icon || "";
        dirty = 1;
      }
      if (this._collapsed != !!data.collapsed) {
        this.collapsed = !!data.collapsed;
      }
      let ourShapeId = this._shape ? this._shape.id : null;
      if (ourShapeId != data.shape) {
        this._shape = data.shape ? repo3.get(data.shape) : null;
        dirty = 1;
      }
      let ourLayoutId = this._layout ? this._layout.id : null;
      if (ourLayoutId != data.layout) {
        this._layout = data.layout ? repo2.get(data.layout) : null;
        dirty = 2;
      }
      (data.children || []).forEach((child, index2) => {
        if (index2 >= this.children.length) {
          this.insertChild(Item.fromJSON(child));
        } else {
          var myChild = this.children[index2];
          if (myChild.id == child.id) {
            myChild.mergeWith(child);
          } else {
            this.removeChild(this.children[index2]);
            this.insertChild(Item.fromJSON(child), index2);
          }
        }
      });
      let newLength = (data.children || []).length;
      while (this.children.length > newLength) {
        this.removeChild(this.children[this.children.length - 1]);
      }
      if (dirty == 1) {
        this.update({ children: false });
      }
      if (dirty == 2) {
        this.update({ children: true });
      }
    }
    clone() {
      var data = this.toJSON();
      var removeId = function(obj) {
        delete obj.id;
        obj.children && obj.children.forEach(removeId);
      };
      removeId(data);
      return Item.fromJSON(data);
    }
    select() {
      this.dom.node.classList.add("current");
      publish("item-select", this);
    }
    deselect() {
      this.dom.node.classList.remove("current");
    }
    update(options = {}) {
      options = Object.assign({}, UPDATE_OPTIONS, options);
      const { map, children, parent } = this;
      if (!map || !map.isVisible) {
        return;
      }
      if (options.children) {
        let childUpdateOptions = { parent: false, children: true };
        children.forEach((child) => child.update(childUpdateOptions));
      }
      publish("item-change", this);
      this.updateIcon();
      this.updateValue();
      const { resolvedLayout, resolvedShape, dom } = this;
      const { content, node: node11, connectors } = dom;
      dom.text.style.color = this.resolvedTextColor;
      node11.dataset.shape = resolvedShape.id;
      node11.dataset.align = resolvedLayout.computeAlignment(this);
      let fo = content.parentNode;
      let size = [
        Math.max(content.offsetWidth, content.scrollWidth),
        Math.max(content.offsetHeight, content.scrollHeight)
      ];
      fo.setAttribute("width", String(size[0]));
      fo.setAttribute("height", String(size[1]));
      connectors.innerHTML = "";
      resolvedLayout.update(this);
      resolvedShape.update(this);
      if (options.parent && parent) {
        parent.update({ children: false });
      }
    }
    get text() {
      return this.dom.text.innerHTML;
    }
    set text(text) {
      this.dom.text.innerHTML = text;
      findLinks(this.dom.text);
      this.update();
    }
    get notes() {
      return this._notes;
    }
    set notes(notes3) {
      this._notes = notes3;
      this.dom.notes.hidden = !notes3;
    }
    get collapsed() {
      return this._collapsed;
    }
    set collapsed(collapsed) {
      this._collapsed = collapsed;
      this.updateToggle();
      let children = !collapsed;
      this.update({ children });
    }
    get icon() {
      return this._icon;
    }
    set icon(icon) {
      this._icon = icon;
      this.update();
    }
    get side() {
      return this._side;
    }
    set side(side) {
      this._side = side;
    }
    get color() {
      return this._color;
    }
    set color(color) {
      this._color = color;
      this.update({ children: true });
    }
    get resolvedColor() {
      if (this._color) {
        return this._color;
      }
      const { parent } = this;
      if (parent instanceof Item) {
        return parent.resolvedColor;
      }
      return COLOR;
    }
    get layout() {
      return this._layout;
    }
    set layout(layout) {
      this._layout = layout;
      this.update({ children: true });
    }
    get resolvedLayout() {
      if (this._layout) {
        return this._layout;
      }
      const { parent } = this;
      if (!(parent instanceof Item)) {
        throw new Error("Non-connected item does not have layout");
      }
      return parent.resolvedLayout;
    }
    get shape() {
      return this._shape;
    }
    set shape(shape) {
      this._shape = shape;
      this.update();
    }
    get resolvedShape() {
      if (this._shape) {
        return this._shape;
      }
      let depth = 0;
      let node11 = this;
      while (!node11.isRoot) {
        depth++;
        node11 = node11.parent;
      }
      switch (depth) {
        case 0:
          return repo3.get("ellipse");
        case 1:
          return repo3.get("box");
        default:
          return repo3.get("underline");
      }
    }
    get map() {
      let item = this.parent;
      while (item) {
        if (item instanceof Map2) {
          return item;
        }
        item = item.parent;
      }
      return null;
    }
    get isRoot() {
      return this.parent instanceof Map2;
    }
    insertChild(child, index2) {
      if (!child) {
        child = new Item();
      } else if (child.parent && child.parent instanceof Item) {
        child.parent.removeChild(child);
      }
      if (!this.children.length) {
        this.dom.node.appendChild(this.dom.toggle);
      }
      if (index2 === void 0) {
        index2 = this.children.length;
      }
      var next = null;
      if (index2 < this.children.length) {
        next = this.children[index2].dom.node;
      }
      this.dom.node.insertBefore(child.dom.node, next);
      this.children.splice(index2, 0, child);
      child.parent = this;
    }
    removeChild(child) {
      var index2 = this.children.indexOf(child);
      this.children.splice(index2, 1);
      child.dom.node.remove();
      child.parent = null;
      !this.children.length && this.dom.toggle.remove();
      this.update();
    }
    startEditing() {
      this.originalText = this.text;
      this.dom.text.contentEditable = "true";
      this.dom.text.focus();
      document.execCommand("styleWithCSS", false, "false");
      this.dom.text.addEventListener("input", this);
      this.dom.text.addEventListener("keydown", this);
      this.dom.text.addEventListener("blur", this);
    }
    stopEditing() {
      this.dom.text.removeEventListener("input", this);
      this.dom.text.removeEventListener("keydown", this);
      this.dom.text.removeEventListener("blur", this);
      this.dom.text.blur();
      this.dom.text.contentEditable = "false";
      let result = this.dom.text.innerHTML;
      this.dom.text.innerHTML = this.originalText;
      this.originalText = "";
      this.update();
      return result;
    }
    handleEvent(e) {
      switch (e.type) {
        case "input":
          this.update();
          this.map.ensureItemVisibility(this);
          break;
        case "keydown":
          if (e.code == "Tab") {
            e.preventDefault();
          }
          break;
        case "blur":
          repo.get("finish").execute();
          break;
      }
    }
    updateIcon() {
      var icon = this._icon;
      this.dom.icon.className = "icon";
      this.dom.icon.hidden = !icon;
      if (icon) {
        this.dom.icon.classList.add("fa");
        this.dom.icon.classList.add(icon);
      }
    }
    updateValue() {
      const { dom, _value } = this;
      if (_value === null) {
        dom.value.hidden = true;
        return;
      }
      dom.value.hidden = false;
      if (typeof _value == "number") {
        dom.value.textContent = String(_value);
      } else {
        let resolved = this.resolvedValue;
        dom.value.textContent = String(Math.round(resolved) == resolved ? resolved : resolved.toFixed(3));
      }
    }
    updateToggle() {
      const { node: node11, toggle: toggle4 } = this.dom;
      node11.classList.toggle("collapsed", this._collapsed);
      toggle4.querySelector("path").setAttribute("d", this._collapsed ? D_PLUS : D_MINUS);
    }
  };
  function findLinks(node11) {
    let children = [...node11.childNodes];
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      if (child instanceof Element) {
        if (child.nodeName.toLowerCase() == "a") {
          continue;
        }
        findLinks(child);
      }
      if (child instanceof Text) {
        let str = child.nodeValue;
        let result = str.match(RE);
        if (!result) {
          continue;
        }
        let before = str.substring(0, result.index);
        let after = str.substring(result.index + result[0].length);
        var link = document.createElement("a");
        link.innerHTML = link.href = result[0];
        if (before) {
          node11.insertBefore(document.createTextNode(before), child);
        }
        node11.insertBefore(link, child);
        if (after) {
          child.nodeValue = after;
          i--;
        } else {
          child.remove();
        }
      }
    }
  }
  function generateId() {
    let str = "";
    for (var i = 0; i < 8; i++) {
      let code = Math.floor(Math.random() * 26);
      str += String.fromCharCode("a".charCodeAt(0) + code);
    }
    return str;
  }
  //tlacitko +/- otevirani itemu
  var D_MINUS = `M ${-(TOGGLE_SIZE - 2)} 0 L ${TOGGLE_SIZE - 2} 0`;
  var D_PLUS = `${D_MINUS} M 0 ${-(TOGGLE_SIZE - 2)} L 0 ${TOGGLE_SIZE - 2}`;
  function buildToggle() {
    const circleAttrs = { "cx": "0", "cy": "0", "r": String(TOGGLE_SIZE) };
    let g = group();
    g.classList.add("toggle");
    g.append(node2("circle", circleAttrs), node2("path"));
    return g;
  }
  var COLOR = "#999";
  var RE = /\b(([a-z][\w-]+:\/\/\w)|(([\w-]+\.){2,}[a-z][\w-]+)|([\w-]+\.[a-z][\w-]+\/))[^\s]*([^\s,.;:?!<>\(\)\[\]'"])?($|\b)/i;

  // .js/map.js
  var css = "";
  var UPDATE_OPTIONS2 = {
   children: true
  };
  var Map2 = class {
    constructor(options) {
      this.node = node2("svg");
      this.style = node("style");
      this.position = [0, 0];
      this.fontSize = 15;
      let resolvedOptions = Object.assign({
        root: "Covid",
        layout: repo2.get("map")
      }, options);
      this.style.textContent = css;
      this.node.style.fontSize = `${this.fontSize}px`;
      let root = new Item();
      root.text = resolvedOptions.root;
      root.layout = resolvedOptions.layout;
      this.root = root;
    }
    static fromJSON(data) {
      return new this().fromJSON(data);
    }
    toJSON() {
      let data = {
        root: this._root.toJSON()
      };
      return data;
    }
    fromJSON(data) {
      this.root = Item.fromJSON(data.root);
      return this;
    }
    get root() {
      return this._root;
    }
    set root(root) {
      const { node: node11, style } = this;
      this._root = root;
      node11.innerHTML = "";
      node11.append(root.dom.node, style);
      root.parent = this;
    }
    adjustFontSize(diff) {
      this.fontSize = Math.max(8, this.fontSize + 2 * diff);
      this.node.style.fontSize = `${this.fontSize}px`;
      this.update();
      this.ensureItemVisibility(currentItem);
    }
    mergeWith(data) {
      let ids = [];
      var current2 = currentItem;
      var node11 = current2;
      while (true) {
        ids.push(node11.id);
        if (node11.parent == this) {
          break;
        }
        node11 = node11.parent;
      }
      this._root.mergeWith(data.root);
      if (current2.map) {
        let node12 = current2;
        let hidden = false;
        while (true) {
          if (node12.parent == this) {
            break;
          }
          node12 = node12.parent;
          if (node12.collapsed) {
            hidden = true;
          }
        }
        if (!hidden) {
          return;
        }
      }
    }
    get isVisible() {
      return !!this.node.parentNode;
    }
    update(options) {
      options = Object.assign({}, UPDATE_OPTIONS2, options);
      options.children && this._root.update({ parent: false, children: true });
      const { node: node11 } = this;
      const { size } = this._root;
      node11.setAttribute("width", String(size[0]));
      node11.setAttribute("height", String(size[1]));
    }
    show(where) {
      where.append(this.node);
      this.update();
      this.center();
      selectItem(this._root);
    }
    hide() {
      this.node.remove();
    }
    center() {
      let { size } = this._root;
      let parent = this.node.parentNode;
      let position = [
        (parent.offsetWidth - size[0]) / 2,
        (parent.offsetHeight - size[1]) / 2
      ].map(Math.round);
      this.moveTo(position);
    }
    moveBy(diff) {
      let position = this.position.map((p, i) => p + diff[i]);
      return this.moveTo(position);
    }
    getClosestItem(point) {
      let all2 = [];
      function scan(item) {
        let rect = item.dom.content.getBoundingClientRect();
        let dx = rect.left + rect.width / 2 - point[0];
        let dy = rect.top + rect.height / 2 - point[1];
        let distance = dx * dx + dy * dy;
        all2.push({ dx, dy, item, distance });
        if (!item.collapsed) {
          item.children.forEach(scan);
        }
      }
      scan(this._root);
      all2.sort((a, b) => a.distance - b.distance);
      return all2[0];
    }
    getItemFor(node11) {
      let content = node11.closest(".content");
      if (!content) {
        return;
      }
      function scanForContent(item) {
        if (item.dom.content == content) {
          return item;
        }
        for (let child of item.children) {
          let found = scanForContent(child);
          if (found) {
            return found;
          }
        }
      }
      return scanForContent(this._root);
    }
    ensureItemVisibility(item) {
      const padding = 10;
      let itemRect = item.dom.content.getBoundingClientRect();
      var parentRect = this.node.parentNode.getBoundingClientRect();
      var delta = [0, 0];
      var dx = parentRect.left - itemRect.left + padding;
      if (dx > 0) {
        delta[0] = dx;
      }
      var dx = parentRect.right - itemRect.right - padding;
      if (dx < 0) {
        delta[0] = dx;
      }
      var dy = parentRect.top - itemRect.top + padding;
      if (dy > 0) {
        delta[1] = dy;
      }
      var dy = parentRect.bottom - itemRect.bottom - padding;
      if (dy < 0) {
        delta[1] = dy;
      }
      if (delta[0] || delta[1]) {
        this.moveBy(delta);
      }
    }
    get name() {
      let name = this._root.text;
      return br2nl(name).replace(/\n/g, " ").replace(/<.*?>/g, "").trim();
    }
    get id() {
      return this._root.id;
    }
    pick(item, direction) {
      let candidates = [];
      var currentRect = item.dom.content.getBoundingClientRect();
      this.getPickCandidates(currentRect, this._root, direction, candidates);
      if (!candidates.length) {
        return item;
      }
      candidates.sort((a, b) => a.dist - b.dist);
      return candidates[0].item;
    }
    getPickCandidates(currentRect, item, direction, candidates) {
      if (!item.collapsed) {
        item.children.forEach((child) => {
          this.getPickCandidates(currentRect, child, direction, candidates);
        });
      }
      var node11 = item.dom.content;
      var rect = node11.getBoundingClientRect();
      if (direction == "left" || direction == "right") {
        var x1 = currentRect.left + currentRect.width / 2;
        var x2 = rect.left + rect.width / 2;
        if (direction == "left" && x2 > x1) {
          return;
        }
        if (direction == "right" && x2 < x1) {
          return;
        }
        var diff1 = currentRect.top - rect.bottom;
        var diff2 = rect.top - currentRect.bottom;
        var dist = Math.abs(x2 - x1);
      } else {
        var y1 = currentRect.top + currentRect.height / 2;
        var y2 = rect.top + rect.height / 2;
        if (direction == "top" && y2 > y1) {
          return;
        }
        if (direction == "bottom" && y2 < y1) {
          return;
        }
        var diff1 = currentRect.left - rect.right;
        var diff2 = rect.left - currentRect.right;
        var dist = Math.abs(y2 - y1);
      }
      var diff = Math.max(diff1, diff2);
      if (diff > 0) {
        return;
      }
      if (!dist || dist < diff) {
        return;
      }
      candidates.push({ item, dist });
    }
    moveTo(point) {
      this.position = point;
      this.node.style.left = `${point[0]}px`;
      this.node.style.top = `${point[1]}px`;
    }
  };
  async function init14() {
    let response = await fetch("./css/map.css");
    css = await response.text();
  }

  // .js/keyboard.js
  function handleEvent2(e) {
    let command = [...repo.values()].find((command2) => {
      if (!command2.isValid) {
        return false;
      }
      return command2.keys.find((key) => keyOK(key, e));
    });
    if (command) {
      e.preventDefault();
      command.execute(e);
    }
  }
  function init15() {
    window.addEventListener("keydown", handleEvent2);
  }
  function keyOK(key, e) {
    return Object.entries(key).every(([key2, value]) => e[key2] == value);
  }

  // .js/mouse.js
  var TOUCH_DELAY = 500;
  //var SHADOW_OFFSET = 5;
  var touchContextTimeout;
  var current = {
    mode: "",
    cursor: [],
    item: null,
    ghost: null,
    ghostPosition: [],
    previousDragState: null
  };
  var port2;
  function init16(port_) {
    port2 = port_;
    port2.addEventListener("touchstart", onDragStart);
    port2.addEventListener("mousedown", onDragStart);
    port2.addEventListener("click", (e) => {
      let item = currentMap.getItemFor(e.target);
      if (editing && item == currentItem) {
        return;
      }
      item && selectItem(item);
    });

    // zoom-in/out koleckem mysi
    port2.addEventListener("wheel", (e) => {
      const { deltaY } = e;
      if (!deltaY) {
        return;
      }
      let dir = deltaY > 0 ? -1 : 1;
      currentMap.adjustFontSize(dir);
    });
  }
  function onDragStart(e) {
    let point = eventToPoint(e);
    if (!point) {
      return;
    }
    let item = currentMap.getItemFor(e.target);

    document.activeElement.blur();
    current.cursor = point;
    if (item && !item.isRoot) {
      current.mode = "drag";
      current.item = item;
    } else {
      current.mode = "pan";
      port2.style.cursor = "move";
    }
    if (e.type == "mousedown") {
      e.preventDefault();
      port2.addEventListener("mousemove", onDragMove);
      port2.addEventListener("mouseup", onDragEnd);
    }
    if (e.type == "touchstart") {
      touchContextTimeout = setTimeout(function() {
        item && selectItem(item);
        open(point);
      }, TOUCH_DELAY);
      port2.addEventListener("touchmove", onDragMove);
      port2.addEventListener("touchend", onDragEnd);
    }
  }
  
  function onDragMove(e) {
    let point = eventToPoint(e);
    if (!point) {
      return;
    }
    clearTimeout(touchContextTimeout);
    e.preventDefault();
    let delta = [
      point[0] - current.cursor[0],
      point[1] - current.cursor[1]
    ];

    current.cursor = point;
    switch (current.mode) {
  /*
      case "drag":
        if (!current.ghost) {
          port2.style.cursor = "move";
          buildGhost(current.item);
        }
        moveGhost(delta); */
        
      case "pan":
        currentMap.moveBy(delta);
        break;
    }
  }
  
  function onDragEnd(_e) {
    clearTimeout(touchContextTimeout);
    port2.style.cursor = "";
    port2.removeEventListener("mousemove", onDragMove);
    port2.removeEventListener("mouseup", onDragEnd);
  }
  function eventToPoint(e) {
    if ("touches" in e) {
      if (e.touches.length > 1) {
        return null;
      }
      return [e.touches[0].clientX, e.touches[0].clientY];
    } else {
      return [e.clientX, e.clientY];
    }
  }
  // .js/command/select.js vyber itemu sipkami
  new class Select extends Command {
    constructor() {
      super("select", "Move selection");
      this.keys = [
        { code: "ArrowLeft", ctrlKey: false },
        { code: "ArrowUp", ctrlKey: false },
        { code: "ArrowRight", ctrlKey: false },
        { code: "ArrowDown", ctrlKey: false }
      ];
    }
    execute(e) {
      let dirs = {
        "ArrowLeft": "left",
        "ArrowUp": "top",
        "ArrowRight": "right",
        "ArrowDown": "bottom"
      };
      let dir = dirs[e.code];
      let layout = currentItem.resolvedLayout;
      let item = layout.pick(currentItem, dir);
      selectItem(item);
    }
  }();
  new class SelectRoot extends Command {
    constructor() {
      super("select-root", "Select root");
      this.keys = [{ code: "Home" }];
    }
    execute() {
      let item = currentItem;
      while (!item.isRoot) {
        item = item.parent;
      }
      selectItem(item);
    }
  }();
  // .js/my-mind.js
  var port3 = document.querySelector("main");
  var throbber = document.querySelector("#throbber"); // nacitaci kolecko
  var currentMap;
  var currentItem;
  var editing = false;
  function showMap(map) {
    currentMap && currentMap.hide();
    reset();
    currentMap = map;
    currentMap.show(port3);
  }
  function selectItem(item) {
    if (currentItem && currentItem != item) {
      if (editing) {
        repo.get("finish").execute();
      }
      currentItem.deselect();
    }
    currentItem = item;
    currentItem.select();
    currentMap.ensureItemVisibility(currentItem);
  }
  function setThrobber(visible) {
    throbber.hidden = !visible;
  }

  //...notes...
  function initNodes() {
    const title = document.getElementById('intro');
    const text = document.getElementById('text');
    const link = document.getElementById('link');
    const urlLink = document.getElementById('urlLink');

    subscribe("item-select", (_message, publisher) => {
      const item = document.querySelector('.item.current');
      const dataShape = item.getAttribute('data-shape');

      if (dataShape == "box" || dataShape == "ellipse") {
        link.style.display = "none";
      }
      else if(dataShape == "underline"){
        link.style.display = "inline-block";
      }
      
      title.innerHTML = publisher.text;
      text.innerHTML = publisher.notes;   
      
      var href = $(publisher.link).prop('href');
      link.href = href;
      
      urlLink.href = publisher._urlLink;
      urlLink.innerHTML = publisher._urlText;

      //open all ahref in new tab
      $('a').each(function(){
        // $(this).attr('target', '_blank') + $(this).attr('rel', 'noopener noreferrer');
      });
    });
  }
  function openModal(modal){
    if (modal == null) return; 
    modal.classList.add('active');
    overlay.classList.add('active');
  }
  function closeModal(modal){
    if (modal == null) return; 
    const modalBody = document.querySelector('.modal-body');
    modal.classList.remove('active');
    modalBody.scrollTop = 0;
    overlay.classList.remove('active');
  }

  function initButtons(){
    var button = document.getElementById('openModal');

    Array.prototype.forEach.call(
      document.querySelectorAll('[data-modal-target]'),
      function(element) {
        element.onclick = showModal;
      }
    );
    var button = document.getElementById('openModal');
    setTimeout(() => {
      button.click();
    }, 2000);
  }
  function showModal(){
    initNodes();
    const openModalButtons = document.querySelectorAll('[data-modal-target]');
    const closeModalButtons = document.querySelectorAll('[data-close-button]');
    const overlay = document.getElementById('overlay');
    openModalButtons.forEach(button =>{
      button.addEventListener('click',() =>{
        const modal = document.querySelector(button.dataset.modalTarget);
        openModal(modal);
      });
    });
    closeModalButtons.forEach(button =>{
      button.addEventListener('click',() =>{
        const modal = button.closest('.modal');
        closeModal(modal);
      });
    });
    overlay.addEventListener('click', () => {
      const modals = document.querySelectorAll('.modal.active');
      modals.forEach(modal => {
        closeModal(modal);
      });
    });
  }


  // HELP MODAL
  const helpBtn = document.querySelector('.help-btn');
  const closeHelpBtn = document.querySelector('.close-btn');
  const helpModal = document.getElementById('help');
  helpBtn.onclick = function () {
    if (helpModal.hidden == true) {
      helpModal.removeAttribute('hidden'); 
    } else {
      helpModal.hidden = true; 
    }
  };
  closeHelpBtn.onclick = function () {
    helpModal.hidden = true;
  }

  // ===== AUTOLOAD JSON =====
    function loadMapJSON() {
      fetch('../cgi/my-mind_export.json')
          .then(response => {
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              setThrobber(true);
              throw "Oops, we haven't got JSON!";
            }
            return response.json();
          })
          .then(json => {
            setThrobber(false);
            showMap(Map2.fromJSON(json));
          })
          .catch(error => alert(error));
    }

  async function init19() {
    await init14();
    subscribe("ui-change", syncPort);
    window.addEventListener("resize", syncPort);
    // window.addEventListener("beforeunload", (e) => {
    //  e.preventDefault();
    //  return "";
    // });
    init15(); // pohyb klavesami
    init16(port3); // posouvani mysi
    syncPort();
    loadMapJSON();
    $( document ).ready( initButtons );
  }
  function syncPort() {
    let portSize = [window.innerWidth - getWidth(), window.innerHeight];
    port3.style.width = portSize[0] + "px";
    port3.style.height = portSize[1] + "px";
    currentMap && currentMap.ensureItemVisibility(currentItem);
  }
  init19();
})();
