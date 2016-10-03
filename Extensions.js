/**
 * generate xml string for Ext.tree.TreeNode object
 *
 * config options:
 * {
 *   tagNameAttr: 'type', // name of attribute to use as tag name
 *   attrs: ['size', 'name', 'id'], // name of attribute to include. If not passed, all attrs are included
 *   skipAttrsTags: ['section', 'subSection', 'id'] // name of tags that don't need attributes
 * }
 **/
Ext.tree.TreeNode.prototype.toXml = function(config, level, order) {

    var level = level || 0;
    var order = order || 0;

    if (!config)
        config = {format: true};

    if (!config.tagNameAttr){
      config.tagNameAttr = 'type';
    }

    if (!config.addDisplayOrder){
      config.addDisplayOrder = [];
    }



    var tagNameAttr = this.attributes[config.tagNameAttr] ;
   // debug(tagNameAttr);

    // opening tag
    var s = (config.format ? this.getLevelIndent(level) : '') +
            "<" + tagNameAttr
            + ( ( !config.skipAttrsTags || !config.skipAttrsTags.inArray(tagNameAttr)) ? this.getAttrs(this.attributes, config) : '')
            + this.displayOrder(tagNameAttr , order, config)
            + ">" + (config.format ? "\n" : '');

    // child tags
    if (this.childNodes) {
        var dispcount = 0;
        for (var i = 0; i < this.childNodes.length; i++) {

           // if (this.childNodes[i].attributes[config.tagNameAttr] == 'subSection' || this.childNodes[i].attributes[config.tagNameAttr] == 'category' ){
            if (config.addDisplayOrder.inArray(this.childNodes[i].attributes[config.tagNameAttr] ) ){
               dispcount++;
            }

            s += this.childNodes[i].toXml(config, level + 1 , dispcount);

        }
    }

    // closing tag
    s +=  (config.format ? this.getLevelIndent(level) : '') +
            "</" + tagNameAttr + ">" +
            (config.format ? "\n" : '');

    return s;
};

Ext.tree.TreeNode.prototype.displayOrder = function(attr , order , config) {

   // debug(attr);

    // todo sections order in segment
    if (attr == 'section'){
       // return  ' displayOrder = "' + order + '"';
    }

   // if (attr == 'subSection' || attr == 'category' ){
    if (config.addDisplayOrder.inArray(attr)){
        return  ' displayOrder="' + order  + '"';
    }
    return '';
    
};


Ext.tree.TreeNode.prototype.getAttrs = function(attributes, config) {
    var s = "";
    for (key in attributes) {
        if
                (
                !attributes.hasOwnProperty(key) ||
                        typeof(attributes[key]) == 'function' ||
                        typeof(attributes[key]) == 'object' ||
                        typeof(attributes[key]) == 'null' ||
                        (config.attrs && !config.attrs.inArray(key)) ||
                        (
                                config.skipAttrTagsArray &&
                                        config.skipAttrTagsArray[attributes[config.tagNameAttr]] &&
                                        config.skipAttrTagsArray[attributes[config.tagNameAttr]].inArray(key)
                                )
                ) {
            continue;
        }
        s = s + " " + key + "=\"" + attributes[key] + "\"";
    }
    return s;
};

Ext.tree.TreeNode.prototype.getLevelIndent = function(x) {
    var s = "";
    for (var i = 0; i < x; i++)
        s = s + "    ";
    return s;
};
/**
 * end of Ext.tree.TreeNode.prototype.toXml
 **/

// clone treeNode
Ext.override(Ext.tree.TreeNode, {
    clone: function() {
        //forces creation of a new id by removing the original.
        var atts = this.attributes;
        atts.id = undefined;
        var newNode = new Ext.tree.TreeNode(Ext.apply({}, atts));
        newNode.text = this.text;

        for (var i = 0; i < this.childNodes.length; i++) {
            newNode.appendChild(this.childNodes[i].clone());
        }
        return newNode;
    }
});

Ext.ux.clone = function(o) {
    return Ext.apply({}, o);
};

Array.prototype.inArray = function(value) {
    var i;
    for (i = 0; i < this.length; i++) {
        if (this[i] === value)
            return true;
    }
    return false;
};

String.prototype.trim = function() {
    var re = /^\s+|\s+$/g;
    return function() {
        return this.replace(re, "");
    };
}();

String.prototype.endsWith = function(s) {
    return this.match(s + "$") == s;
};

// convert string to number and format with commas
String.prototype.numberWithCommas = function(separator) {
    separator = separator || ",";
    return Number(this).withCommas(separator);
};

String.prototype.htmlEncode = function() {
    return Ext.util.Format.htmlEncode(this);
};

String.prototype.htmlDecode = function() {
    return Ext.util.Format.htmlDecode(this);
};

String.prototype.strpos = function (needle) {
    var i = (this + '').indexOf(needle);
    return i === -1 ? false : i;
};

// format number: add commas
Number.prototype.withCommas = function(separator) {
    separator = separator || ",";
    var d = this.toString().split(/\./);
    d[0] = d[0].replace(/(\d)(?=(\d\d\d)+$)/g, "$1" + separator);
    return d[0] + (d[1] ? '.' + d[1] : '');
};

Ext.namespace('Ext.ux.form');
if (Ext.ux.form.LovCombo) {
    Ext.override(Ext.ux.form.LovCombo, {
        beforeBlur: Ext.emptyFn
    });
}
