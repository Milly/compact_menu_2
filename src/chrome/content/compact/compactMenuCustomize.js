var CompactMenuCustomize = { __proto__: CompactMenu,

// state vars {{{1

_mainToolbarCollapsed: null,
_canceled: false,

// dialog control methods {{{1

init: function CMC_init() {
  this.c_dump('customizeInit');

  if (window.gToolbox) {
    var windowtype = gToolbox.ownerDocument.documentElement
                                           .getAttribute('windowtype');
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

  this.mapMenus(function(aMenu, aIndex) {
    var id = aMenu.id || aIndex;
    this['_menuHidden_' + id] = this.isMenuHidden(id);
    this.addVisibleMenuCheckbox(aMenu, id);
  });

  var toolbar = this.getMainToolbar();
  if (toolbar) toolbar.setAttribute('customizing', true);
  this._mainToolbarCollapsed = toolbar && toolbar[this.HIDE_ATTRIBUTE];
  this.hideAll();
  this.initIcon();

  this.hookFunction('restoreDefaultSet', function CMC_restoreDefaultSet() {
    CompactMenuCustomize.restoreMainToolbar();
    restoreDefaultSet_without_CompactMenu.apply(this, arguments);
  });

  this.addEventListener(window, 'unload', this, false);
  this.addEventListener(window, 'dialogaccept', this, true);
  this.addEventListener(window, 'dialogcancel', this, true);
},

accept: function CMC_accept() {
  this.c_dump('customizeAccept');
},

cancel: function CMC_cancel() {
  this.c_dump('customizeCancel');
  this._canceled = true;

  this.mapMenus(function(aMenu, aIndex) {
    var id = aMenu.id || aIndex;
    var pref = this.toMenuPrefId(id);
    this.setBoolPref(pref, this['_menuHidden_' + id], true);
  });

  var toolbar = this.getMainToolbar();
  if (toolbar) toolbar[this.HIDE_ATTRIBUTE] = this._mainToolbarCollapsed;
},

addVisibleMenuCheckbox: function CMC_addVisibleMenuCheckbox(aMenu, aMenuId) {
  var eid = this.toMenuElementId(aMenuId);
  var container = document.getElementById('compact-visible-menu-items');
  var item = document.getElementById(eid) || document.createElement('checkbox');
  item.setAttribute('id', eid);
  item.setAttribute('menuid', aMenuId);
  item.setAttribute('type', 'checkbox');
  item.setAttribute('label', aMenu.getAttribute('label'));
  item.setAttribute('accesskey', aMenu.getAttribute('accesskey'));
  item.setAttribute('checked', !this.isMenuHidden(aMenuId));
  this.addEventListener(item, 'CheckboxStateChange', this, false);
  container.appendChild(item);
  return item;
},

restoreMainToolbar: function CMC_restoreMainToolbar() {
  this.c_dump('restoreMainToolbar');

  this.mapMenus(function(aMenu, aIndex) {
    var id = aMenu.id || aIndex;
    var eid = this.toMenuElementId(id);
    var item = document.getElementById(eid);
    item.checked = true;
  });

  var toolbar = this.getMainToolbar();
  if (toolbar) toolbar[this.HIDE_ATTRIBUTE] = false;
},

// event methods {{{1

ondialogaccept: function CMC_ondialogaccept(aEvent) {
  this.accept();
},

ondialogcancel: function CMC_ondialogcancel(aEvent) {
  this.cancel();
},

onunload: function CMC_onunload(aEvent) {
  if (!this._canceled) this.accept();
  this.destroy();
  var toolbar = this.getMainToolbar();
  if (toolbar) toolbar.removeAttribute('customizing');
  this.hideAll();
},

onCheckboxStateChange: function CMC_onCheckboxStateChange(aEvent) {
  var element = aEvent.originalTarget;
  var menuid = element.getAttribute('menuid');
  var pref = this.toMenuPrefId(menuid);
  this.setBoolPref(pref, !element.checked, true);
},

onfocus: false,
onmousedown: false,
onDOMMouseScroll: false,
onkeydown: false,
onkeyup: false,
onkeypress: false

// }}}1

} // CompactMenuCustomize
CompactMenuCustomize.addEventListener(window, 'load', CompactMenuCustomize, false);
