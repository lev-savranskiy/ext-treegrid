// !!! TODO make "AND" label centered and css tunable
Ext.namespace('App');

/**
 * App.AudienceSegments: TreeGrid and menus
 */

var HACK_GLOBAL_CURRENT_NODE = null;  // RD

App.AudienceSegmentsUtils = {

    //getFromUrl: function(name) {   return  getUrlVar(name) },

    //getSectionId: function() {   return  getUrlVar('section') },

    isSeparatePage : function() {
        return App.Common.getUrlParam('segment', 'int') > 0;
    },
    isSeparatePageEdit : function() {
        return App.AudienceSegmentsUtils.isSeparatePage() && App.Common.getUrlParam('section', 'int') > 0;
    },
    getDataSourceId : function(obj) {


        //debug(Ext.getCmp('app-data-source-combo').getStore().getAt(0).data.id);
        debug('app-data-source-combo value = ' + Ext.getCmp('app-data-source-combo').getValue());
        //  debug('isnumber? ' +  isnumber(Ext.getCmp('app-data-source-combo').getValue()));

        return isnumber(Ext.getCmp('app-data-source-combo').getValue()) ? Ext.getCmp('app-data-source-combo').getValue() : (!! obj && !! obj.dataSourceId ? obj.dataSourceId : dataSourceIdDefault);
        // return !! obj && !!obj.dataSourceId && isnumber(obj.dataSourceId)?  obj.dataSourceId : dataSourceIdDefault;

    },

    getDataSourceName: function(id) {
        var res = Ext.getCmp('app-data-source-combo').getStore().getById(id);
        // debug(Ext.getCmp('app-data-source-combo'));
        return !!res && !!res.data && !!res.data.name ? res.data.name : '';
    },

    //  if you change it, match removeSpans method! //LS
    getDataSourceText: function(id, color) {
        if (!!color) {
            return  '<span class="green small">[' + this.getDataSourceName(id) + ']</span>';
        } else {
            return  this.getDataSourceName(id);
        }


    },

    // remove span from DataSourceText (for  XML validation)
    removeSpans: function(p) {
        var s = p.replace(/<span class="green small">\[/gm, '');
        return  s.replace(/\]<\/span>/gm, '');

    },


    // for temp fix only!//LS
    getDataSourceTextStatic: function(id) {
        // debug(id);
        var ds_array = [];
        ds_array[1001] = "RapLeaf";
        ds_array[1002] = "BlueKai";
        ds_array[1003] = "Exelate";
        ds_array[1004] = "3-rd Party Non-Branded";
        ds_array[1005] = "Red Aril Interest";
        ds_array[1006] = "Bizo";
        ds_array[1007] = "TargusInfo";
        ds_array[1008] = "DataLogix";
        ds_array[10656403] = "HowStuffWorks";
        // HTML does not work for tree!//LS
        //return  '<span class="green small">[' + ds_array[id] + ']</span>';
        //  return !!ds_array[id] ?  ds_array[id]  : 'unknown';
        return !!ds_array[id] ? '<span class="small">' + ds_array[id] + '</span>' : '';

    },

    SHOW_ERROR_AUDIENCE_SEGMENT_DATA: function(id) {
        Ext.MessageBox.show({
            title: __('TITLE_ERROR'),
            msg:  __('ERROR_AUDIENCE_SEGMENT_DATA'),
            fn: function() {
                window.location.href = 'AudienceSegments.html'
            },
            buttons: Ext.Msg.OK
        });

    },
    // LOGIC BASED ON EXCLUSION Subsection. //LS
    // method to set NOT to XML from name //LS
    setExclusions: function(p) {

        return  p.replace(/name="NOT /gm, ' notOperation="true" name="');
    },

    // remove [&] ans html from  text (for  XML validation)
    removeAmps: function(p) {
        var s = p.replace(/&amp;/gm, "&");
        return App.AudienceSegmentsUtils.removeSpans(s.replace(/&/gm, "&amp;"));
    },

    masksNum: 0,
    mask: function(win) {
        if (win) {
            win.body.mask(__('MESSAGE_LOADING'), 'x-mask-loading');
        } else {

            if (!!Ext.getCmp('app-id-campaigns-container')) {
                var cmp = Ext.getCmp('app-id-campaigns-container');
                cmp.getEl().setStyle({
                    'z-index': '100000'
                });
                cmp.getEl().mask(__('MESSAGE_LOADING'), 'x-mask-loading');

            }

        }
        App.AudienceSegmentsUtils.masksNum++;
    },

    unmask: function(win) {
        if (win) {
            win.body.unmask();
        } else {

            if (!!Ext.getCmp('app-id-campaigns-container')) {
                var cmp = Ext.getCmp('app-id-campaigns-container');
                cmp.getEl().setStyle({
                    'z-index': '1'
                });
                cmp.getEl().unmask();


            }

        }
        App.AudienceSegmentsUtils.masksNum--;
    }
};

App.AudienceSegments = Ext.extend(Ext.ux.tree.TreeGrid, {

    title: __('TITLE_SEGMENTS'),
    autoLeafs: true,
    autoExpand: true,
    defaultSortable: true,
    enableColumnHide: false,
    enableHdMenu: true,
    collapsedByDefault: true,
    id: 'app-id-segments-grid',
    existingNames: [],
    segmentNames: {},

    actionUrls: {
        listSegments: {
            // TODO!!! use static in debug
            url: '/dmp/audienceService/audienceSegments',
            //   url: '/static/data/segments/audienceSegments_1.xml',

            method: 'GET'
        },
        createSegment: {
            url: '/dmp/audienceService/audienceSegment',
            method: 'POST'
        },
        deleteSegment: {
            url: '/dmp/audienceService/audienceSegment/{segment-id}',
            method: 'DELETE'
        },
        getSegment: {
            url: '/dmp/audienceService/audienceSegment/{segment-id}',
            method: 'GET'
        },
        updateSegment: {
            url: '/dmp/audienceService/audienceSegment/{segment-id}',
            method: 'PUT'
        },
        publishSegment: {
            url: '/dmp/audienceService/audienceSegment/{segment-id}/publish',
            method: 'PUT'
        },
        unpublishSegment: {
            url: '/dmp/audienceService/audienceSegment/{segment-id}/unpublish',
            method: 'PUT'
        },
        archiveSegment: {
            url: '/dmp/audienceService/audienceSegment/{segment-id}/archive',
            method: 'PUT'
        },
        copySegment: {
            url: '/dmp/audienceService/audienceSegment/{segment-id}/copy',
            method: 'PUT'
        },
        getSegmentUsage: {
            url: '/dmp/audienceService/audienceSegment/{segment-id}/usage',
            method: 'GET'
        },
        getDataSources: {
            url: '/dmp/audienceService/dataSources',
            method: 'GET'
        },
        getDataTypes: {
            url: '/dmp/audienceService/dataSource/{data-source-id}/dataTypes',
            method: 'GET'
        },
        getCategories: {
            url: '/dmp/audienceService/audienceCategories',
            // url: '/static/data/segments/audience-category.xml',
            method: 'GET'
        },
        addSection: {
            url: '/dmp/audienceService/audienceSegment/{segment-id}/section',
            method: 'POST'
        },
        getSection: {
            url: '/dmp/audienceService/audienceSegment/{segment-id}/section/{id}',
            //LS
            //url: '/static/data/segments/get-section.xml',
            method: 'POST'
        },
        updateSection: {
            url: '/dmp/audienceService/audienceSegment/{segment-id}/section/{section-id}',
            method: 'PUT'
        },
        deleteSection: {
            url: '/dmp/audienceService/audienceSegment/{segment-id}/section/{section-id}',
            method: 'DELETE'
        },
        calculateSection: {
            url: '/dmp/audienceService/calculateSection',
            method: 'GET'
        }
    },

    getActionUrl: function(sActionName, oParams) {
        var url = this.actionUrls[sActionName].url;
        for (var k in oParams) {
            url = url.replace("{" + k + "}", oParams[k]);
        }
        return url;
    },

    getActionMethod: function(sActionName) {
        return this.actionUrls[sActionName].method;
    },

    actions: [ 'publish', 'unpublish', 'copy', 'archive', 'add'],

    displayField: 'name',

    load: function(callback) {
        callback(this);

        App.AudienceSegmentsUtils.mask();
    },

    showForm: function(form) {
        if (this.current_form)
            this.current_form.close();
        form.mainTree = this;
        form.show();
        this.current_form = form;
    },

    beforeDestroy: function() {
        App.AudienceSegments.superclass.beforeDestroy.apply(this, arguments);
    },

    createTreeNode: function(config) {

        var settings = {
            id: 'n' + Math.random(),
            size: '',
            leaf: true,
            expanded: false,
            menuType: '',
            tid:'n' + Math.random()
        };
        settings.name = '';
        config.iconCls = 'icon-' + config.menuType;
        Ext.apply(settings, config);

        return new Ext.tree.TreeNode(config);
    },

    insertNodeToRootNode: function(newNode) {
        newNode.iconCls = 'icon-' + newNode.menuType;
        this.root.appendChild(newNode);
    },

    insertNodeToCurrentNode: function(newNode) {
        newNode.iconCls = 'icon-' + newNode.menuType;
        if (this.selModel.selNode == null) {  // RD
            this.selModel.selNode = HACK_GLOBAL_CURRENT_NODE;
        } // RD
        this.selModel.selNode.appendChild(newNode);
        this.expandCurrentNode();
    },

    expandCurrentNode: function() {
        this.selModel.selNode.leaf = false;
        this.selModel.selNode.expand();

    },

    removeCurrentNode: function() {
        this.selModel.selNode.parentNode.removeChild(this.selModel.selNode);
    },

    updateCurrentNode: function(displayText) {
        this.selModel.selNode.attributes.name = displayText;
        this.selModel.selNode.setText(displayText);
    },

    updateCurrentNodeAttr: function(attr, value) {
    },

    replaceCurrentNode: function(newNode, notExpand) {
        this.selModel.selNode.parentNode.replaceChild(newNode, this.selModel.selNode);
        newNode.parentNode.leaf = false;
        if (!notExpand) {
            newNode.parentNode.expand();
            newNode.expand();
        }
        newNode.select();
    },

    replaceCurrentNodeChildren: function(newNodes) {
        this.selModel.selNode.removeAll();
        this.selModel.selNode.attributes.size = 100;   //10000000;   RD

        for (var i = 0; i < newNodes.length; i++)
            this.selModel.selNode.appendChild(newNodes[i]);
        this.expandCurrentNode();
    },

    changeNode: function(node, params) {

        var newNode = this.createTreeNode({
            name: node.attributes.name,
            id: node.attributes.id,
            tid: node.attributes.tid,
            size: node.attributes.size,
            menuType: node.attributes.menuType,
            leaf: node.attributes.leaf,
            expanded: node.expanded,
            status: node.attributes.status,
            iconCls: 'icon-' + node.attributes.menuType
        });
        for (var k in params) {
            newNode.attributes[k] = params[k];
        }

        var x = node.childNodes.length;

        for (var i = 0; i < x; i++) {
            newNode.appendChild(node.childNodes[0])
        }

        this.replaceCurrentNode(newNode, true);
    },

    updateMenuForUsedSegment: function(menu, node) {
        if (node.attributes.menuType != 'segment' && node.parentNode)
            return this.updateMenuForUsedSegment(menu, node.parentNode);
        var segmentUsed = !!(node.attributes.status != 'Unpublished');
        for (var i = 0; i < menu.items.length; i++)
            menu.items.itemAt(i).setDisabled(segmentUsed);
        return segmentUsed;
    },

    // not in use

    updateNodeChildren: function(node) {
        //node.setText('<b></b><div>111</div><div>111</div>');
        //debug(node);
        node.appendChild(
            new Ext.tree.TreeNode({name:'Album 1', cls:'album-node', allowDrag:false})
        );

        node.expand();
    },

    updateButtons: function(node) {
        this.disableAllButtons();
        this.enableButton('add');


        if (!node || !node.attributes || node.attributes.menuType != 'segment')
            return;
        try {
            this['enableButtons_' + node.attributes.status.replace(/[^a-zA-Z]/g, "").toUpperCase()]();
        } catch (e) {
            // no handler for this segment status
        }
    },

    enableButtons_UNPUBLISHED: function() {
        this.hideButton('unpublish');
        this.showButton('publish');
        this.enableButton('publish');
        this.enableButton('copy');
        this.enableButton('archive');
    },

    enableButtons_PUBLISHED: function() {
        this.hideButton('publish');
        this.showButton('unpublish');
        this.enableButton('unpublish');
        this.enableButton('copy');
        this.enableButton('archive');
    },

    enableButtons_INFLIGHT: function() {
        this.enableButton('copy');
        this.disableButton('publish');
        this.disableButton('unpublish');
    },

    enableButtons_ARCHIVED: function() {
        this.enableButton('copy');
        this.disableButton('publish');
        this.disableButton('unpublish');
    },

    disableAllButtons: function() {
        this.changeAllButtons(true);
    },

    enableAllButtons: function() {
        this.changeAllButtons(false);
    },

    changeAllButtons: function(disabled) {
        for (var k in this.actionButtons)
            this.changeButton(k, disabled);
    },

    enableButton: function(k) {
        this.actionButtons[k].setDisabled(false);
    },


    disableButton: function(k) {
        this.actionButtons[k].setDisabled(true);
    },


    hideButton: function(k) {
        this.actionButtons[k].hide();
    },

    showButton: function(k) {
        this.actionButtons[k].show();
    },


    changeButton: function(k, disabled) {
        this.actionButtons[k].setDisabled(disabled);
    },

    // button handlers
    publishSegment: function(node) {
        // check if segment can be published
        if (!node.findChildBy(
            function(node) {
                return !!(node.attributes.menuType == 'category');
            }, node, true)) {
            Ext.MessageBox.show({
                title: __('MESSAGE_TITLE_CANNOT_PUBLISH_SEGMENT'),
                msg: __('MESSAGE_CANNOT_PUBLISH_SEGMENT'),
                buttons: Ext.Msg.OK
            });
            return;
        }

        Ext.MessageBoxBO.show({
            title: __('MESSAGE_TITLE_CONFIRM_ACTION'),
            msg: __('MESSAGE_PUBLISH_CONFIRMATION_SEGMENT'),
            buttons: Ext.Msg.OKCANCEL,
            fn: (function(form) {
                return function(o) {
                    if (o != 'ok')
                        return;

                    App.AudienceSegmentsUtils.mask();
                    Ext.Ajax.request({
                        url: form.getActionUrl('publishSegment', {
                            'segment-id': node.attributes.tid
                        }),
                        method: form.getActionMethod('publishSegment'),
                        success: (function(form) {
                            return function(response, request) {
                                //form.changeNode(node, { status: "Published" });
                                //App.AudienceSegmentsUtils.unmask();
                                window.location.href = 'AudienceSegments.html';
                            };

                        })(form),
                        failure: function() {
                            App.AudienceSegmentsUtils.unmask();
                        }
                    });

                };

            })(this)
        });
    },

    unpublishSegment: function(node) {
        Ext.MessageBoxBO.show({
            title: __('MESSAGE_TITLE_CONFIRM_ACTION'),
            msg: __('MESSAGE_UNPUBLISH_CONFIRMATION_SEGMENT'),
            buttons: Ext.Msg.OKCANCEL,
            fn: (function(form) {
                return function(o) {
                    if (o != 'ok')
                        return;

                    App.AudienceSegmentsUtils.mask();
                    Ext.Ajax.request({
                        url: form.getActionUrl('unpublishSegment', {
                            'segment-id': node.attributes.tid
                        }),
                        method: form.getActionMethod('unpublishSegment'),
                        success: (function(form) {
                            return function(response, request) {
                                //form.changeNode(node, { status: "Unpublished" });
                                //App.AudienceSegmentsUtils.unmask();
                                window.location.href = 'AudienceSegments.html';
                            };

                        })(form),
                        failure: function() {
                            App.AudienceSegmentsUtils.unmask();
                        }
                    });

                };

            })(this)
        });
    },

    addSegment: function() {
        var form = new App.AudienceSegments.SegmentForm();
        this.showForm(form);
    },

    copySegment: function(node) {
        var form = new App.AudienceSegments.SegmentForm({
            copy: true,
            segmentNode: node
        });
        this.showForm(form);
    },

    archiveSegment: function(node) {

        // var n = node;

        if (node.attributes.status == 'Published') {
            Ext.MessageBoxBO.show({
                title: __('MESSAGE_TITLE_CONFIRM_ACTION'),
                msg: __('MESSAGE_ARCHIVE_SEGMENT'),
                buttons: Ext.Msg.OKCANCEL,
                fn: (function(form) {
                    return function(o) {
                        if (o == 'ok') {
                            form.unpublishSegment(node);
                        }

                    };

                })(this)
            });
            return;
        }

        Ext.MessageBoxBO.show({
            title: __('MESSAGE_TITLE_CONFIRM_ACTION'),
            msg: __('MESSAGE_ARCHIVE_CONFIRMATION_SEGMENT'),
            buttons: Ext.Msg.OKCANCEL,
            fn: (function(form) {
                return function(o) {
                    if (o != 'ok')
                        return;

                    App.AudienceSegmentsUtils.mask();
                    Ext.Ajax.request({
                        url: form.getActionUrl('archiveSegment', {
                            'segment-id': node.attributes.tid
                        }),
                        method: form.getActionMethod('archiveSegment'),
                        success: (function(form) {
                            return function(response, request) {
                                //  form.changeNode(node, { status: "Archived" });
                                // debug(node);
                                debug('archiveSegment ' + node.attributes.name);
                                form.removeCurrentNode();
                                form.segmentNameDelete(node.attributes.name);
                                App.AudienceSegmentsUtils.unmask();
                            };

                        })(form),
                        failure: function() {
                            App.AudienceSegmentsUtils.unmask();
                        }
                    });
                };

            })(this)
        });
    },

    checkIfSegmentExists: function(name) {
        return this.segmentNames[name];
    },

    segmentNameSave: function(name) {
        this.segmentNames[name] = true;
        this.existingNames.push(name);
    },

    segmentNameDelete: function(name) {
        this.segmentNames[name] = false;
        for (var i = 0; i < this.existingNames.length; i++) {
            if (this.existingNames[i] === name) {
                delete this.existingNames[i];
                break;
            }
        }
    },

    constructor: function(config) {

        Ext.apply(this, config);

        // use it for getDataSourceText method
        this.DataSourceCombo = App.AudienceSegments.DataSourceCombo,

            this.columns = [
                {
                    header: __('HEADER_AUDIENCE_SEGMENTS_GROUPS'),
//                        id: 'app-id-header-name',
//                        cls: 'app-id-header-name',
                    dataIndex: 'name',
                    width: 400,
                    autoExpand: true,
                    sortable: true,
                    tpl: new Ext.XTemplate('<tpl>{name:this.renderValue}</tpl>', {
                        renderValue: function(value) {
                            // SubsectionExclusions sor issue
                            // see http://depot.redaril.com:8080/browse/DMPPROJECT-1643
                            var exc = value.indexOf('SubsectionExclusions');
                            return exc > -1 ? 'Exclusions' : value;

                        }}),
                    sortFn: function(n1, n2) {
                        var dsc = me.dir && me.dir.toLowerCase() == 'desc';
                        // debug(dsc);
                        if (n1.attributes.menuType != 'segment' || n2.attributes.menuType != 'segment')
                            return 0;

                        var v1 = n1.attributes['name'].toUpperCase();
                        var v2 = n2.attributes['name'].toUpperCase();

                        if (v1 < v2)
                            return dsc ? +1 : -1;
                        else if (v1 > v2)
                            return dsc ? -1 : +1;
                        else
                            return 0;


                    }
                },
                {
                    header: __('HEADER_SIZE_SEGMENTS'),
                    width: 100,
                    dataIndex: 'size',
                    align: 'right',
                    tpl: new Ext.XTemplate('<tpl>{size:this.renderValue}</tpl>', {
                        renderValue: function(value) {

                            // HEADER_SIZE_SEGMENTS html tags hacks
                            if (!value || exc > -1) {
                                return "";
                            }

                            var exc = value.indexOf('exc');
                            var sub = value.indexOf('sub');
                            var sec = value.indexOf('sec');


                            if (exc > -1) {
                                return "";
                            }

                            var value = value.replace(/[^0-9.]/g, "");

                            if (sub > -1 || sec > -1) {
                                return '<b>' + value.numberWithCommas() + '</b>';
                            }


                            return value.numberWithCommas();
                        }
                    }),
                    sortable: true,
                    sortFn: function(n1, n2) {
                        var dsc = me.dir && me.dir.toLowerCase() == 'desc';
                        if (n1.attributes.menuType != 'segment' || n2.attributes.menuType != 'segment')
                            return 0;

                        var v1 = Number(n1.attributes['size']);
                        var v2 = Number(n2.attributes['size']);

                        if (v1 < v2)
                            return dsc ? +1 : -1;
                        else if (v1 > v2)
                            return dsc ? -1 : +1;
                        else
                            return 0;
                    }
                },
                {
                    header: __('HEADER_SEGMENT_STATUS'),
                    dataIndex: 'status',
                    width: 150,
                    align: 'center',
                    sortable: true,
                    sortFn: function(n1, n2) {
                        var dsc = me.dir && me.dir.toLowerCase() == 'desc';
                        if (n1.attributes.menuType != 'segment' || n2.attributes.menuType != 'segment')
                            return 0;

                        var v1 = n1.attributes['status'].toUpperCase();
                        var v2 = n2.attributes['status'].toUpperCase();

                        if (v1 < v2)
                            return dsc ? +1 : -1;
                        else if (v1 > v2)
                            return dsc ? -1 : +1;
                        else
                            return 0;
                    }
                }
            ];

        this.actionButtons = {};
        for (var i = 0; i < this.actions.length; i++) {
            var action = this.actions[i];
            //debug(action);
            this.actionButtons[action] = new Ext.Button({
                width: 100,
                text: __('LABEL_' + action.toUpperCase() + '_SEGMENT'),
                handler: (function(o, action) {
                    return function() {
                        try {
                            o[action + 'Segment'](o.getSelectionModel().selNode);
                        } catch (e) {
                            throw new Error("No handler for action: " + action);
                        }
                    };

                })(this, action),
                cls: 'x-always-active',
                disabled: true
            });
        }

        this.tbar = [
            {
                xtype: 'tbfill'
            }
        ];

        for (var k in this.actionButtons) {
            this.tbar.push(this.actionButtons[k]);

            if (k != 'publish') {
                this.tbar.push(new Ext.Toolbar.Spacer({
                    width : 5
                }));
                //this.tbar.push(new Ext.Toolbar.Spacer());
            }
        }

        this.root = new Ext.tree.AsyncTreeNode({
            id: -1,
            text: 'Root'
        });

        this.enableButton('add');
        //this.hideButton('publish');
        this.hideButton('unpublish');

        this.listeners = {
            click: (function(o) {
                return function(node, e) {


                    var mainTree = this;

                    var subsectionIsExclusions = function(subsection) {
                        if (subsection.category.length == 0) return false;
                        return subsection.category[0]['@notOperation'] == 'true';
                    };

                    var createCategoryNode = function(category) {
                        var params = {
                            id:category['@id'],
                            name:category['@name'],
                            size:category['@size'],
                            menuType: 'category'
                        };
                        return mainTree.createTreeNode(params);
                    };


                    var createSubsectionNode = function(subsection, id) {
                        var name = 'Subsection ' + id;
                        var renderer = 'sub';
                        if (subsectionIsExclusions(subsection)) {
                            //name = 'Exclusions';
                            name = 'SubsectionExclusions';
                            renderer = 'exc';

                        }
                        var size = subsection['@size'];
                        if (size === undefined || size === null || name == 'Exclusions') {
                            size = 0;
                        }
                        // name += ' ' + subsection['@displayOrder'];
                        var params = {
                            menuType:'subSection',
                            leaf: false,
                            expanded: true,
                            name:name,
                            size: renderer + size
                        };

                        return mainTree.createTreeNode(params);
                    };


                    var createSectionNode = function(section) {
                        // if (!config) var config = {};
                        //
                        // var name = "";
                        //
                        // if (config.toSend) {
                        //     name = __('LABEL_NEWLY_CREATED_SECTION_SEGMENTS');
                        // } else {
                        //     name = __('LABEL_NEWLY_CREATED_SECTION_SEGMENTS') + " [ Data Source: " + this.dataSourceName + " ]";
                        // }

                        var params = {
                            menuType:'section',
                            leaf: false,
                            expanded: true,
                            id:section['@id'],
                            tid:section['@id'],
                            name:section['@name'],
                            size:'sec' + section['@size']
                        };

                        // !!! fix for empty section size
                        //if (this.section.getSectionSize() != undefined) {
                        //    params.size = this.section.getSectionSize();
                        //}


                        // params.dataSource_type = this.dataSourceType;
                        // params.dataSource_id = this.dataSourceId;
                        // params.dataSource_name = this.dataSourceName;

                        var newNode = mainTree.createTreeNode(params);

                        //if (config.toSend) {
                        // var p = {
                        //     menuType:'dataSource',
                        //     id: dataSourceId,
                        //     tid: dataSourceId,
                        //     name: dataSourceName,
                        //     type: dataSourceType
                        // };
                        // var pn = mainTree.createTreeNode(p);
                        // newNode.appendChild(pn);
                        //}


                        //var subsectionNodes = this.createSubsectionNodes();
                        //for (var i = 0; i < subsectionNodes.length; i++) {
                        //    newNode.appendChild(subsectionNodes[i]);
                        //}

                        return newNode;

                    };


                    if (node.childNodes.length > 0 || node.attributes.menuType != 'segment') {
                        //node.expandAll();
                        return;
                    }
                    var segmentId = node.attributes.tid;


                    //http://localhost:8092/dmp/audienceService/audienceSegment/11020202

                    App.AudienceSegmentsUtils.mask(mainTree);

                    $.getJSON('/dmp/audienceService/audienceSegment/' + segmentId, function(segmentJSON) {


                        // fix json so that sections and subsections and categories are always arrays and always present
                        var ensureArray = function(o) {
                            if (o === undefined) return [];
                            if (o.constructor == Array) return o;
                            return [o];
                        };
                        segmentJSON.section = ensureArray(segmentJSON.section);
                        for (var s = 0; s < segmentJSON.section.length; s++) {
                            segmentJSON.section[s].subSection = ensureArray(segmentJSON.section[s].subSection);
                            for (var ss = 0; ss < segmentJSON.section[s].subSection.length; ss++) {
                                segmentJSON.section[s].subSection[ss].category = ensureArray(segmentJSON.section[s].subSection[ss].category);
                            }
                        }

                        // var testSection = { expanded:false, id:"tid0.23309752274601214",leaf:false, menuType:"section",name:"Section", status:"Unpublished",tid:"10673204", type:"section"};
                        // var testSubsection = { expanded:false, id:"tid0.23309752274601215",leaf:false, menuType:"subSection",name:"Subsection", size:"55", tid:"10673205", type:"subSection"};
                        // var testCategory = { expanded:false, id:"tid0.23309752274601216",leaf:true, menuType:"category",name:"Category", size:"55", tid:"10673206", type:"category"};
                        // var loader = App.AudienceSegments.XmlTreeGridLoader;
                        // var createNode = loader.prototype.createNode;
                        //
                        // var debug = App.AudienceSegments;
                        // var debug2 = App.AudienceSegments.SectionForm;

                        if (node.childNodes.length > 0 || node.attributes.menuType != 'segment') {
                            App.AudienceSegmentsUtils.unmask(mainTree);
                            return;  // probably user clicked twice
                        }

                        // if the segment is empty then mark it so by changing status to empty
                        // couldn't figure out how to do it in the spirit of this code so just did it

                        var $clickRow = $('#app-id-segments-grid').find('.x-tree-selected');


                        if ($clickRow.length != 1) return;
                        var $status = $clickRow.children(':eq(1)');
                        if ($status.length != 1) return;
                        //var debug = $status.text();
                        var $txt = $status.children();

                        if (segmentJSON.section.length == 0) {
                            // var tid = node.attributes.id;
                            //node.setAttribute('status', 'Empty'); xxx
                            //var debug2 = $txt.text();
                            $txt.html('No Sections');
                            //node.attributes.size = "No Sections";
                            App.AudienceSegmentsUtils.unmask(mainTree);
                            return;
                        } else {
                            if (isset(segmentJSON['@size']) && isnumber(segmentJSON['@size'])) {

                                debug(segmentJSON['@size']);
                                $txt.html("<b>" + segmentJSON['@size'].numberWithCommas() + "</b>");
                                node.attributes.size = segmentJSON['@size'];
                            }
                        }


                        for (var s = 0; s < segmentJSON.section.length; s++) {
                            var section = segmentJSON.section[s];
                            // numbering should start from 1, not 0 http://depot.redaril.com:8080/browse/DMPPROJECT-1974
                            section['@name'] += ' ' + (s + 1);
                            var newSectionNode = createSectionNode(section);
                            //node.iconCls = 'icon-' + newNode.menuType;
                            HACK_GLOBAL_CURRENT_NODE = node;  // is this hack still necessary???  TODO check


                            o.insertNodeToCurrentNode(newSectionNode);


                            for (var ss = 0; ss < section.subSection.length; ss++) {
                                var subsection = section.subSection[ss];


                                //  if (subsectionIsExclusions(subsection)) {
                                // var ExclusionNode = createSubsectionNode(subsection, ss);
                                //  var newSubsectionNode = createSubsectionNode(subsection, ss);
                                //  } else {
                                var newSubsectionNode = createSubsectionNode(subsection, ss + 1);
                                newSectionNode.appendChild(newSubsectionNode);
                                for (var c = 0; c < subsection.category.length; c++) {
                                    var category = subsection.category[c];
                                    //  debug(category['@name']);
                                    category['@name'] += '' + App.AudienceSegmentsUtils.getDataSourceText(category['@dataSourceId'], true);
                                    var newCategoryNode = createCategoryNode(category);
                                    newSubsectionNode.appendChild(newCategoryNode);
                                }

                                //    }


                            }

                            //newSectionNode.insertBefore(ExclusionNode , newSubsectionNode);


                        }


                        /** sort by displayOrder todo
                         * http://depot.redaril.com:8080/browse/DMPPROJECT-1643

                         var specSort = function(n1, n2) {
                         //                     debug(n1.attributes.name);
                         //                       debug(n2.attributes.name);
                         //                        debug('====================');

                         if (!!n1.attributes.name && !!n2.attributes.name) {
                         if (n1.attributes.name == 'Exclusions') {

                         return -1;
                         } else {
                         return 1;
                         }

                         } else {
                         return 0;
                         }

                         };

                         var sections = node.childNodes;
                         if (sections.length > 0) {
                         Ext.iterate(sections, function(sec) {
                         debug(sec.childNodes);
                         debug(sec.attributes.name);

                         Ext.iterate(sec.childNodes, function(subSec, i) {
                         if (subSec.attributes.name == 'Exclusions') {
                         //debug('Exclusions sec');
                         //  debug(sec);
                         //    sec.removeChild(subSec);
                         sec.setLastChild(subSec);


                         }
                         });

                         sec.sort(specSort);
                         });
                         }

                         node.sort(specSort);
                         **/
                        if (node.expandAll != null) {
                            node.expandAll();
                        }
                        App.AudienceSegmentsUtils.unmask(mainTree);

                    });


                    // if (this.selModel.selNode == null){  // RD
                    //     this.selModel.selNode = HACK_GLOBAL_CURRENT_NODE; // RD
                    // } // RD
                    //var sectionGoop = node.appendChild(newSectionNode);   //this.selModel.selNode.appendChild(newNode);
                    //this.expandCurrentNode();


                    // HACK_GLOBAL_CURRENT_NODE = node;
                    // var newSectionNode = createNode(testSection)
                    // o.insertNodeToCurrentNode(newSectionNode);
                    // var sectionGoop = node.appendChild(newSectionNode);


                    // HACK_GLOBAL_CURRENT_NODE = sectionGoop;
                    // var newSubsectionNode = createNode(testSubsection)
                    // o.insertNodeToCurrentNode(newSubsectionNode);
                    // var subsectionGoop = newSectionNode.appendChild(newSubsectionNode);


                    // HACK_GLOBAL_CURRENT_NODE = node;
                    // node.beginUpdate();
                    // var newSectionNode = createNode(testSection);
                    // o.insertNodeToCurrentNode(newSectionNode);
                    // var sectionGoop = node.appendChild(newSectionNode);
                    //
                    // HACK_GLOBAL_CURRENT_NODE = sectionGoop;
                    // var newSubsectionNode = createNode(testSubsection);
                    // o.insertNodeToCurrentNode(newSubsectionNode);
                    // var subsectionGoop = newSectionNode.appendChild(newSubsectionNode);
                    // node.endUpdate();
                    //


                }
            })(this),

            contextmenu: (function(o) {
                return function(node, e) {
                    node.select();
                    try {
                        var c = o[node.attributes.menuType + 'Menu'];
                        c.contextNode = node;
                        c.showAt(e.getXY());
                    } catch (e) {
                        // no menu for this type of node
                    }
                };
            })(this),

            beforeload: function() {
                //App.AudienceSegmentsUtils.mask();
            },
            load: function() {
                //App.AudienceSegmentsUtils.unmask();
            },
            loadexception: function() {
                //App.AudienceSegmentsUtils.unmask();
            }
        };

        this.getSelectionModel().addListener('selectionchange',
            (function (tree) {
                return function(selmodel, node) {
                    tree.updateButtons(node);
                    //  tree.updateNodeChildren(node);
                };

            })(this)
        );

        this.loader = new App.AudienceSegments.XmlTreeGridLoader({
            dataUrl: this.getActionUrl('listSegments'),
            requestMethod: this.getActionMethod('listSegments'),
            nodeParameter: 'tid',
            autoLeafs: this.autoLeafs,
            autoExpand: this.autoExpand,
            replaceIds: 'tid',
            mainTree: this,
            xmlAttrSubHandler: function(attr, preparedValue) {
                if (attr.nodeName == 'name')
                    return preparedValue.htmlEncode();
                return preparedValue;
            }
        });

        //  debug(this.loader);

        this.segmentMenu = new Ext.menu.Menu({
            items: [


                {
                    action: 'add-section',
                    text: __('MENU_ADD_SECTION_SEGMENTS')
                },
                {
                    action: 'edit-segment',
                    text: __('MENU_EDIT_SEGMENT')
                },

                // delete issue http://depot.redaril.com:8080/browse/DMPPROJECT-1581
                //                {
                //                    action: 'delete-segment',
                //                    text: __('MENU_DELETE_SEGMENT')
                //                },
                {
                    action: 'show-usage',
                    text: __('MENU_SHOW_USAGE_SEGMENT')
                }
            ],
            listeners: {
                beforeShow: (function(o) {
                    return function(item) {

                        var s = o.updateMenuForUsedSegment(item, item.contextNode);
                        if (!s) {
                            //cannot add any other Data Source to Segment if Segment has Blue Kai Data Source
                            if (item.contextNode.childNodes.length) {
                                for (var i = 0; i < item.contextNode.childNodes.length; i++) {
                                    if (
                                        item.contextNode.childNodes[0].attributes.dataSource_type == 'THIRD_PARTY_BLUEKAI' ||
                                            item.contextNode.childNodes[0].attributes.dataSource_type == '3rd-party Blue Kai'
                                        ) {
                                        item.items.itemAt(0).setDisabled(true);
                                    }
                                }
                            }
                        }

                        // enable "show use" only if status is In-Flight
                        item.items.itemAt(2).setDisabled(!!(item.contextNode.attributes.status != 'In-Flight'));
                    };
                })(this),

                itemclick: (function(o) {
                    return function(item) {

                        var segmentNode = item.parentMenu.contextNode.attributes;


                        switch (item.action) {
                            case 'edit-segment':

                                var segment_form = new App.AudienceSegments.SegmentForm({
                                    edit: true,
                                    data: segmentNode
                                });
                                o.showForm(segment_form);
                                break;
                            case 'delete-segment':
                                Ext.MessageBoxBO.show({
                                    title: __('MESSAGE_TITLE_CONFIRM_ACTION'),
                                    msg: __('MESSAGE_DELETE_CONFIRMATION_SEGMENT'),
                                    buttons: Ext.Msg.OKCANCEL,
                                    fn: function(buttonId) {
                                        if (buttonId != 'ok') {
                                            return;
                                        }
                                        App.AudienceSegmentsUtils.mask();
                                        Ext.Ajax.request({
                                            url: o.getActionUrl('deleteSegment', {
                                                'segment-id': segmentNode.tid
                                            }),
                                            method: o.getActionMethod('deleteSegment'),
                                            success: function(response, request) {
                                                App.AudienceSegmentsUtils.unmask();
                                                o.removeCurrentNode();
                                                o.segmentNameDelete(segmentNode.name);
                                            },
                                            failure: function() {
                                                App.AudienceSegmentsUtils.unmask();
                                            }
                                        });
                                    }
                                });
                                break;
                            case 'add-section':
                                //                                var data_source_form = new App.AudienceSegments.DataSourceForm({
                                //                                    store: o.dataSourcesStore,
                                //                                    segmentId: segmentNode.tid,
                                //                                    saveButtonText:  __('BUTTON_NEXT'),
                                //                                    mainTree: o
                                //                                });
                                //                                o.showForm(data_source_form);
                                //                                break;

                                //                               var form = new App.AudienceSegments.SectionForm({
                                //                                        dataSourceId:1005,
                                //                                        dataSourceName: 'Red Aril Interest',
                                //                                        dataSourceType: 'RED_ARIL_MODELED',
                                //                                        segmentId: segmentNode.tid,
                                //                                        mainTree: o
                                //                                    });
                                //                                    o.showForm(form);
                                window.location.href = 'EditSection.html?segment=' + segmentNode.tid;
                                break;
                            case 'show-usage':
                                var campaigns_list_form = new App.AudienceSegments.CampaignsListForm({
                                    segmentId: segmentNode.tid,
                                    segmentName: segmentNode.name,
                                    saveButtonText: __('BUTTON_OK'),
                                    hideCancelButton: true,
                                    mainTree: o
                                });
                                o.showForm(campaigns_list_form);
                                break;
                        }
                    };
                })(this)
            }
        });

        this.sectionMenu = new Ext.menu.Menu({
            items: [
                {
                    action: 'edit-section',
                    text: __('MENU_EDIT_SECTION_SEGMENTS')
                },
                {
                    action: 'delete-section',
                    text: __('MENU_DELETE_SECTION_SEGMENTS')
                }
            ],
            listeners: {
                beforeShow: (function(o) {
                    return function(item) {
                        var s = o.updateMenuForUsedSegment(item, item.contextNode);
                    };
                })(this),
                itemclick: (function(o) {
                    var temp = o;
                    return function(item) {

                        var sectionNode = item.parentMenu.contextNode.attributes;
                        var segmentNode = item.parentMenu.contextNode.parentNode.attributes;

                        switch (item.action) {
                            case 'delete-section':
                                Ext.MessageBoxBO.show({
                                    title: __('MESSAGE_TITLE_CONFIRM_ACTION'),
                                    msg: __('MESSAGE_DELETE_CONFIRMATION_SECTION'),
                                    buttons: Ext.Msg.OKCANCEL,
                                    fn: function(buttonId) {
                                        if (buttonId != 'ok')
                                            return;
                                        App.AudienceSegmentsUtils.mask();
                                        Ext.Ajax.request({
                                            url: o.getActionUrl('deleteSection', {
                                                'section-id': sectionNode.tid,
                                                'segment-id': segmentNode.tid
                                            }),
                                            method: o.getActionMethod('deleteSection'),
                                            success: function(response, request) {
                                                App.AudienceSegmentsUtils.unmask();
                                                o.removeCurrentNode();
                                            },
                                            failure: function() {
                                                App.AudienceSegmentsUtils.unmask();
                                            }
                                        });
                                    }
                                });
                                break;
                            case 'edit-section':

                                // debug(sectionNode);
                                //  return;


                                window.location.href = 'EditSection.html?segment=' + segmentNode.tid + '&section=' + sectionNode.tid;
                                // window.location.href = 'EditSection.html?segment=' + segmentNode.tid + '&section=' + sectionNode.tid + '&datasource=' + datasourceIdGlobal;
                                /*
                                 var form = new App.AudienceSegments.SectionForm({
                                 edit: true,
                                 data: sectionNode,
                                 segmentId: segmentNode.tid,
                                 dataSourceId: sectionNode.dataSource_id,
                                 dataSourceName: sectionNode.dataSource_name,
                                 dataSourceType: sectionNode.dataSource_type,
                                 mainTree: o
                                 });
                                 o.showForm(form);
                                 */
                                break;
                        }
                    };
                })(this)
            }
        });
        App.AudienceSegments.superclass.constructor.apply(this, arguments);
    },
    onRender: function() {
        App.AudienceSegments.superclass.onRender.apply(this, arguments);
    },

    initComponent: function() {
        App.AudienceSegments.superclass.initComponent.apply(this, arguments);
    }
});


// custom tree loader
//  RD

App.AudienceSegments.XmlTreeGridLoader = Ext.extend(Ext.ux.tree.XmlTreeGridLoader, {

    processResponse: function(response, node, callback, scope) {

        // !!! temporary, remove pacing nodes
        var pacingNodes = response.responseXML.getElementsByTagName("pacing");
        var pacings = [];
        for (var i = 0; i < pacingNodes.length; i++)
            pacings.push(pacingNodes[i]);
        for (var i = 0; i < pacings.length; i++)
            pacings[i].parentNode.removeChild(pacings[i]);
        // --

        // remove data source node and add data source's name to section name
        var ds = response.responseXML.getElementsByTagName("dataSource");
        var r = [];
        for (var i = 0; i < ds.length; i++) {
            ds[i].parentNode.setAttribute('name', ds[i].parentNode.getAttribute('name'));

            //                   + " [Data Source: "+
            //                ds[i].getAttribute('name') +
            //                "]"
            //);
            r.push(ds[i]);
            ds[i].parentNode.setAttribute('dataSource_name', ds[i].getAttribute('name'));
            ds[i].parentNode.setAttribute('dataSource_id', ds[i].getAttribute('id'));
            ds[i].parentNode.setAttribute('dataSource_type', ds[i].getAttribute('type'));
        }
        for (var i = 0; i < r.length; i++)
            r[i].parentNode.removeChild(r[i]);
        // --

        // add status Unpublished to segments, that do not have it
        // save segment names to array to check names uniquiness after add/copy
        // remove Archived segments
        var segments = response.responseXML.getElementsByTagName("segment");
        this.mainTree.segmentNames = {};

        var ar = [];
        for (var i = 0; i < segments.length; i++) {
            if (!segments[i].getAttribute('status')) {
                segments[i].setAttribute('status', 'Unpublished');
            }
            if (segments[i].getAttribute('status') == 'Archived') {
                ar.push(segments[i]);
                this.mainTree.segmentNameSave(segments[i].getAttribute('name'));
            } else {
                this.mainTree.segmentNameSave(segments[i].getAttribute('name'));
            }
        }
        for (var i = 0; i < ar.length; i++) {
            ar[i].parentNode.removeChild(ar[i]);
        }


        // !!! temporary: add name to subsection nodes, that do not have it
        var subsections = response.responseXML.getElementsByTagName("subSection");
        var subsectionsLength = subsections.length;


        for (var i = 0; i < subsectionsLength; i++) {

            var categories = subsections[i].getElementsByTagName("category");
            var categoriesLength = categories.length;
            for (var ii = 0; ii < categoriesLength; ii++) {
                // debug(categories[ii]);


                var ds_id = Ext.DomQuery.selectValue('@dataSourceId', categories[ii]);
                var displayOrder = !!Ext.DomQuery.selectValue('@displayOrder ', categories[ii]) ? Ext.DomQuery.selectValue('@displayOrder ', categories[ii]) : ii;
                var notOperationWord = Ext.DomQuery.selectValue('@notOperation', categories[ii]) ? 'NOT ' : '';


                //  var ds_name = notOperationWord + categories[ii].getAttribute('name') + ' ' + App.AudienceSegmentsUtils.getDataSourceText(ds_id);
                var ds_name = notOperationWord + categories[ii].getAttribute('name');


                categories[ii].setAttribute('displayOrder', displayOrder);
                categories[ii].setAttribute('name', ds_name);
            }


            if (!subsections[i].getAttribute('name')) {
                subsections[i].setAttribute('name', 'Subsection');
            }

        }


        // --

        try {
            var xmlData = response.responseXML;
            var root = xmlData.documentElement || xmlData;
            var o = this.xmlToJson(root);
            o = o.children || [];
            node.beginUpdate();
            for (var i = 0, len = o.length; i < len; i++) {

                var n = this.createNode(o[i]);
                if (n) {

                    node.appendChild(n);
                    //debug(o[i]);

                    this.setIcon(o[i]);
                }
            }
            node.endUpdate();
            this.runCallback(callback, scope || node, [node]);
        } catch(e) {
            this.handleFailure(response);
        }

        // Ext.getCmp('app-id-header-name').getEl().fireEvent('click');
        //  debug($("#app-id-segments-grid-xlhd-1"));

        //$("#app-id-segments-grid-xlhd-1").click();

        //this.mainTree.root.sort();


        App.AudienceSegmentsUtils.unmask();


        if (this.mainTree.collapsedByDefault) {
            this.mainTree.collapseAll();
        }


//                $('.x-tree-ec-icon .x-tree-elbow').each(function(){
//                $(this).attr("src" , "lib/ext-3.2.1/resources/images/default/tree/arrow.gif");
//                          //debug($(this).attr("src"));
//                });

    },
    setIcon: function (o) {
        o.iconCls = 'icon-' + o.menuType;

        if (o.children) {
            for (var i = 0, len = o.children.length; i < len; i++) {
                this.setIcon(o.children[i]);
            }
        }
        return;
    },
    listeners: {
        loadexception: function() {
            App.AudienceSegmentsUtils.unmask();
        }
    }
});


// create/edit Segment form
App.AudienceSegments.SegmentForm = Ext.extend(App.FormWindow, {
    width: 300,
    height: 150,
    createCopy: function() {

        if (this.mainTree.checkIfSegmentExists(this.nameField.getValue())) {
            Ext.MessageBox.show({
                title: __('MESSAGE_SEGMENT_NAME_ALREADY_TAKEN_TITLE'),
                msg: __('MESSAGE_SEGMENT_NAME_ALREADY_TAKEN'),
                buttons: Ext.Msg.OK
            });
            return false;
        }

        App.AudienceSegmentsUtils.mask(this);

        Ext.Ajax.request({

            url: this.mainTree.getActionUrl('copySegment', {
                'segment-id': this.segmentNode.attributes.tid
            }),
            method: this.mainTree.getActionMethod('copySegment'),
            headers: {
                'Content-Type':'text/xml; charset=utf-8'
            },
            params: '<segment status="Unpublished" name="' + this.nameField.getValue().htmlEncode() + '" />',
            success: (function(form) {
                return function(response, request) {

                    //form.mainTree.expandAll();
                    // we have to reload all tree
                    // see http://depot.redaril.com:8080/browse/DMPPROJECT-1413;
                    // form.mainTree.getLoader().load()
                    window.location.href = 'AudienceSegments.html';
                    return;


                    var new_segment_id = Ext.DomQuery.selectValue('segment>@id', response.responseXML);
                    var newNode = form.segmentNode.clone();
                    newNode.attributes.tid = new_segment_id;
                    newNode.attributes.id = 'tid' + Math.random();
                    newNode.attributes.name = form.nameField.getValue().htmlEncode();
                    newNode.attributes.status = "Unpublished"
                    form.mainTree.insertNodeToRootNode(newNode);
                    newNode.select();

                    form.close();

                    App.AudienceSegmentsUtils.unmask(form);

                };

            })(this),

            failure: (function(form) {
                return function() {
                    App.AudienceSegmentsUtils.unmask(form);
                };

            })(this)
        });
    },
    listeners: {
        show: function(form) {
            // todo fix!!!
            var nameField = form.findById('app-id-segment-name-field');
            if (nameField) {
                nameField.existingValues = !! form.mainTree && !! form.mainTree.existingNames ? form.mainTree.existingNames : [];
            } else {
                nameField.existingValues = [];
            }
        },
        save: function() {
        },
        saveCreate: function() {

            if (this.copy) {
                return this.createCopy();
            }

            if (this.mainTree.checkIfSegmentExists(this.nameField.getValue())) {
                Ext.MessageBox.show({
                    title: __('MESSAGE_SEGMENT_NAME_ALREADY_TAKEN_TITLE'),
                    msg: __('MESSAGE_SEGMENT_NAME_ALREADY_TAKEN'),
                    buttons: Ext.Msg.OK
                });
                return false;
            }

            App.AudienceSegmentsUtils.mask(this);

            Ext.Ajax.request({

                url: this.mainTree.getActionUrl('createSegment'),
                method: this.mainTree.getActionMethod('createSegment'),
                headers: {
                    'Content-Type':'text/xml; charset=utf-8'
                },
                params: '<segment status="Unpublished" name="' + this.nameField.getValue().htmlEncode() + '" />',
                success: (function(form) {
                    return function(response, request) {

                        var new_segment_id = Ext.DomQuery.selectValue('segment>@id', response.responseXML);

                        var params = {};
                        params.menuType = 'segment';
                        params.name = form.nameField.getValue().htmlEncode();
                        params.tid = new_segment_id;
                        params.status = "Unpublished";

                        var newNode = form.mainTree.createTreeNode(params);

                        form.mainTree.insertNodeToRootNode(newNode);
                        form.mainTree.segmentNameSave(form.nameField.getValue());
                        newNode.select();
                        form.close();

                        App.AudienceSegmentsUtils.unmask(form);

                    };

                })(this),

                failure: (function(form) {
                    return function() {
                        App.AudienceSegmentsUtils.unmask(form);
                    };

                })(this)

            });
        },
        saveEdit: function() {

            if (
                this.nameField.getValue() != this.initialName &&
                    this.mainTree.checkIfSegmentExists(this.nameField.getValue())
                ) {
                Ext.MessageBox.show({
                    title: __('MESSAGE_SEGMENT_NAME_ALREADY_TAKEN_TITLE'),
                    msg: __('MESSAGE_SEGMENT_NAME_ALREADY_TAKEN'),
                    buttons: Ext.Msg.OK
                });
                return false;
            }

            App.AudienceSegmentsUtils.mask(this);

            Ext.Ajax.request({
                url: this.mainTree.getActionUrl('updateSegment', {
                    'segment-id': this.data.tid
                }),
                method: this.mainTree.getActionMethod('updateSegment'),
                headers: {
                    'Content-Type':'text/xml; charset=utf-8'
                },
                params: '<segment name="' + this.nameField.getValue().htmlEncode() + '" />',
                success: (function(form) {
                    return function(response, request) {
                        form.mainTree.updateCurrentNode(form.nameField.getValue().htmlEncode());
                        form.mainTree.segmentNameDelete(form.initialName);
                        form.mainTree.segmentNameSave(form.nameField.getValue());
                        form.close();
                        App.AudienceSegmentsUtils.unmask(form);
                    };

                })(this),
                failure: (function(form) {
                    return function() {
                        App.AudienceSegmentsUtils.unmask(form);
                    };

                })(this)
            });
        },
        loadEdit: function() {
            // load segment data
            App.AudienceSegmentsUtils.mask(this);
            Ext.Ajax.request({
                url: this.mainTree.getActionUrl('getSegment', {
                    'segment-id': this.data.tid
                }),
                method: this.mainTree.getActionMethod('getSegment'),
                success: (function(form) {
                    return function(response, request) {
                        var id = Ext.DomQuery.selectValue('segment>@id', response.responseXML);
                        var name = Ext.DomQuery.selectValue('segment>@name', response.responseXML);
                        form.initialName = name;
                        form.nameField.setValue(name);
                        form.nameField.focus(false, 500);
                        App.AudienceSegmentsUtils.unmask(form);
                    };

                })(this),
                failure: (function(form) {
                    return function() {
                        App.AudienceSegmentsUtils.unmask(form);
                    };

                })(this)
            });
            this.setTitle(__('TITLE_EDIT_SEGMENT'));
        },
        loadCreate: function() {
            this.setTitle(__('TITLE_CREATE_SEGMENT'));
            if (this.copy)
                this.setTitle(__('TITLE_COPY_SEGMENT'));
            this.nameField.focus(false, 500);
        },
        load: function() {
            this.saveButton.setDisabled(true);
        }
    },
    constructor: function(config) {
        config = config || {};
        this.config = config;
        if (config.data)
            this.data = config.data;

        this.nameField = new Ext.form.TextField({
            id: 'app-id-segment-name-field',
            fieldLabel: __('LABEL_SEGMENT_NAME'),
            enableKeyEvents: true,
            allowBlank: false,
            maxLength: 32,
            listeners: {
                keyup: (function(form) {
                    return function() {
                        form.saveButton.setDisabled(this.getValue() === "");
                    };

                })(this),
                invalid: (function(form) {
                    return function() {
                        form.saveButton.setDisabled(true);
                    };

                })(this)
            },
            vtype: 'existingValues'
        });

        config.items = [new Ext.FormPanel({
            xtype: 'form',
            bodyStyle: 'padding:15px; background:transparent',
            border: false,
            monitorValid: true,
            items: [this.nameField]
        })];

        App.AudienceSegments.SegmentForm.superclass.constructor.call(this, config);
    }
});

// campaigns_list_form
App.AudienceSegments.CampaignsListForm = Ext.extend(App.FormWindow, {

    title: __('TITLE_CAMPAIGNS_LIST_FORM_SEGMENTS'),
    width: 600,
    height: 400,
    listeners: {
        save: function() {
            this.close();
        }
    },
    constructor: function(config) {
        Ext.apply(this, config);

        this.grid = new Ext.grid.GridPanel({
            id: 'audience-segments-campaigns-form',
            title: this.segmentName,
            autoScroll: true,
            viewConfig: {
                forceFit: true
            },

            store: new Ext.data.XmlStore({
                autoDestroy: true,
                url: this.mainTree.getActionUrl('getSegmentUsage', {
                    'segment-id': this.segmentId
                }),
                record: 'dataCampaign',
                fields: [
                    {
                        name: 'id',
                        mapping: '@id'
                    },
                    {
                        name: 'name',
                        mapping: '@name',
                        convert: function(v, rec) {
                            return v.htmlEncode();
                        }
                    },
                    {
                        name: 'status',
                        mapping: '@status'
                    }
                ]
            }),

            columns: [
                {
                    header: __('HEADER_DATA_CAMPAIGN_NAME_SEGMENTS'),
                    dataIndex: 'name'
                },
                {
                    header: __('HEADER_DATA_CAMPAIGN_STATUS_SEGMENTS'),
                    dataIndex: 'status'
                }
            ]
        });
        App.AudienceSegmentsUtils.mask();
        this.grid.store.addListener('load', (function(form) {
            return function() {
                App.AudienceSegmentsUtils.unmask();
            };

        })(this));
        this.grid.store.addListener('loadexception', (function(form) {
            return function() {
                App.AudienceSegmentsUtils.unmask();
            };

        })(this));

        this.grid.store.load();
        this.items = [this.grid];

        App.AudienceSegments.CampaignsListForm.superclass.constructor.call(this, config);
    }
});

// data DataSourceCombo for separate page


App.AudienceSegments.DataSourceCombo = new Ext.form.ComboBox({
    id : 'app-data-source-combo',
    store:  new Ext.data.Store({

        // true!! we need to know data sources in all segments part
        autoLoad: true,
        listeners: {
            load: function(me) {

                // get global dataSourceIdDefault from EditSection.html
                datasourceIdGlobal = typeof(dataSourceIdDefault) !== 'undefined' ? dataSourceIdDefault : me.data.items[0].id;
                // debug(datasourceIdGlobal);
                Ext.getCmp('app-data-source-combo').setValue(datasourceIdGlobal);
            }
        },

        proxy: new Ext.data.HttpProxy({
            url: '/dmp/audienceService/dataSources',
            method: 'GET'
        }),
        reader: new Ext.data.XmlReader({
            record: 'dataSource',
            id: '@id'
        }, [
            {
                name: 'id',
                mapping: '@id',
                type: 'string'
            },
            {
                name: 'type',
                mapping: '@type',
                type: 'string'
            },
            {
                name: 'name',
                mapping: '@name',
                type: 'string'
            }
        ])
    }),
    //mode: 'local',

    // global
    // value:  !!dataSourceIdDefault ? dataSourceIdDefault : 1005 ,
    displayField: 'name',
    valueField: 'id',
    forceSelection: true,
    triggerAction: 'all',
    selectOnFocus:true,
    allowBlank: false,
    autoSelect: true,
    editable: false,
    emptyText: __('MESSAGE_SELECT_DATA_SOURCE_SEGMENTS'),
    listeners: {
        load: function(o) {
            // never fires! WHY?
            debug('DataSourceCombo loaded');

        },
        select: (function(o) {
            return function(combo, record, index) {
                //  debug(record);
                // debug(index);

                //  BLUEKAI  restriction

                //                        if (record.data.type == 'THIRD_PARTY_BLUEKAI'){
                //                             Ext.MessageBox.show({
                //                                title: __('MESSAGE_ALERT'),
                //                                msg: __('MESSAGE_ERROR_ADD_BLUE_KAI_TO_NON_EMPTY_SEGMENT'),
                //                                buttons: Ext.Msg.OK
                //                            });
                //                        }

                var sectionForm = Ext.getCmp('app-id-section-form');
                //  sectionForm.getEl().mask(__('MESSAGE_LOADING'), 'x-mask-loading');

                // variant 1 : redirect
                var href = '/EditSection.html?segment=' + App.Common.getUrlParam('segment', 'int');
                // var href = '/EditSection.html?segment=' + App.Common.getUrlParam('segment', 'int') + '&datasource=' + record.id;


                if (App.AudienceSegmentsUtils.isSeparatePageEdit()) {
                    href += '&section=' + App.Common.getUrlParam('section', 'int');
                }
                // window.location.href = href;

                //this.dataTypes.setValue(dataTypeName);
                //sectionForm.rootId = record.id;
                //sectionForm.rootName = dataTypeName;

                /*

                 var loader = sectionForm.childrenCategories.getLoader();
                 loader.dataUrl = '/dmp/audienceService/audienceCategories';
                 loader.requestMethod = 'GET';


                 loader.baseParams = {
                 'data-type-id': sectionForm.rootId,
                 'data-source-id': record.id
                 };
                 loader.load(sectionForm.childrenCategories.root);
                 */

                //  var dsStore = sectionForm.dataTypes.store;

                //     Ext.getCmp('app-id-data-types').clearValue();
                debug('data-source-id ' + record.id);
                var dsStore = sectionForm.dataTypes.getStore();
                dsStore.proxy.setUrl('/dmp/audienceService/dataSource/' + record.id + '/dataTypes');
                dsStore.load();


                //o.selectedDataSourceId = record.id;
                //o.saveButton.setDisabled(false);
            };
        })(this)
    }
});


// data source form
App.AudienceSegments.DataSourceForm = Ext.extend(App.FormWindow, {

    title: __('TITLE_ADD_DATA_SOURCE_SEGMENTS'),
    width: 300,
    height: 150,
    listeners: {

        load: function() {


            this.saveButton.setDisabled(true);
        },

        saveCreate: function() {

            var selectedItem = this.dataSourcesCombobox.store.getById(
                this.dataSourcesCombobox.getValue()
            );

            //cannot add Blue Kai Data Source to any non-empty Segment
            if (
                (selectedItem.data.type == 'THIRD_PARTY_BLUEKAI'
                    || selectedItem.data.type == '3rd-party Blue Kai')
                    && this.mainTree.selModel.selNode.childNodes.length > 0
                ) {
                Ext.MessageBox.show({
                    title: __('TITLE_ERROR_ADD_SOURCE'),
                    msg: __('MESSAGE_ERROR_ADD_BLUE_KAI_TO_NON_EMPTY_SEGMENT'),
                    buttons: Ext.Msg.OK
                });
                return;
            }


            for (var i = 0; i < this.mainTree.selModel.selNode.childNodes.length; i++) {
                var section = this.mainTree.selModel.selNode.childNodes[i];
                if (section.attributes.dataSource_id == this.selectedDataSourceId) {
                    Ext.MessageBox.show({
                        title: __('TITLE_ERROR_ADD_SOURCE'),
                        msg: __('MESSAGE_ERROR_ADD_SAME_DATA_SOURCE'),
                        buttons: Ext.Msg.OK
                    });
                    return;
                }
            }

            var form = new App.AudienceSegments.SectionForm({
                dataSourceId: selectedItem.data.id,
                dataSourceName: selectedItem.data.name,
                dataSourceType: selectedItem.data.type,
                segmentId: this.segmentId,
                mainTree: this.mainTree
            });
            form.mainTree.showForm(form);

        }
    },

    constructor: function(config) {

        Ext.apply(this, config);

        this.store = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({
                url: this.mainTree.getActionUrl('getDataSources'),
                method: this.mainTree.getActionMethod('getDataSources')
            }),

            reader: new Ext.data.XmlReader({
                record: 'dataSource',
                id: '@id'
            }, [
                {
                    name: 'id',
                    mapping: '@id',
                    type: 'string'
                },
                {
                    name: 'type',
                    mapping: '@type',
                    type: 'string'
                },
                {
                    name: 'name',
                    mapping: '@name',
                    type: 'string'
                }
            ])
        });

        this.dataSourcesCombobox = new Ext.form.ComboBox({
            store: this.store,
            displayField: 'name',
            valueField: 'id',
            forceSelection: true,
            triggerAction: 'all',
            selectOnFocus:true,
            allowBlank: false,
            autoSelect: true,
            editable: false,
            emptyText: __('MESSAGE_SELECT_DATA_SOURCE_SEGMENTS'),
            listeners: {
                select: (function(o) {
                    return function(combo, record, index) {
                        o.selectedDataSourceId = record.id;
                        o.saveButton.setDisabled(false);
                    };
                })(this)
            }
        });

        this.items = [this.dataSourcesCombobox];
        App.AudienceSegments.DataSourceForm.superclass.constructor.apply(this, arguments);
    }
});


