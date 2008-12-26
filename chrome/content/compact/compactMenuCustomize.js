var CompactMenuCustomize = { __proto__: CompactMenu,

_mainToolbarCollapsed: null,
_canceled: false,

init: function() {
  this.c_dump('customizeInit');

  if (window.gToolbox) {
    var windowtype = gToolbox.ownerDocument.documentElement.getAttribute('windowtype');
    if (windowtype) {
      this.c_dump('detect window : ' + windowtype);
      this.MAINWINDOWS = [windowtype];
    }
  }

  this.mapMenus(function(menu, index) {
    var id = menu.id || index;
    var eid = this.toMenuElementId(id);
    var visible = !this.isMenuHidden(id);
    this.addVisibleMenuCheckbox(menu, eid, visible);
  });

  var toolbar = this.getMainToolbar();
  this._mainToolbarCollapsed = toolbar && toolbar.collapsed

  this.hookFunction('restoreDefaultSet', /toolboxChanged\(\);|gToolboxChanged = true;/, 'CompactMenuCustomize.restoreMainToolbar(); $&');

  this.addEventListener(window, 'unload', this, false);
  this.addEventListener(window, 'dialogcancel', this, true);
},

accept: function() {
  this.c_dump('customizeAccept');

  this.mapMenus(function(menu, index) {
    var id = menu.id || index;
    var pref = this.toMenuPrefId(id);
    var eid = this.toMenuElementId(id);
    var item = document.getElementById(eid);
    this.setBoolPref(pref, !item.checked, true);
  });

  this.hideAll();
},

cancel: function() {
  this.c_dump('customizeCancel');
  this._canceled = true;
  var toolbar = this.getMainToolbar();
  if (toolbar) toolbar.collapsed = this._mainToolbarCollapsed;
  this.hideAll();
},

addVisibleMenuCheckbox: function(menu, id, checked) {
  var container = document.getElementById('compact-visible_menus');
  var item = document.getElementById(id) || document.createElement('checkbox');
  item.setAttribute('id', id);
  item.setAttribute('type', 'checkbox');
  item.setAttribute('label', menu.getAttribute('label'));
  item.setAttribute('accesskey', menu.getAttribute('accesskey'));
  item.setAttribute('checked', checked);
  var row = container.lastChild;
  if (4 <= row.childNodes.length) {
    row = document.createElement(row.nodeName);
    container.appendChild(row);
  }
  row.appendChild(item);
  return item;
},

restoreMainToolbar: function() {
  this.c_dump('restoreMainToolbar');

  this.mapMenus(function(menu, index) {
    var id = menu.id || index;
    var eid = this.toMenuElementId(id);
    var item = document.getElementById(eid);
    item.checked = true;
  });

  var toolbar = this.getMainToolbar();
  if (toolbar) toolbar.collapsed = false;
  this.hideAll();
},

// handle events

handleEvent: function(event) {
  switch (event.type) {
    case 'load':
      this.init();
      break;
    case 'dialogcancel':
      this.cancel();
      break;
    case 'unload':
      if (!this._canceled) this.accept();
      this.destroy();
      break;
  }
}

} // CompactMenuCustomize
CompactMenuCustomize.addEventListener(window, 'load', CompactMenuCustomize, false);
