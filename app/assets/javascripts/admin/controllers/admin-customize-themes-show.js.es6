import { default as computed } from 'ember-addons/ember-computed-decorators';

export default Ember.Controller.extend({

  @computed("colorSchemeId", "model.color_scheme_id")
  colorSchemeChanged(colorSchemeId, existingId) {
    colorSchemeId = colorSchemeId === null ? null : parseInt(colorSchemeId);
    return  colorSchemeId !== existingId;
  },

  @computed("availableChildThemes", "model.childThemes.@each", "model")
  selectableChildThemes(available, childThemes) {
    let themes = [];
    available.forEach(t=> {
      if (!childThemes || (childThemes.indexOf(t) === -1)) {
        themes.push(t);
      };
    });
    return themes.length === 0 ? null : themes;
  },

  @computed("allThemes", "allThemes.length", "model")
  availableChildThemes(allThemes, count) {
    if (count === 1) {
      return null;
    }

    let excludeIds = [this.get("model.id")];

    let themes = [];
    allThemes.forEach(theme => {
      if (excludeIds.indexOf(theme.get("id")) === -1) {
        themes.push(theme);
      }
    });

    return themes;
  },

  actions: {
    cancelChangeScheme() {
      this.set("colorSchemeId", this.get("model.color_scheme_id"));
    },
    changeScheme(){
      let schemeId = this.get("colorSchemeId");
      this.set("model.color_scheme_id", schemeId === null ? null : parseInt(schemeId));
      this.get("model").saveChanges("color_scheme_id");
    },
    startEditingName() {
      this.set("oldName", this.get("model.name"));
      this.set("editingName", true);
    },
    cancelEditingName() {
      this.set("model.name", this.get("oldName"));
      this.set("editingName", false);
    },
    finishedEditingName() {
      this.get("model").saveChanges("name");
      this.set("editingName", false);
    },

    applyDefault() {
      this.get("model").saveChanges("default");
    },

    applyUserSelectable() {
      this.get("model").saveChanges("user_selectable");
    },

    addChildTheme() {
      let themeId = parseInt(this.get("selectedChildThemeId"));
      let theme = this.get("allThemes").findBy("id", themeId);
      this.get("model").addChildTheme(theme);
    },

    removeChildTheme(theme) {
      this.get("model").removeChildTheme(theme);
    },

    destroy() {
      return bootbox.confirm(I18n.t("admin.customize.delete_confirm"), I18n.t("no_value"), I18n.t("yes_value"), result => {
        if (result) {
          const model = this.get('model');
          model.destroyRecord().then(() => {
            this.get('allThemes').removeObject(model);
            this.transitionToRoute('adminCustomizeThemes');
          });
        }
      });
    },

  }

});