// section form
App.AudienceSegments.SectionForm = Ext.extend(App.FormWindow, {

    title: __('TITLE_ADD_SECTION_SEGMENTS'),
    width: 900,
    height: 400,
    id: 'app-id-section-form',
    border      : false,
    resizable   : false,
    draggable   : false,



    getCategoriesAmount: function() {
        var categoriesNumber = 0;
        for (var i = 0; i < this.section.items.length; i++) {
            if (!this.section.items.itemAt(i).grid)
                continue;
            var subsectionStore = this.section.items.itemAt(i).grid.store;
            for
                (var ii = 0; ii < subsectionStore.data.length; ii++)
                if (subsectionStore.data.itemAt(ii).data.name != '') {
                    categoriesNumber++;
                }
        }
        return categoriesNumber
    },
    // When creating subsection node need to add something for exclusions - RD
    createSubsectionNodes: function() {
        var subsectionNodes = [];
        for (var i = 0; i < this.section.items.length; i++) {

            if (
                !this.section.items.itemAt(i).grid ||
                    !this.section.items.itemAt(i).grid.store.getAt(0).data.id
                ) {
                continue;
            }

            var params = {
                menuType: 'subSection',
                leaf: false,
                expanded: true,
                name: __('LABEL_SUBSECTION_IN_TREE_SEGMENTS')
            };
            var subsectionNode = this.mainTree.createTreeNode(params);

            var subsectionStore = this.section.items.itemAt(i).grid.store;
            for (var ii = 0; ii < subsectionStore.data.length; ii++) {
                var subsectionData = subsectionStore.data;   // RD
                var itemData = subsectionData.itemAt(ii).data;  // RD dereference
                if (itemData.name != '') {
                    var params = {
                        id: itemData.id,
                        name: itemData.name,
                        menuType: 'category'
                    };
                    // !!! Fix for missing categories size
                    if (itemData.size != undefined) params.size = itemData.size;
                    var categoryNode = this.mainTree.createTreeNode(params);
                    subsectionNode.appendChild(categoryNode);
                }
            }
            subsectionNodes.push(subsectionNode);

        }
        return subsectionNodes;
    },

    createSectionNode: function(config) {
        if (!config) var config = {};

        var name = "";

        if (config.toSend) {
            name = __('LABEL_NEWLY_CREATED_SECTION_SEGMENTS');
        } else {
            name = __('LABEL_NEWLY_CREATED_SECTION_SEGMENTS') + " [ Data Source: " + this.dataSourceName + " ]";
        }

        var params = {
            menuType: 'section',
            leaf: false,
            expanded: true,
            name: name
        };

        // !!! fix for empty section size
        if (this.section.getSectionSize() != undefined) {
            params.size = this.section.getSectionSize();
        }


        params.dataSource_type = this.dataSourceType;
        params.dataSource_id = this.dataSourceId;
        params.dataSource_name = this.dataSourceName;

        var newNode = this.mainTree.createTreeNode(params);

        if (config.toSend) {
            var p = {
                menuType: 'dataSource',
                id: this.dataSourceId,
                tid: this.dataSourceId,
                name: this.dataSourceName,
                type: this.dataSourceType
            };
            var pn = this.mainTree.createTreeNode(p);
            newNode.appendChild(pn);
        }


        var subsectionNodes = this.createSubsectionNodes();
        for (var i = 0; i < subsectionNodes.length; i++) {
            newNode.appendChild(subsectionNodes[i]);
        }

        return newNode;

    },



    listeners: {
        saveCreate: function() {

            var newNode = this.createSectionNode({toSend: false});
            var newNodeToSend = this.createSectionNode({toSend: true});  // Add parameter here for exclusions - RD

            var p = newNodeToSend.toXml({
                format: true,
                attrs: ['id', 'name', 'size', 'type'],
                tagNameAttr: 'menuType',
                addDisplayOrder: ['subSection', 'category'],
                skipAttrTagsArray: {
                    subSection: ['id'],
                    section: ['id']
                }
            });

            p = App.AudienceSegmentsUtils.setExclusions(p);
            p = App.AudienceSegmentsUtils.removeAmps(p);


            App.AudienceSegmentsUtils.mask(this);


            Ext.Ajax.request({
                url: this.mainTree.getActionUrl('addSection', {
                    'segment-id': this.segmentId
                }),
                method: this.mainTree.getActionMethod('addSection'),
                headers: {
                    'Content-Type':'text/xml; charset=utf-8'
                },
                params: p,
                success: (function(form) {
                    return function(response, request) {

                        //  var new_section_id = Ext.DomQuery.selectValue('section>@id', response.responseXML);
                        newNode.attributes.tid = Ext.DomQuery.selectValue('section>@id', response.responseXML);

                        // !!! DEMO FIX
                        newNode.attributes.size = form.section.new_size;
                        //newNode.attributes.size = "";

                        if (form.isSeparatePage) {
                            //always go to AudienceSegments.html
                            //http://depot.redaril.com:8080/browse/DMPPROJECT-1391
                            window.location.href = 'AudienceSegments.html';

                            // reload on first save
                            //                                if ( !form.isSeparatePageEdit){
                            //                              Ext.getCmp('app-id-section-form').getEl().mask(__('MESSAGE_LOADING'), 'x-mask-loading');
                            //                               var href = '/EditSection.html?segment='+getUrlVar('segment') +'&datasource=' + Ext.getCmp('app-data-source-combo').getValue()  + '&section='+ new_section_id ;
                            //                               window.location.href = href;
                            //                                }

                        } else {
                            form.mainTree.insertNodeToCurrentNode(newNode);
                            form.close();
                        }


                        App.AudienceSegmentsUtils.unmask(form);
                        window.location = '/AudienceSegments.html';  // RD per Sasha
                    };

                })(this),
                failure: (function(form) {
                    return function() {
                        App.AudienceSegmentsUtils.unmask(form);
                    };

                })(this)
            });
        },

        saveEdit: function() {

            var sectionNode = this.createSectionNode({
                toSend: false
            });
            var sectionNodeToSend = this.createSectionNode({
                toSend: true
            });

            var p = sectionNodeToSend.toXml({
                format: true,
                attrs: ['id', 'name', 'size', 'type' , 'displayOrder'],
                tagNameAttr: 'menuType',
                addDisplayOrder: ['subSection', 'category']      ,
                skipAttrTagsArray: {
                    subSection: ['id'],
                    section: ['id']
                }
            });

            p = App.AudienceSegmentsUtils.setExclusions(p);
            p = App.AudienceSegmentsUtils.removeAmps(p);

            // debug(sectionNodeToSend);
            debug(p);
            // return;

            App.AudienceSegmentsUtils.mask(this);
            Ext.Ajax.request({
                url: this.mainTree.getActionUrl('updateSection', {
                    'segment-id': this.segmentId,
                    'section-id': this.data.tid
                }),
                method: this.mainTree.getActionMethod('updateSection'),
                headers: {
                    'Content-Type':'text/xml; charset=utf-8'
                },
                params: p,
                success: (function(form) {
                    return function(request, response) {

                        // !!! DEMO FIX
                        if (form.section.new_size) {
                            sectionNode.attributes.size = form.section.new_size;
                            //sectionNode.attributes.size = "";
                        }


                        sectionNode.attributes.id = form.data.id;
                        sectionNode.attributes.tid = form.data.tid;

                        if (form.isSeparatePage) {
                            window.location.href = 'AudienceSegments.html';
                        } else {
                            form.mainTree.replaceCurrentNode(sectionNode);
                            form.close();

                        }
                        App.AudienceSegmentsUtils.unmask(form);

                    };

                })(this),
                failure: (function(form) {
                    return function() {
                        App.AudienceSegmentsUtils.unmask(form);
                    };

                })(this)
            });
        },

        // populate data

        load: function() {
            this.saveButton.setDisabled(true);
        },

        prerequsitesLoaded: function() {
            if (this.edit && !this.editLoaded) {
                this.loadEdit();
                this.editLoaded = true;
            }
        }

    },

    loadEdit: function() {
        App.AudienceSegmentsUtils.mask(this);
        Ext.Ajax.request({
            method: 'GET',
            url: this.mainTree.getActionUrl('getSection', {
                'segment-id': this.segmentId,
                'id': this.data.tid
            }),
            success: (function(form) {
                return function(response, request) {
                    var sectionXml = Ext.DomQuery.select('section', response.responseXML);
                    form.section.populate(sectionXml);
                    App.AudienceSegmentsUtils.unmask(form);

                }
            })(this),
            failure: (function(form) {
                return function() {
                    App.AudienceSegmentsUtils.unmask(form);
                }
            })(this)
        });
    },


    updateChildCategories: function(dataTypeId, dataTypeName) {
        this.dataTypes.setValue(dataTypeName);
        this.rootId = dataTypeId;
        this.rootName = dataTypeName;
        var loader = this.childrenCategories.getLoader();
        loader.dataUrl = this.mainTree.getActionUrl('getCategories');
        loader.requestMethod = this.mainTree.getActionMethod('getCategories');
        debug('getDataSourceId<-updateChildCategories');
        loader.baseParams = {
            'data-type-id': this.rootId,
            'data-source-id': App.AudienceSegmentsUtils.getDataSourceId(this)
        };
        loader.load(this.childrenCategories.root);
    },

    constructor: function(config) {

        //  debug(config);

        Ext.apply(this, config);

        this.isSeparatePage = App.AudienceSegmentsUtils.isSeparatePage();
        this.isSeparatePageEdit = App.AudienceSegmentsUtils.isSeparatePageEdit();
        this.closable = ! this.isSeparatePage;

        if (this.isSeparatePage) {

            //  this.setPosition(0, 100);
            this.setSize(Ext.getBody().getWidth() - 20, document.documentElement.clientHeight - 140);
        } else {
            this.setPosition(100, 70);
            this.setSize(Ext.getBody().getWidth() - 200, document.documentElement.clientHeight - 140);

        }


        this.addEvents('prerequsitesLoaded');

        // dynamic categories grid columns for different data source types

        var categoriesCols = [

            {
                header: __('HEADER_AUDIENCE_CATEGORY_SEGMENTS'),
                dataIndex: 'name',
                sortable: true,
                sortFn: function(n1, n2) {
                    var dsc = !!me.dir && me.dir.toLowerCase() == 'desc';

                    var v1 = n1.attributes['name'];
                    var v2 = n2.attributes['name'];

                    if (v1 < v2)
                        return dsc ? +1 : -1;
                    else if (v1 > v2)
                        return dsc ? -1 : +1;
                    else
                        return 0;
                },
                width: 200,
                autoExpand: true
            },
            {
                header: __('HEADER_SIZE_SEGMENTS'),
                sortable: true,
                sortFn: function(n1, n2) {
                    var dsc = !!me.dir && me.dir.toLowerCase() == 'desc';

                    var v1 = Number(n1.attributes['size']);
                    var v2 = Number(n2.attributes['size']);


                    if (v1 < v2)
                        return dsc ? +1 : -1;
                    else if (v1 > v2)
                        return dsc ? -1 : +1;
                    else
                        return 0;
                },
                dataIndex: 'size',
                width: 150,
                align: 'right',
                tpl: new Ext.XTemplate('<tpl >{size:this.renderValue}</tpl>', {
                    renderValue: function(value) {
                        // debug(value);
                        if (!value)return "";
                        return value.numberWithCommas();
                    }
                })
            }
        ];

        if (this.dataSourceType == 'THIRD_PARTY_BLUEKAI' ||
            this.dataSourceType == '3rd-party Blue Kai') {
            categoriesCols.push({
                header: __('HEADER_FLOOR_PRICE_SEGMENTS'),
                dataIndex: 'floorPrice',
                width: 80,
                align: 'right'
            }, {
                header: __('HEADER_RECOMMENDED_PRICE_SEGMENTS'),
                dataIndex: 'recommendedPrice',
                width: 80,
                align: 'right'
            });
        } else {
            categoriesCols.push({
                header: __('HEADER_PRICE_SEGMENTS'),
                dataIndex: 'price',
                width: 80,
                align: 'right',
                tpl: new Ext.XTemplate('<tpl>{price:this.renderValue}</tpl>', {
                    renderValue: function(value) {
                        return value > 0 ? value : '';
                    }
                })
            });
        }

        /*
         categoriesCols.push(
         {
         header: 'buyable',
         dataIndex: 'buyable',
         width: 200,
         hidden: false,
         autoExpand: true
         });
         */


        this.childrenCategories = new Ext.ux.tree.TreeGrid({
            autoHeight: true,
            enableDD: true,
            enableColumnHide: false,
            enableColumnMove: false,
            ddGroup: 'categoriesGridDDGroup',
            loader: new Ext.ux.tree.XmlTreeGridLoader({
                dataUrl: this.mainTree.getActionUrl('getCategories'),
                nodeParameter: 'id',
                autoExpand: 0,
                baseAttr: {
                    draggable: true
                },
                xmlAttrSubHandler: function(attr, preparedValue) {
                    if (attr.nodeName == 'name')
                        return preparedValue.htmlEncode();
                    return preparedValue;
                },
                processResponse: (function(form) {
                    return function(response, node, callback, scope) {
                        try {
                            var xmlData = response.responseXML;
                            var root = xmlData.documentElement || xmlData;
                            var o = this.xmlToJson(root);
                            o = o.children || [];
                            node.beginUpdate();
                            for (var i = 0, len = o.length; i < len; i++) {
                                var n = this.createNode(o[i]);
                                if (n) {
                                    node.appendChild(n);
                                    this.setIcon(o[i]);
                                }
                            }
                            node.endUpdate();
                            this.runCallback(callback, scope || node, [node]);
                        } catch(e) {
                            this.handleFailure(response);
                        }
                        App.AudienceSegmentsUtils.unmask(form);
                        form.fireEvent('prerequsitesLoaded');
                    };

                })(this),
                setIcon: function (o) {
                    if (o.leaf)
                        o.iconCls = 'icon-' + o.menuType;
                    return;

                } ,
                listeners: {
                    load: {
                        scope: this,
                        fn: function(o, node, response) {
                            //                            debug('childrenCategories loaded for  baseParams');
                            //                            debug(o.baseParams);
                            // reload
                            if (App.AudienceSegmentsUtils.isSeparatePage()) {
                                //     Ext.getCmp('app-id-data-types').clearValue();

                                //                                        Ext.getCmp('app-id-data-types').store.load({
                                //                                           params:{ 'data-source-id' : o.baseParams['data-source-id']}
                                //                                        });
                            }


                            var categories = Ext.DomQuery.select("category", response.responseXML);
                            if (categories[0]) {
                                this.section.checkCategory = categories[0];
                                try {
                                    // no sub-section, add first one automatically
                                    if (this.section.items.length == 0 && !this.edit)
                                        this.section.insertEmptySubSection();
                                } catch (er) {
                                }
                            }
                        }
                    },
                    loadexception: {
                        scope: this,
                        fn: function(o, node, response) {
                            App.AudienceSegmentsUtils.unmask(this);

                            Ext.MessageBox.show({
                                title: __('TITLE_ERROR'),
                                msg:  __('ERROR_AUDIENCE_SEGMENT_DATA'),
                                buttons: Ext.Msg.OK
                            });
                            //form.fireEvent('prerequsitesLoaded');
                        }
                    },
                    beforeload: {
                        scope: this,
                        fn: function(o, node, callback) {
                            App.AudienceSegmentsUtils.mask(this);
                            if (!this.rootId) {
                                return false;
                            }
                            try {
                                this.section.buttons[0].setDisabled(true)
                            } catch (er) {
                            }

                            return true;
                        }
                    }
                }
            }),

            root: new Ext.tree.AsyncTreeNode({
                id: -1,
                draggable: false
            }),

            columns: categoriesCols
        });

        // allow dragging only those categories that have "Buyable" attribute set to true
        this.childrenCategories.loader.addListener('load', (function(tree) {

            return function() {
                tree.root.cascade(function() {
                    var buyable = false;
                    if (this.attributes.buyable) {
                        buyable = this.attributes.buyable.toUpperCase();
                    }

                    if (this.attributes.Buyable) {
                        buyable = this.attributes.Buyable.toUpperCase();
                    }

                    this.draggable = !!(buyable === 'TRUE' || buyable === 'NULL');
                    //  debug('buyable ' + this.attributes.buyable);
                    //  debug('draggable ' + this.draggable);


                    if (!this.draggable && !!this.attributes['name']) {


                        try {
                            this.setText('<i>' + this.attributes['name'] + ' </i>');
                            //  this.getUI().addClass('nondraggable');
                            // this.ui.addClass('nondraggable');

                            var children = this.getUI().getEl().childNodes;
                            var i = children.length;
                            var divs = $(children).find('div');

                            //debug(divs.get(0));
                            $(divs.get(0)).empty();
                            //$(divs.get(1)).empty();
                            // debug(children.childNodes);
                            debug(this.attributes['name'] + ' nondraggable');
                        } catch(e) {
                        }

                        //  debug(this.attributes['name']);
                    } else {
                        this.setText(this.attributes['name'] + ' <img src="/ui/css/img/draggable.png" />');

                    }


                    //  this.getUI().addClass('nondraggable');
                });
            };

        })(this.childrenCategories));

        var dsId = App.AudienceSegmentsUtils.getDataSourceId(this);
        debug('dataTypesStore load for dataSourceId ' + dsId);
        this.dataTypesStore = new Ext.data.XmlStore({
            autoDestroy: true,
            proxy: new Ext.data.HttpProxy({
                url: '/dmp/audienceService/dataSource/' + dsId + '/dataTypes',
                method: this.mainTree.getActionMethod('getDataTypes')
            }),
            record: 'dataType',
            fields: [
                {
                    name: 'id',
                    mapping: '@id'
                },
                {
                    name: 'name',
                    mapping: '@name'
                }
            ],
            listeners: {
                load: {
                    scope: this,
                    fn: function(ds, records, o) {

                        if (!!records.length && records.length > 0) {
                            //  if ( !App.AudienceSegmentsUtils.isSeparatePage() ){
                            this.updateChildCategories(records[0].data.id, records[0].data.name);
                            //  }

                        }

                        else {
                            Ext.MessageBox.show({
                                title: __('MESSAGE_TITLE_EMPTY_DATA_TYPES'),
                                msg: __('MESSAGE_EMPTY_DATA_TYPES'),
                                buttons: Ext.Msg.OK
                            });
                            App.AudienceSegmentsUtils.unmask(this);
                            if (!App.AudienceSegmentsUtils.isSeparatePage) {
                                this.close();
                                return;
                            }

                        }

                    }
                },
                loadexception: {
                    scope: this,
                    fn: function() {
                        App.AudienceSegmentsUtils.unmask(this);
                    }
                },
                beforeload: {
                    scope: this,
                    fn: function() {
                        App.AudienceSegmentsUtils.mask(this);
                    }
                }
            }
        });

        this.dataTypes = new Ext.form.ComboBox({
            id : 'app-id-data-types',
            store: this.dataTypesStore,
            displayField: 'name',
            valueField: 'id',
            forceSelection: true,
            triggerAction: 'all',
            selectOnFocus: true,
            allowBlank: false,
            editable: false,
            mode: 'local',
            listeners: {
                select: (function(o) {
                    return function(combo, record, index) {
                        if (!record)
                            return;
                        o.updateChildCategories(record.data.id, record.data.name);
                    };
                })(this),

                render: function(combo) {
                    combo.getStore().load();
                }

            }
        });

        this.section = new App.AudienceSegments.SectionForm.Section({
            dataTypes: this.dataTypes,
            mainTree: this.mainTree,
            dynamic: true,
            sectionForm: this,
            edit: this.edit
        });

        this.section.addListener('infoUpdated', (function(section, form) {
            return function() {
                try {
                    // !!! DEMO FIX
                    Ext.getCmp('app-id-sections-size-label').setText('Size: ' + section.getSectionSize().numberWithCommas());
                } catch (e) {
                }
                form.saveButton.setDisabled(!form.getCategoriesAmount());
            };

        })(this.section, this));

        this.layout = 'hbox';
        this.layoutConfig = {
            align: 'stretch',
            pack: 'start'
        };

        this.DataSourceCombo = App.AudienceSegments.DataSourceCombo;
        this.label_1 = new Ext.form.Label({
            text: 'Data Type:',
            style: 'marginTop: 4px; marginLeft: 10px; marginRight: 2px; width: 90px;'
        });
        this.label_2 = new Ext.form.Label({
            text: 'Data Source:',
            style: 'marginTop: 4px; marginLeft: 10px; marginRight: 2px; width: 100px;'
        });
        this.items = [
            {
                flex: 1,
                autoScroll: true,
                items: [
                    {
                        layout: 'hbox',
                        style: 'marginTop: 2px;',
                        items: [this.label_2, this.DataSourceCombo , this.label_1, this.dataTypes   ]
                    },
                    {
                        layout:'fit',
                        style: 'marginTop: 2px;',
                        items: [this.childrenCategories]
                    }
                ]
            },
            {
                tbar: [
                    {
                        xtype: 'tbspacer'
                    },
                    {
                        xtype: 'tbspacer'
                    },
                    /* !!! DEMO FIX   */
                    {
                        xtype: 'label',
                        text: 'Size:',
                        id: 'app-id-sections-size-label'
                    },
                    {
                        xtype: 'tbfill'
                    },
                    {
                        text: __('LABEL_ADD_SUB_SECTION_SEGMENTS'),
                        handler: (function(section) {
                            return function() {
                                section.insertEmptySubSection();
                            };

                        })(this.section),
                        cls: 'x-always-active'
                    }


                    // RD - Adding Exclusions
                    ,
                    { xtype: 'tbspacer' },
                    {

                        id: 'app-add-exclusion-button',
                        text: __('LABEL_ADD_SUB_SECTION_SEGMENTS_EXCLUSIONS'),
                        handler: (function(section) {


                            return function() {
                                //  debug(this);
                                this.disable();
                                section.fireEvent('exclusionAdded');
                                section.insertEmptySubSection(true);
                            };

                        })(this.section),
                        cls: 'x-always-active'
                    },
                    { xtype: 'tbspacer' }
                    // RD end adding exclusions

                ],
                width: 450,
                autoScroll: true,
                items: [this.section]
            }
        ];
        // update title: add Data Source Name
        if (this.edit) {
            this.title = __('TITLE_EDIT_SECTION_SEGMENTS');
        }

        this.title += ' [Segment: ' + config.asName + ']';

        // this.title = this.title + ' to segment ' + this.dataSourceName + '';


        App.AudienceSegments.SectionForm.superclass.constructor.call(this, config);
    }
});

