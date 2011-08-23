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
  }
  this.prefField('icon_multiple', this.pref_icon_multiple);
  this.prefField('icon_noborder', this.pref_icon_noborder);
  this.prefField('icon_fixsize',  this.pref_icon_fixsize);
  this.prefField('icon_width',    this.pref_icon_width);
  this.prefField('icon_height',   this.pref_icon_height);
  icon_enable.doCommand(); // {en,dis}able group

  this.addEvents();
},

resetAllWindowIcons: function CMP_resetAllWindowIcons() {
  this.__proto__.resetAllWindowIcons.call(this);
  this.prefField('icon_file').image = null;
},

accept: function CMP_accept() {
  this.c_dump('prefAccept');

  this.pref_icon_enabled = this.prefField('icon_enable').checked;
  var iconFile = this.prefField('icon_file').file;
  if (iconFile && iconFile.exists())
    this.setIconFile(iconFile);
  this.pref_icon_multiple = this.prefField('icon_multiple').checked;
  this.pref_icon_noborder = this.prefField('icon_noborder').checked;
  this.pref_icon_fixsize  = this.prefField('icon_fixsize').checked;
  this.pref_icon_width    = this.prefField('icon_width').value;
  this.pref_icon_height   = this.prefField('icon_height').value;
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
                      function(subgroup) { subgroup.doCommand(); });
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
  function disableGroupOnCommand(event) {
    var group = this.getAttribute('target_group');
    CompactMenuPreference.disableGroup(group, !this.checked);
  }
  this.evaluateEach('//xul:checkbox[@target_group]', function(item) {
    this.addEventListener(item, 'command', disableGroupOnCommand, false);
  });

  this.addEventListener(window, 'unload', this, false);
  this.addEventListener(window, 'dialogaccept', this, true);
},

handleEvent: function CMP_handleEvent(aEvent) {
  switch (aEvent.type) {
    case 'load'        : this.init(); break;
    case 'unload'      : this.destroy(); break;
    case 'dialogaccept': this.accept(); break;
  }
}

// }}}1

} // CompactMenuPreference
CompactMenuPreference.addEventListener(window, 'load', CompactMenuPreference, false);
