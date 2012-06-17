/**
* Module that contains the tree data structure implementations.
* Depends on core.js, datastructures.js, anim.js, utils.js
*/
(function($) {
  "use strict";
  if (typeof JSAV === "undefined") { return; }
  var Edge = JSAV._types.ds.Edge; // shortcut to JSAV Edge

  var Tree = function(jsav, options) {
    this.init(jsav, options);
  };
  var treeproto = Tree.prototype;
  $.extend(treeproto, JSAV._types.ds.common);
  treeproto.init = function(jsav, options) {
    this._layoutDone = false;
    this.jsav = jsav;
    this.options = options;
    var el = this.options.element || $("<div/>");
    el.addClass("jsavtree jsavcommontree");
    for (var key in this.options) {
      var val = this.options[key];
      if (this.options.hasOwnProperty(key) && typeof(val) === "string" ||
            typeof(val) === "number" || typeof(val) === "boolean") {
        el.attr("data-" + key, val);
      }
    }
    if (!this.options.element) {
      $(this.jsav.canvas).append(el);
    }
    this.element = el;
    JSAV.utils._helpers.handlePosition(this);
    this.rootnode = this.newNode("", null);
    this.element.attr({"data-root": this.rootnode.id(), "id": this.id()});
    this.rootnode.element.attr("data-child-role", "root");
    JSAV.utils._helpers.handleVisibility(this, this.options);
  };
  treeproto._setrootnode = JSAV.anim(function(node) {
    var oldroot = this.rootnode;
    this.rootnode = node;
    this.element.attr("data-root", node.id());
    node.element.attr("data-child-role", "root");
    return [oldroot];
  });
  treeproto.root = function(newRoot, options) {
    if (typeof newRoot === "undefined") {
      return this.rootnode;
    } else if (newRoot.constructor === TreeNode) {
      this._setrootnode(newRoot, options);
    } else {
      if (this.rootnode) {
        this.rootnode.value(newRoot, options);
      } else {
        this._setrootnode(this.newNode(newRoot, null, options), options);
      }
    }
    return this.rootnode;
  };
  treeproto.clear = function() {
    this.root().clear();
    this.element.remove();
  };
  treeproto.newNode = function(value, parent, options) {
    return new TreeNode(this, value, parent, options);
  };
  treeproto.height = function() {
    return this.rootnode.height();
  };
  treeproto.layout = function(options) {
    var layoutAlg = this.options.layout || "_default";
    this.jsav.ds.layout.tree[layoutAlg](this, options);
  };
  treeproto.equals = function(otherTree, options) {
    if (!otherTree instanceof Tree) {
      return false;
    }
    return this.root().equals(otherTree.root(), options);
  };
  treeproto.css = JSAV.utils._helpers.css;
  treeproto._setcss = JSAV.anim(JSAV.utils._helpers._setcss);

  treeproto.state = function(newState) {
    // TODO: Should tree.state be implemented??? Probably..
  };

  JSAV.utils._events._addEventSupport(treeproto);
  
  var TreeNode = function(container, value, parent, options) {
    this.init(container, value, parent, options);
  };
  var nodeproto = TreeNode.prototype;
  $.extend(nodeproto, JSAV._types.ds.Node.prototype);
  nodeproto.init = function(container, value, parent, options) {
    this.jsav = container.jsav;
    this.container = container;
    this.parentnode = parent;
    this.options = $.extend(true, {visible: true}, options);
    var el = this.options.nodeelement || $("<div>" + this._valstring(value) + "</div>"),
      valtype = typeof(value);
    if (valtype === "object") { valtype = "string"; }
    this.element = el;
    el.addClass("jsavnode jsavtreenode")
        .attr({"data-value": value, "id": this.id(), "data-value-type": valtype })
        .data("node", this);
    if (parent) {
      el.attr("data-parent", parent.id());
    }
    this.container.element.append(el);

    JSAV.utils._helpers.handleVisibility(this, this.options);
    if (parent) {
      this._edgetoparent = new Edge(this.jsav, this, parent);
      if (this.options.edgeLabel) {
        this._edgetoparent.label(this.options.edgeLabel);
      }
    }
    this.childnodes = [];
  };
  nodeproto._valstring = function(value) {
    var valstr = "<span class='jsavvalue'>";
    if (value === "jsavnull") {
      return valstr + "</span>";
    }
    return valstr + value + "</span>";
  };
  nodeproto.parent = function(newParent, options) {
    if (typeof newParent === "undefined") {
      return this.parentnode;
    } else {
      if (!this._edgetoparent) {
        this._edgetoparent = new Edge(this.jsav, this, newParent, options);
      } else {
        this._edgetoparent.end(newParent, options);
        if (options && options.edgeLabel) {
          this._edgetoparent.label(options.edgeLabel, options);
        }
      }
      this.element.attr("data-parent", newParent?newParent.id():"");
      this.parentnode = newParent;
    }
  };
  nodeproto.edgeToParent = function(edge) {
    if (typeof edge === "undefined") {
      return this._edgetoparent;
    } else {
      this._edgetoparent = edge;
      return this;
    }
  };
  nodeproto.edgeToChild = function(pos) {
    var child = this.child(pos);
    if (child) {
      return child.edgeToParent();
    } else {
      return undefined;
    }
  };
  nodeproto.clear = function() {
    if (this.edgeToParent()) {
      this.edgeToParent().clear();
    }
    var ch = this.children();
    for (var i = ch.length; i--; ) {
      if (ch[i]) {
        ch[i].clear();
      }
    }
    this.childnodes = [];
    this.element.remove();
  };
  nodeproto.addChild = function(node, options) {
    var pos = this.childnodes.length;
    if (typeof node === "string" || typeof node === "number") {
      node = this.container.newNode(node, this, options);
    }
    this._setchild(pos, node, null, options);
    return this;
  };
  nodeproto._setchild = JSAV.anim(function(pos, node, shift, options) {
    var oldval = this.childnodes[pos];
    if (oldval && !shift) {
      oldval.parent(null);
    }
    if (node) {
      node.parent(this, options);
      if (!shift) {
        this.childnodes[pos] = node;
        node.element.attr("data-child-pos", pos);
      } else { // a child was deleted, we want to shift rest of children forward
        var newchildren = [];
        if (pos === 0) { // adding as first child
          this.childnodes.unshift(node);
        } else if (pos === this.childnodes.length) { // adding as last child
          this.childnodes.push(node);
        } else { // adding in the middle
          for (var i = 0, l = this.childnodes.length; i < l; i++) {
            if (i === pos) {
              newchildren.push(node);
            }
            newchildren.push(this.childnodes[i]);
          }
          this.childnodes = newchildren;
        }
      $.each(this.childnodes, function(index, n) {
        n.element.attr("data-child-pos", index);
      });
      }
    } else {
      delete this.childnodes[pos];
      this.childnodes = $.map(this.childnodes, function(item) {return item;});
      $.each(this.childnodes, function(index, n) {
        n.element.attr("data-child-pos", index);
      });
      return [pos, oldval, true];
    }
    return [pos, oldval];
  });
  nodeproto.child = function(pos, node, options) {
    if (typeof node === "undefined") {
      return this.childnodes[pos];
    } else {
      this._setchild(pos, node, null, options);
    }
  };
  nodeproto.height = function() {
    var chs = this.children(),
      maxheight = 0,
      max = Math.max;
    for (var i=0, l=chs.length; i < l; i++) {
      if (chs[i]) {
        maxheight = max(maxheight, chs[i].height());
      }
    }
    return maxheight + 1;
  };
  nodeproto.equals = function(otherNode, options) {
    if (!otherNode || this.value() !== otherNode.value()) {
      return false;
    }
    var cssprop, equal;
    if (options && 'css' in options) { // if comparing css properties
      if ($.isArray(options.css)) { // array of property names
        for (var i = 0; i < options.css.length; i++) {
          cssprop = options.css[i];
          equal = (this.css(cssprop) === otherNode.css(cssprop));
          if (!equal) { return false; }
        }
      } else { // if not array, expect it to be a property name string
        cssprop = options.css;
        equal = (this.css(cssprop) === otherNode.css(cssprop));
        if (!equal) { return false; }
      }
    }
    // compare edge style
    if (this.edgeToParent()) {
      equal = this.edgeToParent().equals(otherNode.edgeToParent(), options);
    }
    // compare children
    var ch = this.children(),
        och = otherNode.children();
    if (ch.length !== och.length) {
      return false;
    }
    for (var j = 0, l = ch.length; j < l; j++) {
      if (ch[j] && och[j] && !ch[j].equals(och[j], options)) {
        return false;
      }
    }
    return true; // values equal, nothing else to compare
  };
  nodeproto.children = function() {
    return this.childnodes;
  };
  nodeproto.state = function() {
    // TODO: Should this be implemented??? Probably..
  };
  
  
  /// Binary Tree implementation
  var BinaryTree = function(jsav, options) {
    this.init(jsav, options);
    this.element.addClass("jsavbinarytree");
  };
  var bintreeproto = BinaryTree.prototype;
  $.extend(bintreeproto, treeproto);
  bintreeproto.newNode = function(value, parent, options) {
    return new BinaryTreeNode(this, value, parent, options);
  };
  
  
  /// Binary Tree Node implementation
  var BinaryTreeNode = function(container, value, parent, options) {
    this.init(container, value, parent, options);
    this.element.addClass("jsavbinarynode");
  };
  var binnodeproto = BinaryTreeNode.prototype;
  $.extend(binnodeproto, nodeproto);

  // a general setchild method for bintreenode, pos parameter
  // should be either 0 (left) or 1 (right), node is the new child
  function setchild(self, pos, node, options) {
    var oPos = pos?0:1,
        other;
    if (typeof node === "undefined") {
      if (self.child(pos) && self.child(pos).value() !== "jsavnull") {
        return self.child(pos);
      } else {
        return undefined;
      }
    } else if (node && node.constructor === BinaryTreeNode) {
      self.child(pos, node, options);
    } else {
      var nullopts = $.extend({}, options);
      nullopts.edgeLabel = undefined;
      if (node === null) { // node is null, remove child
        if (self.child(pos) && self.child(pos).value() !== "jsavnull") {
          // child exists
          if (!self.child(oPos) || self.child(oPos).value() === "jsavnull") { // ..but no other child
            self.child(pos, null, options);
            self.child(oPos, null, options);
          } else { // other child exists
            // create a null node and set it as other child
            other = self.container.newNode("jsavnull", self, nullopts);
            other.element.addClass("jsavnullnode").attr("data-binchildrole", pos?"right":"left");
            self.child(pos, other, options, nullopts);
          }
        }
        // if no such child so nothing needs to be done
      } else if (self.child(pos)) {
        self.child(pos).value(node, options);
      } else {
        var newNode = self.container.newNode(node, self, options);
        self.child(pos, newNode, options);
        newNode.element.attr("data-binchildrole", pos?"right":"left");
        if (!self.child(oPos)) {
          other = self.container.newNode("jsavnull", self, nullopts);
          other.element.addClass("jsavnullnode").attr("data-binchildrole", oPos?"right":"left");
          self.child(oPos, other, nullopts);
        }
        return newNode;
      }
    }
    return self.child(1);
  }
  binnodeproto.left = function(node, options) {
    return setchild(this, 0, node, options);
  };
  binnodeproto.right = function(node, options) {
    return setchild(this, 1, node, options);
  };
  binnodeproto.edgeToLeft = function() {
    return this.edgeToChild(0);
  };
  binnodeproto.edgeToRight = function() {
    return this.edgeToChild(1);
  };
  binnodeproto._setvalue = JSAV.anim(function(newValue) {
    var oldVal = this.element.removeClass("jsavnullnode")
          .attr("data-value"),
        valtype = typeof(newValue);
    if (valtype === "object") { valtype = "string"; }
    this.element.html(this._valstring(newValue)).attr({"data-value": newValue, "data-value-type": valtype});
    if (newValue === "jsavnull") {
      this.element.addClass("jsavnullnode");
    }
    return [oldVal];
  });
    
  // expose the types to JSAV._types.ds
  var dstypes = JSAV._types.ds;
  dstypes.Tree = Tree;
  dstypes.TreeNode = TreeNode;
  dstypes.BinaryTree = BinaryTree;
  dstypes.BinaryTreeNode = BinaryTreeNode;

  // add functions to jsav.ds to create tree, bintree, end edge
  JSAV.ext.ds.tree = function(options) {
    return new Tree(this, $.extend(true, {visible: true}, options));
  };
  JSAV.ext.ds.bintree = function(options) {
    return new BinaryTree(this, $.extend(true, {visible: true}, options));
  };
  JSAV.ext.ds.edge = function(options) {
    return new Edge(this, $.extend(true, {}, options));
  };
}(jQuery));

