Ext.namespace('App');

App.AudienceSegments = {};
//Ext.onReady(function() {
Ext.apply(Ext.form.VTypes, {
    existingValuesText: __('ERROR_VALUE_EXISTS'),
    existingValues: function(v, field) {
        if (field.existingValues) {
            if (field.existingValues.indexOf(v) > -1) {
                return false;
            }
        }
        return true;
    }
});

Ext.apply(Ext.form.VTypes, {
    existingNames: function(v, field) {
        if (field.existingValues) {
            if (!(field.initialName && field.initialName === v)) {
                if (field.existingValues.indexOf(v) > -1) {
                    this.existingNamesText = __('ERROR_NAME_EXISTS');
                    return false;
                }
            }
        }
        if (!/^[\S].+[\S]$/i.test(v)) {
            this.existingNamesText = __('MESSAGE_NAME_VALIDATION');
            return false;
        }

        return true;
    }
});

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};


Ext.QuickTips.init();


App.AudienceSegmentsUtils = {

    getType: function(str) {
        return str.slice(0, 3);
    },

    getId: function(str) {
        return str.slice(3);
    },

    createButton: function(action, obj) {

        //  var ar = v.split('-');

        // var type = ar[0];
        //  var img = 'icons/' + action;

        return String.format('<img style="margin:  1px 2px;" src="../ext-3.3.1/resources/icons/{0}.png" onclick="App.AudienceSegmentsCalls.{0}(\'{1}\');"  qtip="{0}">', action, obj);

    },

    createButtonDisabled: function(action) {

        var img = action + '-disabled';

        return String.format('<img style="margin:  1px 2px;" src="../ext-3.3.1/resources/icons/{0}-disabled.png" qtip="Disabled for current segment status">', action);

    },

    getRoot: function() {

        return  Ext.getCmp('as-grid').root;
    },

    removeNode: function(node) {

        try {
            node.parentNode.removeChild(node);
        } catch(e) {
            debug(e);
        }
    },

    actionUrls : {
        listSegments: {
            // TODO!!! use static in debug
            url: '/dmp/audienceService/audienceSegments',
            //   url: '/static/data/segments/audienceSegments_1.xml',

            method: 'GET'
        },
        createSegment: {
            //url: '/dmp/audienceService/audienceSegment',
            url: 'api.php?action=create',
            method: 'POST'
        },
        deleteSegment: {
            // url: '/dmp/audienceService/audienceSegment/{segment-id}',
            url: 'api.php?action=archive&id={segment-id}',
            method: 'DELETE'
        },
        getSegment: {
            url: '/dmp/audienceService/audienceSegment/{segment-id}',
            method: 'GET'
        },
        updateSegment: {
            //url: '/dmp/audienceService/audienceSegment/{segment-id}',
            url: 'api.php?action=edit&id={segment-id}',
            method: 'PUT'
        },
        publishSegment: {
            //url: '/dmp/audienceService/audienceSegment/{segment-id}/publish',
            url: 'api.php?action=publish&id={segment-id}',
            method: 'PUT'
        },
        unpublishSegment: {
            // url: '/dmp/audienceService/audienceSegment/{segment-id}/unpublish',
            url: 'api.php?action=unpublish&id={segment-id}',
            method: 'PUT'
        },
        archiveSegment: {
            url: '/dmp/audienceService/audienceSegment/{segment-id}/archive',
            method: 'PUT'
        },
        copySegment: {
            //url: '/dmp/audienceService/audienceSegment/{segment-id}/copy',
            url: 'api.php?action=copy&id={segment-id}',
            method: 'PUT'
        },
        getSegmentUsage: {
            // url: '/dmp/audienceService/audienceSegment/{segment-id}/usage',
            url: 'api.php?action=usage&id={segment-id}',
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

        deleteSection: {
             url: 'api.php?action=delete&id={segment-id}',
            //url: '/dmp/audienceService/audienceSegment/{segment-id}/section/{section-id}',
            method: 'DELETE'
        }

    },


    getActionMethod:  function(sActionName) {
        return  App.AudienceSegmentsUtils.actionUrls[sActionName].method;
    },


    getActionUrl: function(sActionName, oParams) {
        var url = App.AudienceSegmentsUtils.actionUrls[sActionName].url;
        for (var k in oParams) {
            url = url.replace("{" + k + "}", oParams[k]);
        }
        return url;
    },

    getSection: function(segments, id) {
        var segmentsCount = segments.length;
        while (segmentsCount--) {
            if (segments[segmentsCount].findChild('id', id)) {
                return  segments[segmentsCount].findChild('id', id);
            }
        }

    },

    masksNum: 0,
    mask: function(win) {
        if (win) {
            win.body.mask(__('MESSAGE_LOADING'), 'x-mask-loading');
        } else {

            if (!!Ext.getCmp('as-grid')) {
                var cmp = Ext.getCmp('as-grid');
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

            if (!!Ext.getCmp('as-grid')) {
                var cmp = Ext.getCmp('as-grid');
                cmp.getEl().setStyle({
                    'z-index': '1'
                });
                cmp.getEl().unmask();


            }

        }
        App.AudienceSegmentsUtils.masksNum--;
    },
    removeicons: function() {

        var icons = Ext.query('.x-tree-node-icon');
        var i = icons.length;
        while (i--) {
            // function test(){

            icons[i].parentNode.removeChild(icons[i])
            //debug(icons[i]);

            // }
        }
    }
};

App.AudienceSegmentsCalls = {
    /*

     'addsegment'
     'addsection'

     'deletesegment'
     'deletesection'


     'editsegment'
     'editsection'


     'showuse'
     'publish'
     'unpublish'
     'copy'
     */

    add: function(id) {
        // go to add section page
        window.location.href = '#' ;
        // debug(id);
//        var Call = 'add' + App.AudienceSegmentsUtils.getType(id);
//        App.AudienceSegmentsCalls[Call](id);
        //       App.AudienceSegmentsCalls['addsec'](id);
    },

    addseg: function(id) {
        var form = new App.AudienceSegments.SegmentForm2();
        form.show();


        //App.AudienceSegments.createTreeNode(params);

    },


    edit: function(id) {
        var Call = 'edit' + App.AudienceSegmentsUtils.getType(id);
        App.AudienceSegmentsCalls[Call](id);
    } ,


    editseg: function(id) {
        var form = new App.AudienceSegments.SegmentForm2({
            edit: true,
            selNode: App.AudienceSegmentsUtils.getRoot().findChild('id', id)
        });

        form.show();
        //alert('Are you sure you want to rename ' + id)

    },

    editsec: function(id) {

        var segments = App.AudienceSegmentsUtils.getRoot()['childNodes'];
        var selNode = App.AudienceSegmentsUtils.getSection(segments, id);
        var segmentId = App.AudienceSegmentsUtils.getId(selNode.parentNode.attributes.id);
        var sectionId = App.AudienceSegmentsUtils.getId(selNode.attributes.id);


        debug(segmentId);
        window.location.href = '#' ;


    },



    delete: function(id) {
        var Call = 'delete' + App.AudienceSegmentsUtils.getType(id);
        App.AudienceSegmentsCalls[Call](id);
    },


    deletesec: function(id) {

        //  alert('Are you sure you want to delete  ' + id);

        var segments = App.AudienceSegmentsUtils.getRoot()['childNodes'];
        var selNode = App.AudienceSegmentsUtils.getSection(segments, id);
        var segmentId = App.AudienceSegmentsUtils.getId(selNode.parentNode.attributes.id);
        var sectionId = App.AudienceSegmentsUtils.getId(selNode.attributes.id);
        debug(segmentId);
        debug(sectionId);



           Ext.MessageBox.show({
            title: __('MESSAGE_TITLE_CONFIRM_ACTION'),
            msg: __('MESSAGE_DELETE_CONFIRMATION_SECTION'),
            buttons: Ext.Msg.OKCANCEL,
            fn: function(buttonId) {
                if (buttonId != 'ok') {
                    return;
                }
                var win = Ext.getCmp('as-grid');
                App.AudienceSegmentsUtils.mask(win);
                Ext.Ajax.request({
                    url: App.AudienceSegmentsUtils.getActionUrl('deleteSection', {
                        'segment-id': segmentId,
                        'section-id': sectionId
                    }),
                    method: App.AudienceSegmentsUtils.getActionMethod('deleteSection'),
                    success: function(response, request) {
                        App.AudienceSegmentsUtils.removeNode(selNode);
                        App.AudienceSegmentsUtils.unmask(win);
                    },
                    failure: function() {
                        App.AudienceSegmentsUtils.unmask(win);
                    }
                });
            }
        });


    },

    deleteseg: function(id) {

        // alert('Are you sure you want to delete ' + id);

        var selNode = App.AudienceSegmentsUtils.getRoot().findChild('id', id);
        // debug(selNode);

        Ext.MessageBox.show({
            title: __('MESSAGE_TITLE_CONFIRM_ACTION'),
            msg: __('MESSAGE_DELETE_CONFIRMATION_SEGMENT'),
            buttons: Ext.Msg.OKCANCEL,
            fn: function(buttonId) {
                if (buttonId != 'ok') {
                    return;
                }
                var win = Ext.getCmp('as-grid');
                App.AudienceSegmentsUtils.mask(win);
                Ext.Ajax.request({
                    url: App.AudienceSegmentsUtils.getActionUrl('deleteSegment', {
                        'segment-id':  App.AudienceSegmentsUtils.getId(id)
                    }),
                    method: App.AudienceSegmentsUtils.getActionMethod('deleteSegment'),
                    success: function(response, request) {
                        App.AudienceSegmentsUtils.removeNode(selNode);
                        App.AudienceSegmentsUtils.unmask(win);
                    },
                    failure: function() {
                        App.AudienceSegmentsUtils.unmask(win);
                    }
                });
            }
        });


    },

    show: function(id) {

//        win.render(id);
//        return;

        var selNode = App.AudienceSegmentsUtils.getRoot().findChild('id', id);
        var campaigns_list_form = new App.AudienceSegments.CampaignsListForm2({
            segmentId: App.AudienceSegmentsUtils.getId(id),
            segmentName: selNode.attributes.text,
            saveButtonText: __('BUTTON_OK'),
            hideCancelButton: true
        });
        debug(campaigns_list_form);

        campaigns_list_form.show();

    }  ,

    publish: function(id) {
        //  debug(id);
        var selNode = App.AudienceSegmentsUtils.getRoot().findChild('id', id);


        // todo publish non expanded nodes
        // if(selNode.hasChildNodes()){
        if (selNode.attributes.sections) {
            // alert('Are you sure you want to delete ' + id);

            // var selNode = App.AudienceSegmentsUtils.getRoot().findChild('id', id);
            // debug(selNode);

            Ext.MessageBox.show({
                title: __('MESSAGE_TITLE_CONFIRM_ACTION'),
                msg: __('MESSAGE_PUBLISH_CONFIRMATION_SEGMENT'),
                buttons: Ext.Msg.OKCANCEL,
                fn: function(buttonId) {
                    if (buttonId != 'ok') {
                        return;
                    }
                    var win = Ext.getCmp('as-grid');
                    App.AudienceSegmentsUtils.mask(win);
                    Ext.Ajax.request({
                        url: App.AudienceSegmentsUtils.getActionUrl('publishSegment', {
                            'segment-id':  App.AudienceSegmentsUtils.getId(id)
                        }),
                        method: App.AudienceSegmentsUtils.getActionMethod('publishSegment'),
                        success: function(response, request) {
                            window.location.href = '?afterpublish' + id;
                            App.AudienceSegmentsUtils.unmask(win);
                        },
                        failure: function() {
                            App.AudienceSegmentsUtils.unmask(win);
                        }
                    });
                }
            });

        } else {
            alert('Cant publish - no sections found in segment ' + id);
        }


    },
    unpublish: function(id) {
        // debug(id);
        Ext.MessageBox.show({
            title: __('MESSAGE_TITLE_CONFIRM_ACTION'),
            msg: __('MESSAGE_UNPUBLISH_CONFIRMATION_SEGMENT'),
            buttons: Ext.Msg.OKCANCEL,
            fn: function(buttonId) {
                if (buttonId != 'ok') {
                    return;
                }
                var win = Ext.getCmp('as-grid');
                App.AudienceSegmentsUtils.mask(win);
                Ext.Ajax.request({
                    url: App.AudienceSegmentsUtils.getActionUrl('unpublishSegment', {
                        'segment-id':  App.AudienceSegmentsUtils.getId(id)
                    }),
                    method: App.AudienceSegmentsUtils.getActionMethod('unpublishSegment'),
                    success: function(response, request) {
                        window.location.href = '?afterunpublish' + id;
                        App.AudienceSegmentsUtils.unmask(win);
                    },
                    failure: function() {
                        App.AudienceSegmentsUtils.unmask(win);
                    }
                });
            }
        });
    },

    copy: function(id) {
        // debug(id);
        var form = new App.AudienceSegments.SegmentForm2({
            copy: true,
            selNode: App.AudienceSegmentsUtils.getRoot().findChild('id', id)
        });

        form.show();
    }


};
//        splitmenu.showAt(100,100);
//return;

//App.onItemClick = function(item, obj) {
//
//    debug(item);
//    debug(obj);
//
//    return  Ext.MessageBox.show({
//        title: 'Menu Click',
//        msg: item.text,
//        buttons: Ext.Msg.OK
//    });
//
//};

App.SplitButton = function(node) {

   // debug(node);


    // for dynamically added segments attributes = node
    if (! node.attributes) node.attributes = node;

    //var id = objid.replace('SplitButtonClicker', '')
    var id = node.attributes.id;
    var status =  node.attributes.status;
    var sections =  node.attributes.sections;

    // exit if exists
    if (!! Ext.getCmp('SplitButton' + id)) {
        //debug(Ext.getCmp('SplitButton' + id));
        return false;
    }


    // default is 'In-Flight'
    var buttons = ['show'];
    var iconCls = 'bullet-red';


    switch (status) {
        case 'Unpublished':
            iconCls = 'bullet-green';
            buttons = ['add' ,  'copy' ,'edit'];

            if (sections > 0) {
                buttons.push('publish');
            }

             buttons.push('delete');

            break;
        case 'Published':
            iconCls = 'bullet-yellow';
            buttons = ['unpublish' , 'copy' , 'delete' ];
            break;

    }


    var items = [];
    var max = buttons.length;
    var i = 0;
    while (i < max) {
        // function test(){

        var text = buttons[i].toProperCase();

            switch (buttons[i]) {
                    case 'add':
                             text = 'Add section';
                        break;
                    case 'show':
                            text = 'Show use';
                        break;

                }

        items.push({
            text: text,
            seg: id,
            iconCls: buttons[i],
            action: buttons[i],
            handler: function(a) {
            debug(a);
                App.AudienceSegmentsCalls[a.action](a.seg)
            }
        });

        i++;
        // }
    }


    var sb = new Ext.Toolbar.SplitButton({
        id: 'SplitButton' + id,
        text: '',
        // handler: App.onItemClick ,
        tooltip: {text:'This is a an example QuickTip for a toolbar item', title:'Tip Title'},
        cls: 'inline',
        iconCls: iconCls,
        // Menus can be built/referenced by using nested menu config objects
        menu : {
            items: [  items ]
        }
    });

    //  sb.render('SplitButtonHolder' + objid);
    sb.render('SplitButtonHolder' + id);

     App.AudienceSegmentsUtils.removeicons();

    //debug('SplitButtonHolder' + id + ' created');
};


App.AudienceSegmentsGrid = new Ext.ux.tree.TreeGrid({

    animate: true,
    title: 'Segments lazy loading (JSON)',
    id: 'as-grid',
    width: 1200,
    height: 800,
    icon: '/aa/aa',
    overCls : 'nopointer',
    renderTo: Ext.getBody(),

    tbar: [
        {
            iconCls: 'add',
            text: 'Add segment',
            cls: 'x-always-active',
            handler: function() {
                App.AudienceSegmentsCalls.addseg();
                // alert('Go to the new segment page');
            }


        }
    ],

    columns:[
        {
            header: 'Segment',
            dataIndex: 'text',
            width: 800,

            // this acts as your column renderer
            /*
             'addsection'
             deletesegment'
             'editsegment'
             'showuse'
             'publish'
             'unpublish'
             'copy'
             'deletesection'
             'editsection'


             id: "seg2"
             leaf: false
             loader: Ext.apply.extend.K
             status: "In-Flight"
             text: "25-44, No-kids, 60k"

             */
            tpl: new Ext.XTemplate('{status:this.formatButtons}', {
                formatButtons: function(status, obj) {

                    //debug(obj);
                    var buttons = '';


                    if (obj.id.strpos('cat') === 0) {


                        return  'Category : ' + obj.text + ' [' + obj.datasource + ']';
                    }
                    if (obj.id.strpos('sub') === 0) {

                        return  '<span class="view_list">' + obj.text + '</span>';
                    }
                    if (obj.id.strpos('sec') === 0) {

                        var segments = App.AudienceSegmentsUtils.getRoot()['childNodes'];
                        var selNode = App.AudienceSegmentsUtils.getSection(segments, obj.id);

                        // debug(selNode);

                        if ('Unpublished' == selNode.parentNode.attributes.status) {

                            buttons += App.AudienceSegmentsUtils.createButton('edit', obj.id);
                            buttons += App.AudienceSegmentsUtils.createButton('delete', obj.id);
                        } else {
                           // buttons += App.AudienceSegmentsUtils.createButtonDisabled('edit');
                           // buttons += App.AudienceSegmentsUtils.createButtonDisabled('delete');
                        }

                        return  '' + buttons + obj.text + '';
                    }
                    if (obj.id.strpos('seg') === 0) {

/*

                        switch (status) {
                            case 'Unpublished':
                                buttons += App.AudienceSegmentsUtils.createButton('add', obj.id);
                                if (obj.sections > 0) {
                                    buttons += App.AudienceSegmentsUtils.createButton('publish', obj.id);
                                } else {
                                    buttons += App.AudienceSegmentsUtils.createButtonDisabled('publish');
                                }


                                buttons += App.AudienceSegmentsUtils.createButtonDisabled('unpublish', obj.id);
                                buttons += App.AudienceSegmentsUtils.createButton('copy', obj.id);
                                buttons += App.AudienceSegmentsUtils.createButton('edit', obj.id);
                                buttons += App.AudienceSegmentsUtils.createButton('delete', obj.id);
                                buttons += App.AudienceSegmentsUtils.createButtonDisabled('show', obj.id);

                                break;
                            case 'Published':
                                buttons += App.AudienceSegmentsUtils.createButtonDisabled('add', obj.id);
                                buttons += App.AudienceSegmentsUtils.createButtonDisabled('publish', obj.id);
                                buttons += App.AudienceSegmentsUtils.createButton('unpublish', obj.id);
                                buttons += App.AudienceSegmentsUtils.createButton('copy', obj.id);
                                buttons += App.AudienceSegmentsUtils.createButtonDisabled('edit', obj.id);
                                buttons += App.AudienceSegmentsUtils.createButton('delete', obj.id);
                                buttons += App.AudienceSegmentsUtils.createButtonDisabled('show', obj.id);

                                break;
                            case 'In-Flight':
                                buttons += App.AudienceSegmentsUtils.createButtonDisabled('add', obj.id);
                                buttons += App.AudienceSegmentsUtils.createButtonDisabled('publish', obj.id);
                                buttons += App.AudienceSegmentsUtils.createButtonDisabled('unpublish', obj.id);
                                buttons += App.AudienceSegmentsUtils.createButtonDisabled('copy', obj.id);
                                buttons += App.AudienceSegmentsUtils.createButtonDisabled('edit', obj.id);
                                buttons += App.AudienceSegmentsUtils.createButtonDisabled('delete', obj.id);
                                buttons += App.AudienceSegmentsUtils.createButton('show', obj.id);
                                break;
                        }

 */
                        //  return  ' ' + buttons + '  <span id="' + obj.id + '" class="bold">' + obj.text + '</span>';
                        //  return  '<p class="inline" id="SplitButtonHolder' + obj.id + '"></p><p class="inline" id="' + obj.id + '" class="bold">' + obj.text + '</p> <p class="inline" id="SplitButtonClicker' + obj.id + '" onclick="debug(this.id); App.SplitButton(this.id);">menu toggle</p>';
                        return  '<p class="inline" id="SplitButtonHolder' + obj.id + '"></p><p class="inline astext" id="' + obj.id + '" class="bold">' + obj.text + '</p>';


                        //return String.format(buttons + '<span id='' style' + obj.text + '</b>', obj);


                    }


                }
            })


        },
        {
            header: 'Status',
            width: 100,
            dataIndex: 'status'
        },
//        {
//            header: 'sections',
//            width: 100,
//            dataIndex: 'sections'
//        },
//            {
//                header: 'Data Source',
//                width: 100,
//                dataIndex: 'datasource'
//            },
        {
            header: 'Size',
            width: 150,
            dataIndex: 'size',
            tpl: new Ext.XTemplate('{size:this.formatSize}', {
                formatSize: function(size, obj) {
                    if (obj.id.strpos('seg') === 0) {
                        return '<b>' + obj.size + '</b>';
                    } else {
                        return obj.size;
                    }


                }
            })

        }

    ],

    dataUrl: 'treegrid-data.php',

    root: new Ext.tree.AsyncTreeNode({
        //                    text: 'Test',
        //                    nodeType: 'async',
        id:'-1'
    }),
    contextMenu: new Ext.menu.Menu({
        listeners: {
            itemclick: function(item) {
                //                            debug(item.id);
                //                            debug(selId);
                alert('action:' + item.id + ' , id :' + selId);
                switch (item.id) {
                    case 'delete-segment':
                        break;
                }
            }
        }
    }),
    listeners: {
        load: function(node) {


        }
    },

    selId: 0,
    selNode: null,
    selModel : new Ext.tree.DefaultSelectionModel({
        listeners: {
            selectionchange:

                function(selmodel, node) {
                    if (!!node && !!node.id) {
                        selId = node.id;
                        selStatus = node.attributes.status;
                        App.AudienceSegmentsGrid.selNode = node;

                    }
                }
        }
    })

});
//var AudienceSegments = new App.AudienceSegments();


App.AudienceSegments.SegmentForm2 = Ext.extend(App.FormWindow, {
    width: 300,
    height: 150,
    createCopy: function() {
// todo fix checkIfSegmentExists
//        if (App.AudienceSegments.checkIfSegmentExists(this.nameField.getValue())) {
//            Ext.MessageBox.show({
//                title: __('MESSAGE_SEGMENT_NAME_ALREADY_TAKEN_TITLE'),
//                msg: __('MESSAGE_SEGMENT_NAME_ALREADY_TAKEN'),
//                buttons: Ext.Msg.OK
//            });
//            return false;
//        }

        App.AudienceSegmentsUtils.mask(this);

        Ext.Ajax.request({

            url:  App.AudienceSegmentsUtils.getActionUrl('copySegment', {
                'segment-id': App.AudienceSegmentsUtils.getId(this.selNode.attributes.id)
            }),
            method:  App.AudienceSegmentsUtils.getActionMethod('copySegment'),
            headers: {
                'Content-Type':'text/xml; charset=utf-8'
            },
            params: '<segment status="Unpublished" name="' + this.nameField.getValue().htmlEncode() + '" />',
            success: (function(form) {
                return function(response, request) {
                    // we have to reload all tree
                    // see http://depot.redaril.com:8080/browse/DMPPROJECT-1413;
                    window.location.href = '?aftercopy';
                    // window.location.href = 'AudienceSegments.html';
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

//            if (App.AudienceSegments.checkIfSegmentExists(this.nameField.getValue())) {
//                Ext.MessageBox.show({
//                    title: __('MESSAGE_SEGMENT_NAME_ALREADY_TAKEN_TITLE'),
//                    msg: __('MESSAGE_SEGMENT_NAME_ALREADY_TAKEN'),
//                    buttons: Ext.Msg.OK
//                });
//                return false;
//            }

            App.AudienceSegmentsUtils.mask(this);


            Ext.Ajax.request({

                url: App.AudienceSegmentsUtils.getActionUrl('createSegment'),
                method: App.AudienceSegmentsUtils.getActionMethod('createSegment'),
                headers: {
                    'Content-Type':'text/xml; charset=utf-8'
                },
                params: '<segment status="Unpublished" name="' + this.nameField.getValue().htmlEncode() + '" />',
                success: (function(form) {
                    return function(response, request) {

                        var new_segment_id = Ext.DomQuery.selectValue('segment>@id', response.responseXML);

                        debug(new_segment_id);

                        var node = {
                            id: 'seg' + new_segment_id,
                            text: form.nameField.getValue().htmlEncode(),
                            sections: 0,
                            size: 0,
                            status:'Unpublished'
                        };


                        // debug(Ext.getCmp('as-grid'));

                        App.AudienceSegmentsUtils.getRoot().appendChild(node);
//                        var newNode = form.mainTree.createTreeNode(params);
//                        form.mainTree.insertNodeToRootNode(newNode);
//                        form.mainTree.segmentNameSave(form.nameField.getValue());
//                        newNode.select();
                         App.SplitButton(node);
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
            // todo fix
            /*
             if (
             this.nameField.getValue() != this.initialName       &&   App.AudienceSegments.checkIfSegmentExists(this.nameField.getValue())
             ) {
             Ext.MessageBox.show({
             title: __('MESSAGE_SEGMENT_NAME_ALREADY_TAKEN_TITLE'),
             msg: __('MESSAGE_SEGMENT_NAME_ALREADY_TAKEN'),
             buttons: Ext.Msg.OK
             });
             return false;
             }

             */


            // debug(this);
            // return false;

            App.AudienceSegmentsUtils.mask(this);

            Ext.Ajax.request({
                url: App.AudienceSegmentsUtils.getActionUrl('updateSegment', {
                    'segment-id': App.AudienceSegmentsUtils.getId(this.selNode.attributes.id)
                }),
                method: App.AudienceSegmentsUtils.getActionMethod('updateSegment'),
                headers: {
                    'Content-Type':'text/xml; charset=utf-8'
                },
                params: '<segment name="' + this.nameField.getValue().htmlEncode() + '" />',
                success: (function(form) {


// todo fix
//                        form.mainTree.segmentNameDelete(form.initialName);
//                        form.mainTree.segmentNameSave(form.nameField.getValue());
                    var displayText = form.nameField.getValue().htmlEncode();
                    Ext.fly(form.selNode.attributes.id).update(displayText);
                    //form.selNode.attributes.name = displayText;
                    //  form.selNode.setText(displayText);
                    form.close();
                    App.AudienceSegmentsUtils.unmask(form);


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

            (function(form) {


                var selNode = form.selNode;
//                        var id = Ext.DomQuery.selectValue('segment>@id', response.responseXML);
//                        var name = Ext.DomQuery.selectValue('segment>@name', response.responseXML);
                form.initialName = selNode.attributes.text;
                debug(Ext.get(selNode.attributes.id));
                form.nameField.setValue(Ext.get(selNode.attributes.id).dom.innerText);
                form.nameField.focus(false, 500);
                App.AudienceSegmentsUtils.unmask(form);


            })(this);


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

        App.AudienceSegments.SegmentForm2.superclass.constructor.call(this, config);
    }
});


App.AudienceSegments.CampaignsListForm2 = Ext.extend(App.FormWindow, {

    title: __('TITLE_CAMPAIGNS_LIST_FORM_SEGMENTS'),
    width: 600,
    height: 400,
    listeners: {
        save: function() {
            this.close();
        },

        show: function(form) {
            // todo fix!!!
//            var nameField = form.findById('app-id-segment-name-field');
//            if (nameField) {
//                nameField.existingValues = !! form.mainTree && !! form.mainTree.existingNames ? form.mainTree.existingNames : [];
//            } else {
//                nameField.existingValues = [];
//            }
        }

    },
    constructor: function(config) {
        Ext.apply(this, config);


//                segmentId: App.AudienceSegmentsUtils.getId(id),
//                segmentName: selNode.attributes.name,
//                saveButtonText: __('BUTTON_OK'),
//                hideCancelButton: true,
//                mainTree: {}

        this.grid = new Ext.grid.GridPanel({
            id: 'audience-segments-campaigns-form',
            title: this.segmentName,
            autoScroll: true,
            viewConfig: {
                forceFit: true
            },

            store: new Ext.data.XmlStore({
                autoDestroy: true,
                url: App.AudienceSegmentsUtils.getActionUrl('getSegmentUsage', {
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
            debug(form.grid.store);
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

        App.AudienceSegments.CampaignsListForm2.superclass.constructor.call(this, config);
    }
});
//});


App.AudienceSegments.loader = Ext.getCmp('as-grid').getLoader();
App.AudienceSegments.buttonscreated = false;


App.AudienceSegments.loader.on("load", function(a, node, c) {
//    debug(a);
   debug(node);
//    debug(c);

    if (!App.AudienceSegments.buttonscreated) {
        var i = node.childNodes.length;
        while (i--) {
            // function test(){

            //debug(node.childNodes[i]);
            App.SplitButton(node.childNodes[i]);
            // }
        }

    }
    App.AudienceSegments.buttonscreated = true;


    App.AudienceSegmentsUtils.removeicons();


    //b.findChild("id", 'seg1', true).select(); // can find by any parameter in the json
});