App.AudienceSegments.SectionForm.Section = Ext.extend(Ext.Panel, {

    // exclusionSubsection : undefined,  // RD
    autoScroll: true,
    bodyStyle: 'padding:2px;background:transparent',
    margins: {
        top:0,
        right:20,
        bottom:20,
        left:0
    },

    insertSubSection: function(subsection) {

        // debug(subsection);

        if (!subsection.subsectionData) {

            // debug('isExclusionsExistsCheck ' + this.isExclusionsExistsCheck());
            var last = this.items.items.length;
            //debug(last);
            if (subsection.isExclusions) {
                this.add(subsection);
                //    debug('new Exclusions subsection');
            }
            else {
                //   debug('new normal subsection');

                this.insert(last - 1, subsection);
            }
        }
        else {
            //   debug('new subsection with data ');
            this.add(subsection);
        }


        this.doLayout();

        this.fireEvent('subsectionsChanged');

    },

    isExclusionsExistsCheck: function() {
        return  Ext.getCmp('app-add-exclusion-button').disabled;
    },

    insertEmptySubSection: function(isExclusions) {

        var subsection = new App.AudienceSegments.SectionForm.SubSection({
            isExclusions : isExclusions,  // RD - Added for exclusions
            section: this,
            dynamic: this.dynamic,
            subsectionData: '',
            infoHeaderAttrs: this.infoHeaderAttrs
        });
        this.insertSubSection(subsection);

    },


    checkAttrPresence: function(sAttr, oCategoryNode) {
        if (!oCategoryNode || !oCategoryNode.attributes)
            return false;
        for (var i = 0; i < oCategoryNode.attributes.length; i++) {
            if (oCategoryNode.attributes[i].name == sAttr)
                return true;
        }

        return false;
    },

    // attributes definitions for section Info and subSection grids
    infoHeaderAttrs: [


        {
            attrName: 'name',
            displayName: __('HEADER_CATEGORIES_NAME_SEGMENTS'),
            grid: true,
            info: false,
            width: 100,
            align: 'left',
            renderer: function(value) {
                return '<span class="small">' + value + '</span>';
            }
        },

        {
            attrName: 'dataSourceId',
            displayName: __('LABEL_DATA_SOURCE'),
            grid: true,
            info: false,
            width: 100,
            align: 'left',
            renderer: function(value) {
                return '<span class="small">' + App.AudienceSegmentsUtils.getDataSourceText(value) + '</span>';
            }

        },

        {
            attrName: 'displayOrder',
            displayName: 'ord',
            grid: false,
            // for dev
            //grid: true,
            info: false,
            width: 50,
            align: 'left'

        },
        {
            attrName: 'size',
            displayName: __('HEADER_SIZE_SEGMENTS'),
            grid: true,
            info: false,
            width: 40,
            align: 'right',
            renderer: function(value) {
                if (!value) return "";
                return '<span class="small">' + value.numberWithCommas() + '</span>';
            }
        },
        {
            attrName: 'price',
            displayName:__('HEADER_PRICE_SEGMENTS'),
            grid: true,
            info: false,
            align: 'right',
            width: 40,
            renderer: function(value) {
                var v = !!value ? value : '0';
                return '<span class="small">' + v + '</span>';
            }
        },
        {
            attrName: 'floorPrice',
            displayName: __('HEADER_FLOOR_PRICE_SEGMENTS'),
            grid: false,
            info: false,
            width: 12
        },
        {
            attrName: 'recommendedPrice',
            displayName: __('HEADER_RECOMMENDED_PRICE_SEGMENTS'),
            grid: false,
            info: false,
            width: 12
        },
        {
            attrName: 'id',
            grid: false,
            info: false,
            width: 55
        }
    ],

    getSectionSize: function() {
        if (!this.new_size)
            return this.initialSize;
        return this.new_size;
    },



    populate: function(data) {

        this.initialSize = Ext.DomQuery.selectValue("@size", data);

        var categories = Ext.DomQuery.select("category", data);

        var subsections = Ext.DomQuery.select("subSection", data);

        var categoriesLenght = categories.length;
        var subsectionsLenght = subsections.length;

        // for (var i = 0; i < subsectionsLenght ; i++) {
        //   debug(!! Ext.DomQuery.select("category @notOperation", subsections[i])[0].firstChild.nodeValue);
        //  }

        var isExclusionsFound = false;

        for (var i = 0; i < subsectionsLenght; i++) {

            var isExclusions = !! Ext.DomQuery.select("category @notOperation", subsections[i])[0].firstChild.nodeValue;
            var subsectionData = subsections[i];
            if (! isExclusionsFound && isExclusions) {
                isExclusionsFound = true;
                var appExclusionButton = Ext.getCmp('app-add-exclusion-button');
                if (!! appExclusionButton) {
                    appExclusionButton.disable();  // RD added null check
                    this.fireEvent('exclusionAdded');
                }


            }


            var subsection = new App.AudienceSegments.SectionForm.SubSection({
                section: this,
                subsectionData: subsectionData,
                isExclusions : isExclusions ,
                edit: true,
                dynamic: this.dynamic,
                infoHeaderAttrs: this.infoHeaderAttrs
            });

            this.insertSubSection(subsection);
        }

        this.fireEvent('infoUpdated');
    },


    constructor: function(config) {

        Ext.apply(this, config);
        this.isExclusionsExists = false;
        this.addEvents('subsectionsChanged', 'recalculateInfo', 'infoUpdated', 'exclusionAdded', 'exclusionRemoved');


        this.addListener('exclusionAdded', function() {
            //alert('exclusionAdded');
            this.isExclusionsExists = true;
        });


        this.addListener('exclusionRemoved', function() {
            // alert('exclusionRemoved');
            this.isExclusionsExists = false;
        });


        this.addListener('subsectionsChanged', function() {

            // fix "AND" labels
            try {
                this.items.each(function() {
                    this.items.last().show();
                });
                this.items.last().items.last().hide()
            } catch(e) {
            }
        });

        // recalculate size and price in info header
        this.addListener('recalculateInfo', function() {

            var sectionNode = this.sectionForm.createSectionNode();
            var p = sectionNode.toXml({
                format: true,
                attrs: ['id', 'size', 'name'],
                tagNameAttr: 'menuType',
                skipAttrsTags: ['subSection', 'section']
            });
            p = App.AudienceSegmentsUtils.setExclusions(p);
            p = App.AudienceSegmentsUtils.removeAmps(p);
            //debug(p);
            // var randomnumber = Math.floor(Math.random() * 4);
            var c = 0;
            for (var i = 0; i < sectionNode.childNodes.length; i++) {
                for (var ii = 0; ii < sectionNode.childNodes[i].childNodes.length; ii++) {
                    c++;

                    //    debug(sectionNode.childNodes[i]);
                }
            }
            // if (!c)  randomnumber = 'empty';


            // call recalculation
            this.getEl().mask(__('MESSAGE_RECALCULATING'), 'x-mask-loading');
            Ext.Ajax.request({
                method: 'PUT',
                url: this.mainTree.getActionUrl('calculateSection'),
                params: p,
                headers: {
                    'Content-Type':'text/xml; charset=utf-8'
                },
                success: (function(section) {
                    return function(response, request) {
                        var sectionXml = Ext.DomQuery.select('section', response.responseXML);
                        section.new_size = Ext.DomQuery.selectValue("@size", sectionXml);
                        section.fireEvent('infoUpdated');
                        section.getEl().unmask();
                    };

                })(this),
                failure: (function(section) {
                    return function() {
                        section.getEl().unmask();
                    };

                })(this)
            });
        });
        App.AudienceSegments.SectionForm.Section.superclass.constructor.apply(this, arguments);
    }
});

