var CompactMenuPreference = { __proto__: CompactMenu,

init: function() {
  this.c_dump('prefInit');

  var icon_enable = document.getElementById('icon_enable');
  if (icon_enable) {
    icon_enable.checked = this.getBoolPref(this.PREF_ICON_ENABLED, false);
    icon_enable.doCommand();
    var icon_file = document.getElementById('icon_file');
    icon_file.file = this.getIconFile();
    if (icon_file.file) {
      var localIconFile = this.getLocalIconFile();
      if (localIconFile && localIconFile.exists())
        icon_file.image = this.toFileURI(localIconFile).spec;
    }
    var icon_multiple = document.getElementById('icon_multiple');
    icon_multiple.checked = this.getBoolPref(this.PREF_ICON_MULTIPLE, false);
    var icon_noborder = document.getElementById('icon_noborder');
    icon_noborder.checked = this.getBoolPref(this.PREF_ICON_NOBORDER, false);
  }

  this.addEventListener(window, 'unload', this, false);
  this.addEventListener(window, 'dialogaccept', this, true);
},

resetIcon: function() {
  this.__proto__.resetIcon.call(this);
  var icon_file = document.getElementById('icon_file');
  if (icon_file) {
    icon_file.image = null;
  }
},

accept: function() {
  this.c_dump('prefAccept');

  var icon_enable = document.getElementById('icon_enable');
  if (icon_enable) {
    var icon_file = document.getElementById('icon_file').file;
    this.setBoolPref(this.PREF_ICON_ENABLED, icon_enable.checked);
    if (icon_enable.checked && icon_file && icon_file.exists())
      this.setIconFile(icon_file);
    var icon_multiple = document.getElementById('icon_multiple');
    this.setBoolPref(this.PREF_ICON_MULTIPLE, icon_multiple.checked);
    var icon_noborder = document.getElementById('icon_noborder');
    this.setBoolPref(this.PREF_ICON_NOBORDER, icon_noborder.checked);
  }

  this.initIcon();
},

disableGroup: function(group, disabled) {
  if ('string' == typeof group)
    group = document.getElementById(group);
  var elements = group.getElementsByTagName('*');
  for (var i = elements.length; 0 <= --i;) {
    var element = elements[i];
    if ('disabled' in element && 'caption' != element.parentNode.nodeName)
      element.disabled = disabled;
  }
},

openImagePicker: function(title, filefield) {
  var nsIFilePicker = Components.interfaces.nsIFilePicker;
  var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
  fp.init(window, title, nsIFilePicker.modeOpen);
  fp.appendFilters(nsIFilePicker.filterImages);
  fp.appendFilters(nsIFilePicker.filterAll);
  if (nsIFilePicker.returnOK == fp.show()) {
    filefield = document.getElementById(filefield);
    filefield.file = fp.file;
    filefield.image = fp.fileURL.spec;
  }
},

// handle events

handleEvent: function(event) {
  switch (event.type) {
    case 'load'        : this.init(); break;
    case 'unload'      : this.destroy(); break;
    case 'dialogaccept': this.accept(); break;
  }
}

} // CompactMenuPreference
CompactMenuPreference.addEventListener(window, 'load', CompactMenuPreference, false);