// Tree layout
(function($) {
  "use strict";
  function treeLayout(tree, options) {
    var opts = $.extend({}, tree.options, options),
        NODEGAP = opts.nodegap || 40,
        results = {};
    var compactArray = function(arr) {
          return $.map(arr, function(item) { return item || null; });
        };
    var calculateLayout = function(node) {
      var ch = compactArray(node.children());
      for (var i = 0, l=ch.length; i < l; i++) {
        if (ch[i]) {
          calculateLayout(ch[i]);
        }
      }
      results[node.id()] = {
        cachedTranslation: {width: 0, height: 0},
        translation: {width: 0, height: 0},
        node: node
      };
      calculateContours(node);
    },
    calculateContours = function(node) {
      var children = compactArray(node.children()),
        resnode = results[node.id()];
      var nodeWidth = node.element.outerWidth()/2.0,
          nodeHeight = node.element.outerHeight();
      if (children.length === 0) {
        resnode.contours = new TreeContours(-nodeWidth, nodeWidth + (nodeWidth % 2 === 0 ? 0 : 1),
                          nodeHeight, node.value());
        translateThisNode(node, -nodeWidth, 0);
      } else {
        var transSum = 0;
        var firstChild = children[0];
        resnode.contours = results[firstChild.id()].contours;
        results[firstChild.id()].contours = null;
        translateNodes(firstChild, 0, NODEGAP + nodeHeight);

        for (var i = 1, l = children.length; i < l; i++) {
          var child = children[i];
          if (!child) { continue; }
          var childC = results[child.id()].contours;
          var trans = resnode.contours.calcTranslation(childC, NODEGAP);
          transSum += trans;

          results[child.id()].contours = null;
          resnode.contours.joinWith(childC, trans);

          translateNodes(child, getXTranslation(firstChild) + trans - getXTranslation(child),
                                    NODEGAP + nodeHeight);
        }

        var rootTrans = transSum / children.length;
        resnode.contours.addOnTop(-nodeWidth, nodeWidth + (nodeWidth % 2 === 0 ? 0 : 1),
                  nodeHeight, NODEGAP, rootTrans);
        translateThisNode(node, getXTranslation(firstChild) + rootTrans, 0);
      }
    },
    translateThisNode = function(node, x, y) {
      var restrans = results[node.id()].translation;
      restrans.width += x;
      restrans.height += y;
    },
    translateNodes = function(node, x, y) {
      if (!node) { return; }
      var restrans = results[node.id()].cachedTranslation;
      if (!restrans) {
        restrans = {width: 0, height: 0};
        results[node.id()].cachedTranslation = restrans;
      }
      restrans.width += x;
      restrans.height += y;
    },
    getXTranslation = function(node) {
      var restrans = results[node.id()].cachedTranslation;
      return results[node.id()].translation.width +
        ((!restrans) ? 0 : restrans.width);
    },
    propagateTranslations = function(node) {
      if (!node) { return; }
      var noderes = results[node.id()];
      if (noderes.cachedTranslation) {
        var ch = compactArray(node.children());
        for (var i = 0, l = ch.length; i < l; i++) {
          var child = ch[i];
          translateNodes(child, noderes.cachedTranslation.width, noderes.cachedTranslation.height);
          propagateTranslations(child);
        }
        noderes.translation.width += noderes.cachedTranslation.width;
        noderes.translation.height += noderes.cachedTranslation.height;
        noderes.cachedTranslation = null;
      }
    },
    root = tree.root();
    
    calculateLayout(root);
    translateNodes(root, 20, 10 + NODEGAP);
    propagateTranslations(root);
    var maxX = -1, maxY = -1, max = Math.max, previousLayout = tree._layoutDone;
    $.each(results, function(key, value) {
      var oldPos = value.node.element.position();
      if (!previousLayout || (oldPos.left === 0 && oldPos.top === 0)) {
        value.node.element.css({left: value.translation.width + "px", top: value.translation.height + "px"});
      } else {
        value.node.css({left: value.translation.width + "px", top: value.translation.height + "px"});
      }
      maxX = max(maxX, value.translation.width + value.node.element.outerWidth());
      maxY = max(maxY, value.translation.height + value.node.element.outerHeight());
    });
    tree.element.width(maxX);
    tree.element.height(maxY);
    
    var centerTree = function() {
      // if options center is not set to truthy value, center it
      if (tree.options.hasOwnProperty("center") && !tree.options.center) {
        return;
      }
      var containerWidth = $(tree.jsav.canvas).width();
      if (!previousLayout) {
        tree.element.css({"left": (containerWidth - maxX)/2});
      } else {
        tree.css({"left": (containerWidth - maxX)/2}, opts);
      }
    };

    // center the tree inside its parent container
    centerTree(tree);
    tree._layoutDone = true;

    var offset = tree.element.position();
    $.each(results, function(key, value) {
      var node = value.node;
      if (node._edgetoparent) {
        var start = {left: value.translation.width,// + offset.left,
                     top: value.translation.height},// + offset.top},
            endnode = results[node.parent().id()].translation,
            end = {left: endnode.width,// + offset.left,
                   top: endnode.height};// + offset.top};
        edgeLayout(node._edgetoparent, start, end, opts);
      }
    });
  }
  

  function normalizeAngle(angle) {
    var pi = Math.PI;
    while (angle < 0) {
      angle += 2 * pi;
    }
    while (angle >= 2 * pi) {
      angle -= 2 * pi;
    }
    return angle;
  }

  function getNodeBorderAtAngle(pos, node, dim, angle) {
    // dim: x, y coords of center and half of width and height
    var x, y, pi = Math.PI,
        urCornerA = Math.atan2(dim.height*2.0, dim.width*2.0),
        ulCornerA = pi - urCornerA,
        lrCornerA = 2*pi - urCornerA,
        llCornerA = urCornerA + pi;

    if (angle < urCornerA || angle > lrCornerA) { // on right side
      x = dim.x + dim.width;
      y = dim.y - (dim.width) * Math.tan(angle);
    } else if (angle > ulCornerA && angle < llCornerA) { // left
      x = dim.x - dim.width;
      y = dim.y + (dim.width) * Math.tan(angle - pi);
    } else if (angle <= ulCornerA) { // top
      x = dim.x + (dim.height) / Math.tan(angle);
      y = dim.y- dim.height;
    } else { // on bottom side
      x = dim.x - (dim.height) / Math.tan(angle - pi);
      y = dim.y + dim.height;
    }
    return [pos, Math.round(x), Math.round(y)];
  }

  var edgeLayout = function(edge, start, end, opts) {
    var sElem = edge.startnode.element,
        eElem = edge.endnode.element,
        sWidth = sElem.outerWidth()/2.0,
        eWidth = eElem.outerWidth()/2.0,
        sHeight = sElem.outerHeight()/2.0,
        eHeight = eElem.outerHeight()/2.0,
        svgstyle = edge.jsav.getSvg().canvas.style,
        svgleft = svgstyle.left || 0,
        svgtop = svgstyle.top || 0,
        pi = Math.PI,
        startpos = sElem.offset(),
        endpos = eElem.offset(),
        fromX =  Math.round(start.left + sWidth - parseInt(svgleft, 10)),
        fromY = Math.round(start.top - parseInt(svgtop, 10)),
        toX = Math.round(end.left + eWidth - parseInt(svgleft, 10)),
        toY = Math.round(end.top + eHeight - parseInt(svgtop, 10)),
        toAngle = normalizeAngle(2*pi - Math.atan2(fromY - toY, fromX - toX)),
        fromPoint = [0, fromX, fromY], // from point is the lower node, position at top
        toPoint = getNodeBorderAtAngle(1, edge.endnode.element,
                  {width: eWidth, height: eHeight, x: toX, y: toY}, toAngle);
    edge.g.movePoints([fromPoint, toPoint], opts);
    edge.layout(opts);
  };
  
  var layouts = JSAV.ext.ds.layout;
  layouts.tree = {
    "_default": treeLayout
  };
  layouts.edge = {
    "_default": edgeLayout
  };

var TreeContours = function(left, right, height, data) {
    this.cHeight = height;
    this.leftCDims = [];
    this.leftCDims[this.leftCDims.length] = {width: -left, height: height};
    this.cLeftExtent = left;
    this.rightCDims = [];
    this.rightCDims[this.rightCDims.length] = {width: -right, height: height};
    this.cRightExtent = right;
  };
TreeContours.prototype = {
  addOnTop: function(left, right, height, addHeight, originTrans) {
    var lCD = this.leftCDims,
        rCD = this.rightCDims;
    lCD[lCD.length-1].height += addHeight;
    lCD[lCD.length-1].width += originTrans + left;
    rCD[rCD.length-1].height += addHeight;
    rCD[rCD.length-1].width += originTrans + right;

    lCD.push({width: -left, height: height});
    rCD.push({width: -right, height: height});
    this.cHeight += height + addHeight;
    this.cLeftExtent -= originTrans;
    this.cRightExtent -= originTrans;
    if (left < this.cLeftExtent) {
      this.cLeftExtent = left;
    }
    if (right > this.cRightExtent) {
      this.cRightExtent = right;
    }
  },
  joinWith: function(other, hDist) {
    var thisCDisp, otherCDisp, middle;
    if (other.cHeight > this.cHeight) {
      var newLeftC = [];
      var otherLeft = other.cHeight - this.cHeight;
      thisCDisp = 0;
      otherCDisp = 0;
      $.each(other.leftCDims, function (index, item) {
        if (otherLeft > 0 ) {
          var dim = {width: item.width, height: item.height};
          otherLeft -= item.height;
          if (otherLeft < 0) {
            dim.height += otherLeft;
          }
          newLeftC[newLeftC.length] = dim;
        } else {
          otherCDisp += item.width;
        }
      });
      middle = newLeftC[newLeftC.length - 1];

      $.each(this.leftCDims, function(index, item) {
        thisCDisp += item.width;
        newLeftC[newLeftC.length] = {width: item.width, height: item.height};
      });
               
      middle.width -= thisCDisp - otherCDisp;
      middle.width -= hDist;
      this.leftCDims = newLeftC;
    }
    if (other.cHeight >= this.cHeight) {
      this.rightCDims = other.rightCDims.slice();
    } else {
      var thisLeft = this.cHeight - other.cHeight;
      var nextIndex = 0;

      thisCDisp = 0;
      otherCDisp = 0;
      $.each(this.rightCDims, function (index, item) {
        if (thisLeft > 0 ) {
          nextIndex++;
          thisLeft -= item.height;
          if (thisLeft < 0) {
            item.height += thisLeft;
          }
        } else {
          thisCDisp += item.width;
        }
      });
      for (var i = nextIndex + 1, l=this.rightCDims.length; i < l; i++) {
        this.rightCDims[i] = null;
      }
      this.rightCDims = $.map(this.rightCDims, function(item) {return item;});
      middle = this.rightCDims[nextIndex];

      for (i = 0, l=other.rightCDims.length; i < l; i++) {
        var item = other.rightCDims[i];
        otherCDisp += item.width;
        this.rightCDims[this.rightCDims.length] = {width: item.width, height: item.height};
      }
      middle.width += thisCDisp - otherCDisp;
      middle.width += hDist;
    }
    this.rightCDims[this.rightCDims.length-1].width -= hDist;

    if (other.cHeight > this.cHeight) {
      this.cHeight = other.cHeight;
    }
    if (other.cLeftExtent + hDist < this.cLeftExtent) {
      this.cLeftExtent = other.cLeftExtent + hDist;
    }
    if (other.cRightExtent + hDist > this.cRightExtent) {
      this.cRightExtent = other.cRightExtent + hDist;
    }
  },
  calcTranslation: function(other, wantedDist) {
    var lc = this.rightCDims,
        rc = other.leftCDims,
        li = lc.length - 1,
        ri = rc.length - 1,
        lCumD = {width: 0, height: 0},
        rCumD = {width: 0, height: 0},
        displacement = wantedDist,
        ld, rd;

    while (true) {
      if (li < 0) {
        if (ri < 0 || rCumD.height >= lCumD.height) {
          break;
        }
        rd = rc[ri];
        rCumD.height += rd.height;
        rCumD.width += rd.width;
        ri--;
      } else if (ri < 0) {
        if (lCumD.height >= rCumD.height) {
          break;
        }
        ld = lc[li];
        lCumD.height += ld.height;
        lCumD.width += ld.width;
        li--;
      } else {
        ld = lc[li];
        rd = rc[ri];
        var leftNewHeight = lCumD.height,
            rightNewHeight = rCumD.height;
        if (leftNewHeight <= rightNewHeight) {
          lCumD.height += ld.height;
          lCumD.width += ld.width;
          li--;
        }
        if (rightNewHeight <= leftNewHeight) {
          rCumD.height += rd.height;
          rCumD.width += rd.width;
          ri--;
        }
      }
      if (displacement < rCumD.width - lCumD.width + wantedDist) {
        displacement = rCumD.width - lCumD.width + wantedDist;
      }
    }
    return displacement;
  }
};
}(jQuery));