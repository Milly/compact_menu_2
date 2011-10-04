var CompactMenuPreference = { __proto__: CompactMenu,

// dialog control methods {{{1

init: function CMP_init() {
  this.c_dump('prefInit');

  var icon_enable = this.prefField('icon_enable', this.pref_icon_enabled);
  var icon_file = this.prefField('icon_file');
  icon_file.file = this.pref_icon_file;
  if (icon_file.file) {
    var localIconFile = this.getLocalIconFile();
    if (localIconFile && localIconFile.exists())
      icon_file.image = this.toFileURI(localIconFile).spec;
    icon_file.label = decodeURIComponent(icon_file.label);
  }
  this.prefField('icon_multiple', this.pref_icon_multiple);
  this.prefField('icon_noborder', this.pref_icon_noborder);
  this.prefField('icon_fixsize',  this.pref_icon_fixsize);
  this.prefField('icon_width',    this.pref_icon_width);
  this.prefField('icon_height',   this.pref_icon_height);
  this.updateTargetGroup(icon_enable);

  this.addEvents();
},

resetAllWindowIcons: function CMP_resetAllWindowIcons() {
  this.__proto__.resetAllWindowIcons.call(this);
  this.prefField('icon_file').image = null;
},

accept: function CMP_accept() {
  this.c_dump('prefAccept');

  this.pref_icon_enabled = this.prefField('icon_enable').checked;
  var icon_file = this.prefField('icon_file');
  if (icon_file.file && icon_file.file.exists()) {
    this.setIconFile(icon_file.file);
    icon_file.image = this.toFileURI(this.getLocalIconFile()).spec;
  }
  this.pref_icon_multiple = this.prefField('icon_multiple').checked;
  this.pref_icon_noborder = this.prefField('icon_noborder').checked;
  this.pref_icon_fixsize  = this.prefField('icon_fixsize').checked;
  this.pref_icon_width    = this.prefField('icon_width').value;
  this.pref_icon_height   = this.prefField('icon_height').value;
},

userChanged: function CMP_userChanged(aTarget) {
  this.updateTargetGroup(aTarget);
  var instantApply = this.prefField('compactmenuPrefs').instantApply;
  if (instantApply)
    this.accept();
},

updateTargetGroup: function CMP_updateTargetGroup(aCheckbox) {
  var group = aCheckbox.getAttribute('target_group');
  if (group && !aCheckbox.disabled)
    this.disableGroup(group, !aCheckbox.checked);
},

disableGroup: function CMP_disableGroup(aGroup, aDisabled) {
  if ('string' == typeof aGroup)
    aGroup = this.prefField(aGroup);

  var elements = aGroup.getElementsByTagName('*');
  for (var i = elements.length; 0 <= --i;) {
    var element = elements[i];
    if ('disabled' in element)
      element.disabled = aDisabled;
  }

  if (!aDisabled) {
    this.evaluateEach('.//xul:checkbox[@target_group]', aGroup,
                      this.bind(function(subgroup) { this.updateTargetGroup(subgroup); }));
  }
},

openImagePicker: function CMP_openImagePicker(aTitle, aFileField) {
  var nsIFilePicker = Components.interfaces.nsIFilePicker;
  var fp = Components.classes["@mozilla.org/filepicker;1"]
                     .createInstance(nsIFilePicker);
  fp.init(window, aTitle, nsIFilePicker.modeOpen);
  fp.appendFilters(nsIFilePicker.filterImages);
  fp.appendFilters(nsIFilePicker.filterAll);
  if (nsIFilePicker.returnOK == fp.show()) {
    if ('string' == typeof aFileField)
      aFileField = this.prefField(aFileField);
    aFileField.file = fp.file;
    aFileField.image = fp.fileURL.spec;
    aFileField.label = decodeURIComponent(aFileField.label);
    var event = document.createEvent('Events');
    event.initEvent('change', true, true);
    aFileField.dispatchEvent(event);
  }
},

prefField: function CMP_prefField(aId, aValue) {
  var element = document.getElementById(aId);
  if (1 < arguments.length) {
    if ('checked' in element) {
      element.checked = aValue;
    } else {
      element.value = aValue;
    }
  }
  return element;
},

// handle events {{{1

addEvents: function CMP_addEvents() {
  this.addEventListener(window, 'command', this, true);
  this.addEventListener(window, 'change', this, true);
  this.addEventListener(window, 'unload', this, false);
  this.addEventListener(window, 'dialogaccept', this, true);
},

handleEvent: function CMP_handleEvent(aEvent) {
  switch (aEvent.type) {
    case 'load'        : this.init(); break;
    case 'unload'      : this.destroy(); break;
    case 'dialogaccept': this.accept(); break;
    case 'command'     :
    case 'change'      : this.userChanged(aEvent.originalTarget); break;
  }
}

// }}}1

} // CompactMenuPreference
CompactMenuPreference.addEventListener(window, 'load', CompactMenuPreference, false);