// Needs to work for Exclusions panel also - RD
App.AudienceSegments.SectionForm.SubSection = Ext.extend(Ext.Panel, {



    bodyStyle: 'padding:2px;background:transparent',
    margins: {
        top:0,
        right:0,
        bottom:20,
        left:0
    },
    categoriesSeparator: ' > ',

    insertCategory: function(oData) {
        if (oData.iconCls == undefined)
            oData.iconCls = 'icon-delete';
        var s = new Ext.data.Record(oData);
        this.store.add(s);
    },




    constructor: function(config) {


        Ext.apply(this, config);

        // debug('config.isExclusions: ' + !!config.isExclusions);

        //if (config.isExclusions) alert('foo');  // RD

        this.isExclusions = !!config.isExclusions ? config.isExclusions : false;


        //this.width ? 1 : (this.width = 'auto');
        this.width = 'auto';

        this.myData = [
            {
                id: '',
                size: '',
                dataSourceId: '',
                iconCls: ''
            }
        ];
        this.myData[0].name = '';

        this.store = new Ext.data.ArrayStore({
            fields: [
                {
                    name: 'id'
                },
                {
                    name: 'name'
                },
                {
                    name: 'size'
                },
                {
                    name: 'price'
                },
                {
                    name: 'dataSourceId'
                },
                {
                    name: 'displayOrder'
                },
                {
                    name: 'floorPrice'
                },
                {
                    name: 'recommendedPrice'
                },
                {
                    name: 'iconCls'
                }
            ]
        });

        //  debug(this.subsectionData);
        //  var is = Ext.DomQuery.select("subSection", data);
        if (!this.edit) {
            // add empty row to accept drop
            this.store.loadData(this.myData);


            // grid columns will have same columns as categories tree-grid
            checkCategory = this.section.checkCategory;
            // debug(checkCategory);
        } else {
            //fill with rows
            var categories = Ext.DomQuery.select('category', this.subsectionData);

            var checkCategory = categories[0];
            // debug(checkCategory);
            var categoriesLength = categories.length;

            for (var i = 0; i < categoriesLength; i++) {
                var row = {};
                for (var ii = 0; ii < this.infoHeaderAttrs.length; ii++) {
                    var a = this.infoHeaderAttrs[ii].attrName;
                    row[a] = Ext.DomQuery.selectValue('@' + a, categories[i]);
                    row['displayOrder'] = i + 1;
                }


                // row['dataSourceId'] = Ext.DomQuery.selectValue('@dataSourceId', categories[i]);
                if (config.isExclusions) {
                    // REG EXP 'NOT' + space IS USED IN setExclusions method!! // LS
                    row['name'] = 'NOT ' + row['name'];
                }


                //dataSourceId
                //row['name'] += App.AudienceSegmentsUtils.getDataSourceText(row['dataSourceId']);

                this.insertCategory(row);
            }
        }

        var columns = [];
        var infoHeaderAttrslength = this.infoHeaderAttrs.length;

        for (var i = 0; i < infoHeaderAttrslength; i++)
            if (
                this.infoHeaderAttrs[i].grid
            // checkAttrPresence removed to show datasource//LS
            //    &&  this.section.checkAttrPresence(this.infoHeaderAttrs[i].attrName, checkCategory)
                ) {
                var col = {
                    id: this.infoHeaderAttrs[i].attrName,
                    header: this.infoHeaderAttrs[i].displayName,
                    dataIndex: this.infoHeaderAttrs[i].attrName,
                    menuDisabled: true,
                    width: this.infoHeaderAttrs[i].width,
                    align: this.infoHeaderAttrs[i].align
                };
                if (this.infoHeaderAttrs[i].renderer)
                    col.renderer = this.infoHeaderAttrs[i].renderer;

                if (i == 0) {
                    col.cellActions = [
                        {
                            iconIndex: 'iconCls',
                            align: 'left',
                            hide: true
                        }
                    ];
                }
                columns.push(col);
            }

        // label changes depending on if this is exclusions - RD
        var gridHeaderLabel = 'LABEL_SUBSECTION_SEGMENTS';
        var id = '';
        if (config.isExclusions) {
            gridHeaderLabel = 'Exclude All ';
            id = 'app-id-excluded-section';
        }
        // end label changes for exclusions - RD

        this.grid = new Ext.grid.GridPanel({
            //isExclusions : config.isExclusions,   // RD
            ddGroup: 'categoriesGridDDGroup',
            id: id,
            store: this.store,
            columns: columns,
            viewConfig: {
                autoFill: true,
                forceFit: true
            },
            tbar: ([
                {
                    xtype: 'tbspacer'
                },
                {
                    xtype: 'tbspacer'
                },
                {
                    xtype: 'label',
                    text: __(gridHeaderLabel)
                },
                {
                    xtype: 'tbfill'
                },
                (this.dynamic ? {
                    text: __('LABEL_DELETE'),
                    handler: (function(panel) {

                        return function(e1, e2) {
                            // debug(panel);
                            if (!! panel.isExclusions) {
                                panel.section.fireEvent('exclusionRemoved');
                                Ext.getCmp('app-add-exclusion-button').enable();
                            }
                            panel.destroy();
                            panel.section.fireEvent('subsectionsChanged');
                            panel.section.fireEvent('recalculateInfo');

                        };

                    })(this),
                    cls: 'x-always-active'
                } : {
                    xtype: 'tbspacer'
                }),
                {
                    xtype: 'tbspacer'
                },
                {
                    xtype: 'tbspacer'
                },
                {
                    xtype: 'tbspacer'
                },
                {
                    xtype: 'tbspacer'
                },
                {
                    xtype: 'tbspacer'
                }
            ]),
            autoHeight: true
        });

        this.grid.subsection = this;

        if (this.dynamic) {
            var cellActions = new Ext.ux.grid.CellActions({
                align: 'left',
                callbacks:{
                    'icon-delete': (function (subsection) {
                        return function(grid, record, action, value) {
                            if (grid.store.getCount() == 1) {
                                var p = {
                                    id: '',
                                    size: '',
                                    iconCls: ''
                                };
                                p.name = '';
                                subsection.insertCategory(p);
                            }
                            grid.store.remove(record);
                            grid.subsection.section.fireEvent('recalculateInfo');
                        };

                    })(this)
                }
            });
            cellActions.init(this.grid);
        }

        //if (this.grid.isExclusions) alert('not foobar');

        this.grid.addListener('render', function() {
            var grid = this;
            var target = new Ext.dd.DropTarget(this.getView().mainBody, {
                ddGroup: 'categoriesGridDDGroup',
                copy: false,
                notifyDrop: function(dragSource, event, data) {

                    //debug('watch your droppings... isExclusions=' + config.isExclusions);

                    // element has been already inserted into this grid
                    if (grid.store.find('id', new RegExp("^" + data.node.attributes.id + "$")) != -1) {
                        Ext.MessageBox.show({
                            title: __('MESSAGE_TITLE_CANNOT_ADD_CATEGORY'),
                            msg: __('MESSAGE_CANNOT_ADD_CATEGORY_SAME_ERROR'),
                            buttons: Ext.Msg.OK
                        });
                        return;
                    }

                    if (grid.store.getCount() == 1 &&
                        grid.store.getAt(0).data.id == '' &&
                        grid.store.getAt(0).data.name == '') {
                        grid.store.removeAll();
                    }

                    var path = [];
                    var parent_ids = [];
                    (function(node) {
                        path.push(node.attributes.name);
                        parent_ids.push(node.attributes.id);
                        if (node.parentNode.id != -1)
                            arguments.callee(node.parentNode);
                    })(data.node);
                    path.reverse();

                    for (var i = 0; i < parent_ids.length; i++) {
                        var p_id = parent_ids[i];
                        if (grid.store.find('id', new RegExp("^" + p_id + "$")) != -1) {
                            Ext.MessageBox.show({
                                title: __('MESSAGE_TITLE_CANNOT_ADD_CATEGORY'),
                                msg: __('MESSAGE_CANNOT_ADD_CATEGORY_PARENT_ERROR'),
                                buttons: Ext.Msg.OK
                            });
                            return;
                        }
                    }

                    var title = path.join(grid.subsection.categoriesSeparator);
                    debug('getDataSourceId<-notifyDrop');
                    var p = {
                        id: data.node.attributes.id,
                        size: data.node.attributes.size,
                        price: data.node.attributes.price,
                        dataSourceId:  App.AudienceSegmentsUtils.getDataSourceId(),
                        floorPrice: data.node.attributes.floorPrice,
                        recommendedPrice: data.node.attributes.recommendedPrice
                    };

                    p.name = title;
                    p.isExclusions = 'false';// NOT USED
                    if (config.isExclusions) {
                        // REG EXP 'NOT' + space IS USED IN setExclusions method!! // LS
                        // DO NOT CHANGE IT // LS
                        p.name = 'NOT ' + title;  // RD
                        p.isExclusions = 'true';// NOT USED
                    }

                    // p.name += App.AudienceSegmentsUtils.getDataSourceText(App.AudienceSegmentsUtils.getDataSourceId());
                    p.isExclusions = this.isExclusions;
                    grid.subsection.insertCategory(p);
                    grid.subsection.section.fireEvent('recalculateInfo');
                }
            });
        });

        this.items = [];
        this.items.push(this.grid);

        // and all other components

        // remove AND for exclusions - RD
        //var andLabel = 'LABEL_AND_SUBSECTIONS_SEGMENTS';
        //if (config.isExclusions) andLabel = "----------";

        this.items.push(
            new Ext.form.Label({
                //text: __(andLabel),   // this is NOT the 'AND' between subsections - RD
                text: __('LABEL_AND_SUBSECTIONS_SEGMENTS'),
                style: {
                    fontWeight: 'bold',
                    margin: '10px',
                    display: 'block',
                    align: 'center'
                }
            }));
        App.AudienceSegments.SectionForm.SubSection.superclass.constructor.apply(this, arguments);
    }
});
