/**
 * abstract parent class for window form classes
 */

Ext.ns('App');

App.FormWindow = Ext.extend(Ext.Window, {

    layout:'fit',
    width:500,
    height: 600,
    closeAction:'close',
    plain: true,
    closable: true,

    
    constructor: function(config) {
    
        config = config || {};

        this.modal =  !!config.modal ?  config.modal : true,
        this.draggable =  !!config.draggable ?  config.draggable : true,

        this.addEvents(
            'save', 'preSave', 'saveEdit', 'saveCreate',
            'load', 'preLoad', 'loadEdit', 'loadCreate'
        );

        this.saveHandle = (function (win) {return function() {
            win.fireEvent('preSave');
            if (config.edit) {
                win.fireEvent('saveEdit');
            } else {
                win.fireEvent('saveCreate');
            }
            win.fireEvent('save');
        }})(this);
        
        this.closeHandle =  !!config.closeHandler ? config.closeHandler : (function (win) {return function() {
            win.close();
        }})(this);
        
        this.buttons = [];
        
        this.saveButton = new Ext.Button({
            ref: '../saveButton',
            text: config.saveButtonText ? config.saveButtonText : __('BUTTON_SAVE'),
            handler: this.saveHandle,
            disabled: this.saveButtonDisabled ? this.saveButtonDisabled : false
        });
            
        this.cancelButton = new Ext.Button({
            ref: '../cancelButton',
            text: config.cancelButtonText ? config.cancelButtonText : __('BUTTON_CANCEL'),
            handler: this.closeHandle 
        });
        
        if (!config.hideSaveButton) {
            this.buttons.push(this.saveButton);
        }
        
        if (!config.hideCancelButton) {
            this.buttons.push(this.cancelButton);
        }
           
        this.addListener('show', function() {
            this.fireEvent('preLoad');
            if (config.edit){
                this.fireEvent('loadEdit');
            } else {
                this.fireEvent('loadCreate');
            }
            this.fireEvent('load');    
        });
        App.FormWindow.superclass.constructor.call(this, config);
    }
});

