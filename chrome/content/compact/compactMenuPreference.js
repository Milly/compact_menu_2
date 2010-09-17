var CompactMenuPreference = { __proto__: CompactMenu,

// dialog control methods {{{1

init: function CMP_init() {
  this.c_dump('prefInit');

  var icon_enable = this.getBoolPrefToElement(this.PREF_ICON_ENABLED, 'icon_enable', false);
  icon_enable.doCommand();
  var icon_file = document.getElementById('icon_file');
  icon_file.file = this.getIconFile();
  if (icon_file.file) {
    var localIconFile = this.getLocalIconFile();
    if (localIconFile && localIconFile.exists())
      icon_file.image = this.toFileURI(localIconFile).spec;
  }
  this.getBoolPrefToElement(this.PREF_ICON_MULTIPLE, 'icon_multiple', false);
  this.getBoolPrefToElement(this.PREF_ICON_NOBORDER, 'icon_noborder', false);
  this.getBoolPrefToElement(this.PREF_ICON_FIXSIZE, 'icon_fixsize', false);

  this.addEventListener(window, 'unload', this, false);
  this.addEventListener(window, 'dialogaccept', this, true);
},

resetAllWindowIcons: function CMP_resetAllWindowIcons() {
  this.__proto__.resetAllWindowIcons.call(this);
  var icon_file = document.getElementById('icon_file');
  if (icon_file) {
    icon_file.image = null;
  }
},

accept: function CMP_accept() {
  this.c_dump('prefAccept');

  var icon_enable = this.setBoolPrefFromElement(this.PREF_ICON_ENABLED, 'icon_enable');
  var icon_file = document.getElementById('icon_file').file;
  if (icon_enable.checked && icon_file && icon_file.exists())
    this.setIconFile(icon_file);
  this.setBoolPrefFromElement(this.PREF_ICON_MULTIPLE, 'icon_multiple');
  this.setBoolPrefFromElement(this.PREF_ICON_NOBORDER, 'icon_noborder');
  this.setBoolPrefFromElement(this.PREF_ICON_FIXSIZE, 'icon_fixsize');
},

disableGroup: function CMP_disableGroup(group, disabled) {
  if ('string' == typeof group)
    group = document.getElementById(group);
  var elements = group.getElementsByTagName('*');
  for (var i = elements.length; 0 <= --i;) {
    var element = elements[i];
    if ('disabled' in element && 'caption' != element.parentNode.nodeName)
      element.disabled = disabled;
  }
},

openImagePicker: function CMP_openImagePicker(title, filefield) {
  var nsIFilePicker = Components.interfaces.nsIFilePicker;
  var fp = Components.classes["@mozilla.org/filepicker;1"]
                     .createInstance(nsIFilePicker);
  fp.init(window, title, nsIFilePicker.modeOpen);
  fp.appendFilters(nsIFilePicker.filterImages);
  fp.appendFilters(nsIFilePicker.filterAll);
  if (nsIFilePicker.returnOK == fp.show()) {
    filefield = document.getElementById(filefield);
    filefield.file = fp.file;
    filefield.image = fp.fileURL.spec;
  }
},

// preferences methods {{{1

getBoolPrefToElement: function CMP_getBoolPrefToElement(pref, id, defaultValue) {
  var element = document.getElementById(id);
  element.checked = this.getBoolPref(pref, defaultValue);
  return element;
},

setBoolPrefFromElement: function CMP_setBoolPrefFromElement(pref, id) {
  var element = document.getElementById(id);
  this.setBoolPref(pref, element.checked);
  return element;
},

// handle events {{{1

handleEvent: function CMP_handleEvent(event) {
  switch (event.type) {
    case 'load'        : this.init(); break;
    case 'unload'      : this.destroy(); break;
    case 'dialogaccept': this.accept(); break;
  }
}

// }}}1

} // CompactMenuPreference
CompactMenuPreference.addEventListener(window, 'load', CompactMenuPreference, false);
