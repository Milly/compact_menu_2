var CompactMenuCustomize = { __proto__: CompactMenu,

// state vars {{{1

_mainToolbarCollapsed: null,
_canceled: false,

// dialog control methods {{{1

init: function() {
  this.c_dump('customizeInit');

  if (window.gToolbox) {
    var windowtype = gToolbox.ownerDocument.documentElement.getAttribute('windowtype');
    if (windowtype) {
      this.c_dump('detect window : ' + windowtype);
      this.MAINWINDOWS = [windowtype];
    }
  }

  if (!this.getCurrentMenuContainer()) {
    var box = document.getElementById('compact-visible-menus');
    box.style.setProperty('display', 'none', '');
    return;
  }

  this.hideAll();

  this.mapMenus(function(menu, index) {
    var id = menu.id || index;
    var eid = this.toMenuElementId(id);
    var visible = !this.isMenuHidden(id);
    this.addVisibleMenuCheckbox(menu, eid, visible);
  });

  var toolbar = this.getMainToolbar();
  this._mainToolbarCollapsed = toolbar && toolbar[this.HIDE_ATTRIBUTE];

  this.hookFunction('restoreDefaultSet', function() {
    CompactMenuCustomize.restoreMainToolbar();
    restoreDefaultSet_without_CompactMenu.apply(this, arguments);
    CompactMenuCustomize.hideAll();
  });

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
  if (toolbar) toolbar[this.HIDE_ATTRIBUTE] = this._mainToolbarCollapsed;
  this.hideAll();
},

addVisibleMenuCheckbox: function(menu, id, checked) {
  var container = document.getElementById('compact-visible-menu-items');
  var item = document.getElementById(id) || document.createElement('checkbox');
  item.setAttribute('id', id);
  item.setAttribute('type', 'checkbox');
  item.setAttribute('label', menu.getAttribute('label'));
  item.setAttribute('accesskey', menu.getAttribute('accesskey'));
  item.setAttribute('checked', checked);
  container.appendChild(item);
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
  if (toolbar) toolbar[this.HIDE_ATTRIBUTE] = false;
  this.hideAll();
},

// handle events {{{1

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

// }}}1

} // CompactMenuCustomize
CompactMenuCustomize.addEventListener(window, 'load', CompactMenuCustomize, false);
