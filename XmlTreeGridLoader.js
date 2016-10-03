Ext.ns('Ext.ux.tree');

Ext.ux.tree.XmlTreeGridLoader = Ext.extend(Ext.ux.tree.TreeGridLoader, {
    xmlToJson: function(elem, level) {
        level = level || 0;
        var o = {};
        
        for (var i = 0; i < elem.attributes.length; i++) {
            var attr = elem.attributes.item(i);
            o[attr.nodeName] = this.xmlAttrHandler(attr);
        }
        
        o.menuType = o.menuType || elem.nodeName;
        o.type = o.type || elem.nodeName;
        
        if (this.autoExpand) {
            if (typeof this.autoExpand === 'number') {
                if (this.autoExpand > level) {
                    o.expanded = true;
                }
            } else {
                o.expanded = true;
            }
        }
        
        if (this.autoLeafs) {
            o.leaf = !(elem.childNodes.length);
        }
        
        if (this.replaceIds) {
            o[this.replaceIds] = o.id;
            o.id = this.replaceIds+Math.random();
        }
        
        for (var i = 0; i < elem.childNodes.length; i++) {
            var item = elem.childNodes.item(i);
            if (item.nodeType === 1) {
                // An XML DOM element have the node type = 1.
                // See the list of the types on the
                // http://www.w3schools.com/dom/dom_nodetype.asp
                o.children = o.children ? o.children : [];
                o.children.push(this.xmlToJson(item, level + 1));
            }
        }
        return o;
    },

    xmlAttrHandler: function(attr) {
        var value = attr.nodeValue;
        var booleanProperties = [
            'allowChildren', 'allowDrag', 'allowDrop', 'disabled', 'draggable',
            'editable', 'expandable', 'expanded', 'hidden', 'isTarget', 'leaf',
            'singleClickExpand'
        ];
        if (booleanProperties.indexOf(attr.nodeName) > -1) {
            value = attr.nodeValue === 'true';
        }
        if (this.xmlAttrSubHandler) {
            value = this.xmlAttrSubHandler(attr, value);
        }
        return value;
    },

    // Just sapmle function. It could be defined in config.
    xmlAttrSubHandler: function(attr, preparedValue) {
        return preparedValue;
    },
    
    // Overide Ext.ux.tree.TreeGridLoader the private processResponse
    // method so it works with an xml response.
    processResponse: function(response, node, callback, scope){
        try {
            var xmlData = response.responseXML;
            var root = xmlData.documentElement || xmlData;
            var o = this.xmlToJson(root);
            o = o.children || [];
            node.beginUpdate();
            for(var i = 0, len = o.length; i < len; i++){
                var n = this.createNode(o[i]);
                if(n){
                    node.appendChild(n);
                }
            }
            node.endUpdate();
            this.runCallback(callback, scope || node, [node]);
        }catch(e){
            this.handleFailure(response);
        }
    }
});
