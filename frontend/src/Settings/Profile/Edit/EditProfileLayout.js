var _ = require('underscore');
var vent = require('vent');
var AppLayout = require('AppLayout');
var Marionette = require('marionette');
var Backbone = require('backbone');
var EditProfileItemView = require('./EditProfileItemView');
var QualitySortableCollectionView = require('./QualitySortableCollectionView');
var EditProfileView = require('./EditProfileView');
var DeleteView = require('../DeleteProfileView');
var seriesCollection = require('Series/seriesCollection');
var Config = require('Config');
var AsEditModalView = require('Mixins/AsEditModalView');

var view = Marionette.LayoutView.extend({
  template: 'Settings/Profile/Edit/EditProfileLayout',

  regions: {
    fields: '#x-fields',
    qualities: '#x-qualities'
  },

  ui: {
    deleteButton: '.x-delete'
  },

  _deleteView: DeleteView,

  initialize(options) {
    this.profileCollection = options.profileCollection;
    this.itemsCollection = new Backbone.Collection(_.toArray(this.model.get('items')).reverse());
    this.listenTo(seriesCollection, 'all', this._updateDisableStatus);
  },

  onRender() {
    this._updateDisableStatus();
  },

  onShow() {
    this.fieldsView = new EditProfileView({ model: this.model });
    this._showFieldsView();
    var advancedShown = Config.getValueBoolean(Config.Keys.AdvancedSettings, false);

    this.sortableListView = new QualitySortableCollectionView({
      selectable: true,
      selectMultiple: true,
      clickToSelect: true,
      clickToToggle: true,
      sortable: advancedShown,

      sortableOptions: {
        handle: '.x-drag-handle'
      },

      visibleModelsFilter(model) {
        return model.get('quality').id !== 0 || advancedShown;
      },

      collection: this.itemsCollection,
      model: this.model
    });

    this.sortableListView.setSelectedModels(this.itemsCollection.filter(function(item) {
      return item.get('allowed') === true;
    }));
    this.qualities.show(this.sortableListView);

    this.listenTo(this.sortableListView, 'selectionChanged', this._selectionChanged);
    this.listenTo(this.sortableListView, 'sortStop', this._updateModel);
  },

  _onBeforeSave() {
    var cutoff = this.fieldsView.getCutoff();
    this.model.set('cutoff', cutoff);
  },

  _onAfterSave() {
    this.profileCollection.add(this.model, { merge: true });
    vent.trigger(vent.Commands.CloseFullscreenModal);
  },

  _selectionChanged(newSelectedModels, oldSelectedModels) {
    var addedModels = _.difference(newSelectedModels, oldSelectedModels);
    var removeModels = _.difference(oldSelectedModels, newSelectedModels);

    _.each(removeModels, function(item) {
      item.set('allowed', false);
    });
    _.each(addedModels, function(item) {
      item.set('allowed', true);
    });
    this._updateModel();
  },

  _updateModel() {
    this.model.set('items', this.itemsCollection.toJSON().reverse());

    this._showFieldsView();
  },

  _showFieldsView() {
    this.fields.show(this.fieldsView);
  },

  _updateDisableStatus() {
    if (this._isQualityInUse()) {
      this.ui.deleteButton.addClass('disabled');
      this.ui.deleteButton.attr('title', 'Can\'t delete a profile that is attached to a series.');
    } else {
      this.ui.deleteButton.removeClass('disabled');
    }
  },

  _isQualityInUse() {
    return seriesCollection.where({ 'profileId': this.model.id }).length !== 0;
  }
});
module.exports = AsEditModalView.call(view);
