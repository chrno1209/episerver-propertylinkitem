define([
    // dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/url",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/when",
    "dojo/Deferred",

    // epi.shell
    "epi/shell/widget/_ModelBindingMixin",
    "epi/shell/widget/dialog/Dialog",

    // epi.cms
    "epi-cms/widget/_SelectorBase",

    // epi.widget
    "epi-cms/widget/LinkEditor",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.editlink",                        // used to get default title (common)
    "epi/i18n!epi/nls/episerver.shared"
],

    function (
        // dojo
        declare,
        lang,
        url,
        domClass,
        domStyle,
        domConstruct,
        when,
        Deferred,

        // epi.shell
        _ModelBindingMixin,
        Dialog,

        // epi.cms
        _SelectorBase,

        // epi.widget
        LinkEditor,

        // Resources
        resouce,
        sharedResources
    ) {

        return declare("episerver/editors/linkItemEditor", [_SelectorBase, _ModelBindingMixin], {
            // res: [public] Object
            //      Json language resource object used to get default title when insert/edit item.
            res: resouce,

            // dialogContentClass: [public] Class
            //      The widget class that will be created and placed as dialog's content
            dialogContentClass: LinkEditor,

            // dialogContentParams: [public] Object
            //      The parameters for create new instance of dialogContentClass.
            dialogContentParams: null,

            // dialogClass: [public] String
            //      The parameters for create new instance of dialog.
            dialogClass: 'epi-dialog-portrait',

            // defaultActionsVisible: [public] Bool
            //      .Flag which indicates whether the default confirm and cancel
            //		actions should be visible. This can only be set in the constructor.
            defaultActionsVisible: true,

            // confirmActionText: [public] String
            //      Label to be displayed for the confirm (positive) action.
            confirmActionText: sharedResources.action.ok,

            // cancelActionText: [public] String
            //      Label to be displayed for the cancel (negative) action.
            cancelActionText: sharedResources.action.cancel,

            _getTitle: function () {
                // summary:
                //      Customize base get method for title prop.
                // tags:
                //      protected override

                return this.title || lang.replace(this.value ? this.res.title.template.edit : this.res.title.template.create, this.res.title.action);
            },

            // tags:
            //      internal
            _setDisabledAttr: function (value) {
                this.inherited(arguments);
                this.button.set("disabled", value);
                this._set("disabled", value);
            },

            postMixInProperties: function () {
                // summary:
                //		Initialize properties
                // tags:
                //    protected

                this.inherited(arguments);

                if (!this.model && this.modelClassName) {
                    var modelClass = declare(this.modelClassName);
                    this.model = new modelClass();
                }
            },

            startup: function () {
                // summary:
                //      Overridden to reset input field.

                if (this._started) {
                    return;
                }

                this.inherited(arguments);
                !this.value && this.set("value", null);
            },

            isValid: function () {
                // summary:
                //    Check if widget's value is valid.
                // tags:
                //    protected

                return !this.required || !this.get("isEmpty"); // Not required or have some value.
            },

            _onDialogShow: function () {
                //summary:
                //    Handle onShow dialog event.
                // tags:
                //    protected

                this.inherited(arguments);

                var link = this.get("value");

                // we set the value to Editor
                this.contentSelectorDialog.set("value", link);
            },

            _onDialogExecute: function () {
                //summary:
                //    Handle dialog close through executing OK, Cancel, Delete commands
                // tags:
                //    protected

                // we need to get value back from LinkEditor
                var linkObj = this.contentSelectorDialog.get("value");

                // we're only interested in setting the link
                this.set("value", linkObj);
            },

            _getDialog: function () {
                // summary:
                //		Create dialog
                // tags:
                //    protected

                //if (this.dialog && this.dialog.domNode) {
                //	return this.dialog;
                //}

                this.contentSelectorDialog = new this.dialogContentClass(this.dialogContentParams || {});
                this.own(this.contentSelectorDialog);
                this.own(this.contentSelectorDialog.on('fieldCreated', lang.hitch(this, this._onFieldCreated)));

                this.dialog = new Dialog({
                    title: this._getTitle(),
                    dialogClass: this.dialogClass,
                    content: this.contentSelectorDialog,
                    destroyOnHide: false,
                    defaultActionsVisible: true
                });

                return this.dialog;
            },

            _onFieldCreated: function (fieldName, widget) {
            },

            _onButtonClick: function () {
                this.inherited(arguments);
            },

            _setValueAttr: function (value) {
                //summary:
                //    Value's setter.
                // tags:
                //  protected

                if (!value || (!value.permanentUrl && !value.href)) {
                    this.set("isEmpty", true);

                    this._setValueAndFireOnChange(null);
                    return;
                }

                // remap permanentUrl to href for DND
                if (value.permanentUrl && !value.href)
                    value.href = value.permanentUrl;

                this.set("isEmpty", false);
                this._setValueAndFireOnChange(value);
            },

            _setValueAndFireOnChange: function (value) {
                //summary:
                //    Sets the value internally and fires onChange if the value differs than the current value
                // tags:
                //  private

                var currentLink = this.get("value");
                this._set("value", value || {});

                // detect whether to invoke onChange or not
                var triggerOnChange = true;

                if (!currentLink && !value) {
                    triggerOnChange = false;
                } else if (value && value === currentLink) {
                    triggerOnChange = false;
                }

                if (triggerOnChange) {
                    this.onChange(value || {});
                }

                this._updateDisplayNode(value);
            },

            _updateDisplayNode: function (content) {
                //summary:
                //    Update widget's display text
                // tags:
                //    protected

                this.inherited(arguments);

                // content selector also sets Link id
                if (content) {
                    this._displayUrlInfo(content.href, content.text);
                } else {
                    this._displayUrlInfo('', '');
                }
            },

            _displayUrlInfo: function (url, name) {
                this.set("selectedContentLink", url);
                this.set("selectedContentName", name);
            }
        });
    });
