var CompactMenu = {

// constants {{{1

DEBUG: 'true' == '@debug@',

PREFROOT_COMPACTMENU:    'compact.menu.',
PREFBASE_HIDEMENU:       'hidemenu.',
PREFBASE_HIDETOOLBAR:    'hidetoolbar.',
PREF_ICON_ENABLED:       'icon.enabled',
PREF_ICON_FILE:          'icon.file',
PREF_ICON_LOCALFILENAME: 'icon.localfilename',
PREF_ICON_MULTIPLE:      'icon.multiple',
PREF_ICON_NOBORDER:      'icon.noborder',
PREF_ICON_FIXSIZE:       'icon.fixsize',
PREF_ICON_WIDTH:         'icon.fixsize.width',
PREF_ICON_HEIGHT:        'icon.fixsize.height',
PREFBASE_INITIALIZED:    'initialized.',
PREF_APPBUTTON_VISIBLE:  'appbutton.visible',
PREF_TABS_IN_TITLEBAR:   'tabsintitlebar.enabled',

MAINWINDOWS: [
    'navigator:browser',
    'mail:3pane',
    'mail:messageWindow',
    'mail:addressbook',
    'msgcompose',
    'calendarMainWindow',
    'Calendar:EventDialog',
  ],

MAINTOOLBOXS: [
    'navigator-toolbox',
    'mail-toolbox',
    'compose-toolbox',
    'ab-toolbox',
    'calendar-toolbox',
    'event-toolbox',
  ],

MAINTOOLBARS: [
    'toolbar-menubar',
    'mail-toolbar-menubar2',
    'addrbook-toolbar-menubar2',
    'compose-toolbar-menubar2',
    'main-toolbar',
    'event-menubar',
  ],

NAVITOOLBARS: [
    'nav-bar',
    'navigation-toolbar',
    'mail-bar3',
    'mail-bar2',
    'ab-bar2',
    'composeToolbar2',
    'msgToolbar',
    'calendar-bar',
    'event-toolbar',
  ],

TABTOOLBARS: [
    'TabsToolbar',
  ],

MENUBARS: [
    'main-menubar',
    'mail-menubar',
    'event-menubar',
  ],

APPBUTTONS: [
    'appmenu-button',
  ],

ITEMS: [
    'menu-button',
    'compact-menu',
  ],

POPUPS: [
    'menu-button-popup',
    'compact-menu-popup',
    'main-menu-popup',
    'appmenu-menu-popup',
  ],

SINGLE_POPUP: 'main-menu-popup',

get HIDE_ATTRIBUTE() {
  delete CompactMenu.HIDE_ATTRIBUTE;
  return (CompactMenu.HIDE_ATTRIBUTE =
    this.application.isSm ? 'hidden' : 'collapsed');
},

// debug methods {{{1

get console() {
  delete CompactMenu.console;
  return (CompactMenu.console =
    Components.classes["@mozilla.org/consoleservice;1"]
              .getService(Components.interfaces.nsIConsoleService));
},

c_dump: function CM_c_dump(aMsg) {
  if (this.DEBUG) {
    aMsg = 'Compact Menu :: ' + aMsg;
    this.console.logStringMessage(aMsg);
    dump(aMsg);
  }
},

// string methods {{{1

get strings() {
  delete CompactMenu.strings;
  return (CompactMenu.strings =
    Components.classes['@mozilla.org/intl/stringbundle;1']
              .getService(Components.interfaces.nsIStringBundleService)
              .createBundle('chrome://compact/locale/global.properties'));
},

getString: function CM_getString(aKey, aReplacements) {
  if (!aReplacements)
    return this.strings.GetStringFromName(aKey);
  return this.strings.formatStringFromName(aKey, aReplacements,
                                           aReplacements.length);
},

// preferences properties {{{1

// [RW] pref_icon_enabled {{{2
get pref_icon_enabled() {
  return this.prefs.getBoolPref(this.PREF_ICON_ENABLED);
},

set pref_icon_enabled(aValue) {
  this.prefs.setBoolPref(this.PREF_ICON_ENABLED, aValue);
},

// [RO] pref_icon_file {{{2
get pref_icon_file() {
  try {
    return this.prefs.getComplexValue(this.PREF_ICON_FILE,
                                      Components.interfaces.nsILocalFile);
  } catch (e) {
    return null;
  }
},

// [RW] pref_icon_multiple {{{2
get pref_icon_multiple() {
  return this.prefs.getBoolPref(this.PREF_ICON_MULTIPLE);
},

set pref_icon_multiple(aValue) {
  this.prefs.setBoolPref(this.PREF_ICON_MULTIPLE, aValue);
},

// [RW] pref_icon_noborder {{{2
get pref_icon_noborder() {
  return this.prefs.getBoolPref(this.PREF_ICON_NOBORDER);
},

set pref_icon_noborder(aValue) {
  this.prefs.setBoolPref(this.PREF_ICON_NOBORDER, aValue);
},

// [RW] pref_icon_fixsize {{{2
get pref_icon_fixsize() {
  return this.prefs.getBoolPref(this.PREF_ICON_FIXSIZE);
},

set pref_icon_fixsize(aValue) {
  this.prefs.setBoolPref(this.PREF_ICON_FIXSIZE, aValue);
},

// [RW] pref_icon_width {{{2
get pref_icon_width() {
  return this.prefs.getIntPref(this.PREF_ICON_WIDTH);
},

set pref_icon_width(aValue) {
  this.prefs.setIntPref(this.PREF_ICON_WIDTH, aValue);
},

// [RW] pref_icon_height {{{2
get pref_icon_height() {
  return this.prefs.getIntPref(this.PREF_ICON_HEIGHT);
},

set pref_icon_height(aValue) {
  this.prefs.setIntPref(this.PREF_ICON_HEIGHT, aValue);
},

// [RW] pref_appbutton_visible {{{2
get pref_appbutton_visible() {
  return this.prefs.getBoolPref(this.PREF_APPBUTTON_VISIBLE);
},

set pref_appbutton_visible(aValue) {
  this.prefs.setBoolPref(this.PREF_APPBUTTON_VISIBLE, aValue);
},

// [RW] pref_tabs_in_titlebar {{{2
get pref_tabs_in_titlebar() {
  return this.prefs.getBoolPref(this.PREF_TABS_IN_TITLEBAR);
},

set pref_tabs_in_titlebar(aValue) {
  this.prefs.setBoolPref(this.PREF_TABS_IN_TITLEBAR, aValue);
},

// }}}2

// preferences methods {{{1

get prefs() {
  delete CompactMenu.prefs;
  return (CompactMenu.prefs =
    Components.classes['@mozilla.org/preferences-service;1']
              .getService(Components.interfaces.nsIPrefService)
              .getBranch(this.PREFROOT_COMPACTMENU));
},

getBoolPref: function CM_getBoolPref(aName, aDefaultValue) {
  const PREF_BOOL = Components.interfaces.nsIPrefBranch.PREF_BOOL;
  if (this.prefs.prefHasUserValue(aName) && PREF_BOOL == this.prefs.getPrefType(aName))
    return this.prefs.getBoolPref(aName);
  return aDefaultValue;
},

isToolbarHidden: function CM_isToolbarHidden(aElementOrId) {
  var pref = this.toToolbarPrefId(aElementOrId);
  return this.getBoolPref(pref, false);
},

isMenuHidden: function CM_isMenuHidden(aId) {
  var pref = this.toMenuPrefId(aId);
  return this.getBoolPref(pref, false);
},

isMenuBarHidden: function CM_isMenuBarHidden() {
  return this.getMenuBar().hasAttribute('hidden');
},

setBoolPref: function CM_setBoolPref(aPref, aValue, aClearOnFalse) {
  if (aValue || !aClearOnFalse) {
    this.prefs.setBoolPref(aPref, !!aValue);
  } else if (this.prefs.prefHasUserValue(aPref)) {
      this.prefs.clearUserPref(aPref);
  }
},

toMenuElementId: function CM_toMenuElementId(aId) {
  return 'compact-showmenu-' + aId;
},

toInitializedPrefId: function CM_toInitializedPrefId(aElementOrId) {
  return this.toPrefId(aElementOrId, this.PREFBASE_INITIALIZED);
},

toMenuPrefId: function CM_toMenuPrefId(aElementOrId) {
  return this.toPrefId(aElementOrId, this.PREFBASE_HIDEMENU);
},

toToolbarPrefId: function CM_toToolbarPrefId(aElementOrId) {
  return this.toPrefId(aElementOrId, this.PREFBASE_HIDETOOLBAR);
},

toPrefId: function CM_toPrefId(aElementOrId, aPrefBaseName) {
  if (!aElementOrId)
    this.c_dump('toPrefId : ' + Error().stack);
  if (aElementOrId.ownerDocument) {
    var windowElement = aElementOrId.ownerDocument.documentElement;
    var id = aElementOrId.id;
  } else {
    var mainWindow = this.getMainWindow();
    var windowElement = mainWindow.document.documentElement;
    var id = aElementOrId;
  }
  var windowId = windowElement.id || '_id_';
  var windowType = windowElement.getAttribute('windowtype') || '_windowtype_';
  return aPrefBaseName + windowId + '-' + windowType + '.' + id;
},

_prefObserver: null,

registerPrefObserver: function CM_registerPrefObserver() {
  if (this._prefObserver) return;
  this._prefObserver = {
    observe: this.bind(function CM_registerPrefObserver_observe(aBranch, aTopic, aName) {
      if (aTopic == 'nsPref:changed' && 'onPrefChanged' in this)
        this.onPrefChanged(aName);
    })
  };
  this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
  this.prefs.addObserver('', this._prefObserver, false);
},

unregisterPrefObserver: function CM_unregisterPrefObserver() {
  if (!this._prefObserver) return;
  this.prefs.removeObserver('', this._prefObserver);
  this._prefObserver = null;
},

onPrefChanged: function CM_onPrefChanged(aName) {
  this.c_dump('onPrefChanged : ' + aName);
  switch (aName) {
    case this.PREF_ICON_ENABLED:
    case this.PREF_ICON_LOCALFILENAME:
    case this.PREF_ICON_MULTIPLE:
    case this.PREF_ICON_NOBORDER:
    case this.PREF_ICON_FIXSIZE:
    case this.PREF_ICON_WIDTH:
    case this.PREF_ICON_HEIGHT:
      this.delayBundleCall('change_icon', 20, this.bind(this.initIcon));
      break;
    case this.PREF_APPBUTTON_VISIBLE:
      if (window.updateAppButtonDisplay) updateAppButtonDisplay();
      break;
    case this.PREF_TABS_IN_TITLEBAR:
      this.updateTabsInTitlebar();
      break;
    default:
      if (0 == aName.indexOf(this.PREFBASE_HIDETOOLBAR) ||
          0 == aName.indexOf(this.PREFBASE_HIDEMENU))
        this.delayBundleCall('change_hide', 20, this.bind(this.hideAll));
      break;
  }
},

// element manipulate methods {{{1

getCurrentMenuContainer: function CM_getCurrentMenuContainer() {
  var document = (this.getMainWindow() || {}).document;
  if (document) {
    var containerIds = this.MENUBARS.concat(this.POPUPS);
    for each (var id in containerIds) {
      var menuContainer = document.getElementById(id);
      if (menuContainer && menuContainer.hasChildNodes()) {
        return menuContainer;
      }
    }
  }
  return null;
},

getElementByIds: function CM_getElementByIds(aIds) {
  var document = (this.getMainWindow() || {}).document;
  if (document) {
    for each (var id in aIds) {
      var item = document.getElementById(id);
      if (item) return item;
    }
  }
  return null;
},

getMainToolbar: function CM_getMainToolbar() {
  return this.getElementByIds(this.MAINTOOLBARS);
},

getMainToolbox: function CM_getMainToolbox() {
  return this.getElementByIds(this.MAINTOOLBOXS);
},

getMainWindows: function CM_getMainWindows() {
  const windowMediator = Components.classes['@mozilla.org/appshell/window-mediator;1']
                                   .getService(Components.interfaces.nsIWindowMediator);

  var windows = [];
  var mainWindow = this.getMainWindow();
  if (mainWindow) windows.push(mainWindow);
  var en = windowMediator.getEnumerator(null);
  while (en.hasMoreElements()) {
    var win = en.getNext();
    var type = win.document.documentElement.getAttribute('windowtype');
    if (0 <= this.MAINWINDOWS.indexOf(type) && mainWindow != win)
      windows.push(win);
  }

  return windows;
},

getMainWindow: function CM_getMainWindow() {
  if (this.mainWindowInitializing) return window;

  const windowMediator = Components.classes['@mozilla.org/appshell/window-mediator;1']
                                   .getService(Components.interfaces.nsIWindowMediator);

  var types = [].concat(this.MAINWINDOWS);
  var i = 0;
  for (var win = window; win; win = win.opener) {
    var currentWindowType = win.document.documentElement
                                        .getAttribute('windowtype');
    var pos = types.indexOf(currentWindowType);
    if (0 <= pos) {
      types.splice(pos, 1);
      types.unshift(currentWindowType);
      break;
    }
  }

  for each (var type in types) {
    var win = windowMediator.getMostRecentWindow(type);
    if (win) return win;
  }
  return null;
},

getMenuBar: function CM_getMenuBar() {
  return this.getElementByIds(this.MENUBARS);
},

getMenuItem: function CM_getMenuItem() {
  var document = (this.getMainWindow() || {}).document;
  if (document) {
    for each (var id in this.ITEMS) {
      var item = document.getElementById(id);
      if (item && 'toolbarpalette' != item.parentNode.nodeName) {
        var node = item;
        while ((node = node.parentNode) && 'toolbar' != node.nodeName);
        if (node && !node[this.HIDE_ATTRIBUTE]) return item;
      }
    }
  }
  return null;
},

getMenuPopup: function CM_getMenuPopup() {
  var item = this.getMenuItem();
  if (item)
    return item.getElementsByTagName('menupopup')[0];
  return this.getElementByIds([this.SINGLE_POPUP]);
},

getNavigationToolbar: function CM_getNavigationToolbar() {
  return this.getElementByIds(this.NAVITOOLBARS);
},

getTabsToolbar: function CM_getTabsToolbar() {
  return this.getElementByIds(this.TABTOOLBARS);
},

getAppButton: function CM_getAppButton() {
  return this.getElementByIds(this.APPBUTTONS);
},

showHideItems: function CM_showHideItems() {
  this.mapMenus(function(aMenu, aIndex) {
    var id = aMenu.id || aIndex;
    aMenu.hidden = this.isMenuHidden(id);
  });
},

hidePopup: function CM_hidePopup() {
  var document = (this.getMainWindow() || {}).document;
  if (document) {
    for each (var id in this.POPUPS) {
      var popup = document.getElementById(id);
      if (popup && popup.hidePopup) popup.hidePopup();
    }
  }
},

showHideMenuBar: function CM_showHideMenuBar() {
  var menubar = this.getMenuBar();
  if (menubar) {
    this.menuIt(menubar);
    var toolbar = this.getMainToolbar();
    var hide = !(toolbar && toolbar.getAttribute('customizing') == 'true')
             && (toolbar && toolbar[this.HIDE_ATTRIBUTE] || this.getMenuItem());
    if (hide) {
      menubar.setAttribute('hidden', 'true');
    } else {
      menubar.removeAttribute('hidden');
    }
  }
},

showHideToolbar: function CM_showHideToolbar() {
  var menubar = this.getMainToolbar();
  if (menubar)
    menubar[this.HIDE_ATTRIBUTE] = this.isToolbarHidden(menubar);
},

hideAll: function CM_hideAll() {
  this.hidePopup();
  this.showHideItems();
  this.showHideMenuBar();
  this.showHideToolbar();
},

toggleAppButtonShowHide: function CM_toggleAppButtonShowHide() {
  this.pref_appbutton_visible = !this.pref_appbutton_visible;
},

toggleTabsInTitlebar: function CM_toggleTabsInTitlebar() {
  this.pref_tabs_in_titlebar = !this.pref_tabs_in_titlebar;
},

updateTabsInTitlebar: function CM_updateTabsInTitlebar(reload) {
  this.c_dump('updateTabsInTitlebar');

  function docAttr(name) document.documentElement.getAttribute(name);

  var sizemode = docAttr('sizemode');
  var force = 'maximized' == sizemode || 'fullscreen' == sizemode;
  var enabled = this.pref_tabs_in_titlebar;
  if (reload)
    TabsInTitlebar.allowedBy_without_CompactMenu('sizemode', false);
  TabsInTitlebar.allowedBy_without_CompactMenu('sizemode', force || enabled);
  var allowed = ('true' == docAttr('tabsintitlebar'));
  this.c_dump('allowed='+allowed);

  var cmd = document.getElementById('cmd_ToggleTabsInTitlebar');
  cmd.setAttribute('checked', enabled);
  cmd.setAttribute('disabled', force || enabled && !allowed);
},

isRTL: function CM_isRTL() {
  var document = this.getMainWindow().document;
  var menubar = this.getMenuBar();
  return 'rtl' == document.defaultView.getComputedStyle(menubar, '').direction;
},

checkVisibility: function CM_checkVisibility(aElement) {
  if (!aElement) return false;
  do {
    if (aElement.hidden || aElement.collapsed) return false;
  } while (aElement = aElement.parentNode);
  return true;
},

mapMenus: function CM_mapMenus(aCallback) {
  var res = [];
  var menuContainer = this.getCurrentMenuContainer();
  if (menuContainer) {
    for (var i = 0; i < menuContainer.childNodes.length; ++i) {
      var menu = menuContainer.childNodes[i];
      if ('menu' == menu.localName)
      {
        var v = aCallback.call(this, menu, i);
        if ('undefined' != typeof v) res.push(v);
      }
    }
  }
  return res;
},

menuIt: function CM_menuIt(aTargetMenu) {
  if ('string' == typeof aTargetMenu)
    aTargetMenu = document.getElementById(aTargetMenu);
  if (aTargetMenu && !aTargetMenu.hasChildNodes()) {
    this.c_dump('menuIt : ' + aTargetMenu.id);
    var currentMenu = this.getCurrentMenuContainer();
    if (currentMenu && aTargetMenu != currentMenu) {
      while (currentMenu.firstChild) {
        aTargetMenu.appendChild(currentMenu.firstChild);
      }
    }
  }
},

openMenuPopup: function CM_openMenuPopup() {
  var popup = this.getMenuPopup();
  if (!popup) return;
  var anchor = null, position = '', x = 0, y = 0;
  if (this.SINGLE_POPUP != popup.id) {
    anchor = popup.parentNode;
    position = 'after_start';
  } else {
    let appbutton = this.getAppButton();
    if (appbutton && this.checkVisibility(appbutton)) {
      anchor = appbutton;
      position = 'after_start';
    }
    // ToDo: fix popup position when RTL
  }
  popup.openPopup(anchor, position, x, y, false, false);
},

setMenuTooltip: function CM_setMenuTooltip(aTooltip, aNode) {
  if ('menupopup' != aNode.parentNode.localName) {
    var menus = this.mapMenus(function(aMenu) {
      return aMenu.hidden ? undefined : aMenu.getAttribute('label');
    });
    var text = menus.slice(0, 2)
                    .concat(2 < menus.length ? ['...'] : [])
                    .join(' ');
    if (text) {
      aTooltip.setAttribute('label', text);
      return true;
    }
  }
  return false;
},

evaluate: function CM_evaluate(aXPath, aNode, aType) {
  aNode = aNode || document.documentElement;
  aType = ('undefined' != typeof aType) ? aType : XPathResult.FIRST_ORDERED_NODE_TYPE;
  var doc = aNode.ownerDocument || document;
  var namespaces = {
    xul: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
    html: 'http://www.w3.org/1999/xhtml'
  };
  function nsResolver(ns) namespaces[ns] || '';
  return doc.evaluate(aXPath, aNode, nsResolver, aType, null);
},

evaluateEach: function CM_evaluateEach(aXPath, aNode, aCallback) {
  if (2 == arguments.length) {
    aCallback = aNode;
    aNode = document.documentElement;
  }
  var items = this.evaluate(aXPath, aNode, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
  for (let i = 0; i < items.snapshotLength; ++i) {
    let item = items.snapshotItem(i);
    let res = aCallback.call(this, item, i);
    if (false === res) break;
  }
},

// keybord methods {{{1

dispatchKeyEvent: function CM_dispatchKeyEvent(aItem, aKeyCode, aCharCode) {
  var event = document.createEvent('KeyboardEvent');
  event.initKeyEvent('keypress', true, true, null,
                     false, false, false, false,
                     aKeyCode || 0, aCharCode || 0);
  aItem.dispatchEvent(event);
},

isMenuAccessKeyFocuses: function CM_isMenuAccessKey() {
  return nsPreferences.getBoolPref('ui.key.menuAccessKeyFocuses');
},

isMenuAccessKey: function CM_isMenuAccessKey(aEvent, aCheckKeyCode) {
  var accessKey = nsPreferences.getIntPref('ui.key.menuAccessKey');
  if (aCheckKeyCode) {
    if (aEvent.keyCode != accessKey) return false;
    if ('keyup' == aEvent.type)
      return !aEvent.shiftKey && !aEvent.ctrlKey &&
             !aEvent.altKey && !aEvent.metaKey;
  }
  switch (accessKey) {
    case KeyEvent.DOM_VK_CONTROL:
      return aEvent.ctrlKey && !aEvent.altKey && !aEvent.metaKey;
    case KeyEvent.DOM_VK_ALT:
      return !aEvent.ctrlKey && aEvent.altKey && !aEvent.metaKey;
    case KeyEvent.DOM_VK_META:
      return !aEvent.ctrlKey && !aEvent.altKey && aEvent.metaKey;
  }
  return false;
},

// icon methods {{{1

getLocalIconFile: function CM_getLocalIconFile() {
  var localFileName = this.prefs.getCharPref(this.PREF_ICON_LOCALFILENAME);
  if (!localFileName) return null;
  var localFile = this.toLocalFile(this.getProfileDir());
  localFile.appendRelativePath(localFileName);
  return localFile;
},

getProfileDir: function CM_getProfileDir() {
  return Components.classes["@mozilla.org/file/directory_service;1"]
                   .getService(Components.interfaces.nsIProperties)
                   .get("ProfD", Components.interfaces.nsIFile);
},

loadIcon: function CM_loadIcon() {
  this.clearIconStyle();
  var button = document.getElementById('menu-button');
  if (!button) return;

  var iconEnable = this.pref_icon_enabled;
  if (iconEnable) {
    var icon = this.getLocalIconFile();
    if (icon && icon.exists()) {
      this.c_dump('change icon: ' +  icon.path);
      var iconURI = this.toFileURI(icon).spec;
    }
  }

  if (!iconURI) {
    var listStyleImage = window.getComputedStyle(button, '')
                               .getPropertyValue('list-style-image');
    var iconURI = (listStyleImage.match(/url\((.*?)\)/) || [])[1] || '';
  }

  if (iconURI) {
    var img = new Image();
    img.onload = this.bind(function CM_loadIcon_img_onload() {
      this.c_dump('icon loaded: width='+img.width+', height='+img.height);
      if (img.width && img.height &&
          (iconEnable || 16 != img.width || 48 != img.height))
        this.setIconStyle(iconURI, img.width, img.height,
                          iconEnable && this.pref_icon_multiple,
                          iconEnable && this.pref_icon_noborder,
                          iconEnable && this.pref_icon_fixsize,
                          this.pref_icon_width, this.pref_icon_height);
    });
    img.src = iconURI;
  }
},

resetAllWindowIcons: function CM_resetAllWindowIcons() {
  var windows = this.getMainWindows();
  for each (var win in windows)
    win.CompactMenu.clearIconStyle();
},

_iconStyle: null,
setIconStyle: function CM_setIconStyle(aIconURI, aWidth, aHeight,
                                       aMultiple, aNoBorder, aFixSize,
                                       aFixWidth, aFixHeight) {
  this.clearIconStyle();
  const SSS = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                        .getService(Components.interfaces.nsIStyleSheetService);
  const IOS = Components.classes["@mozilla.org/network/io-service;1"]
                        .getService(Components.interfaces.nsIIOService);

  var code = '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);'
           + '#menu-button{list-style-image:url('+encodeURI(aIconURI)+')!important;}';
  if (aMultiple) {
    var h1 = Math.ceil(aHeight / 3), h2 = h1 * 2, h3 = h1 * 3;
    code += '#menu-button{-moz-image-region:rect(0px,'+aWidth+'px,'+h1+'px,0px)!important;}'
          + '#menu-button:hover{-moz-image-region:rect('+h1+'px,'+aWidth+'px,'+h2+'px,0px)!important;}'
          + '#menu-button[open="true"]{-moz-image-region:rect('+h2+'px,'+aWidth+'px,'+h3+'px,0px)!important;}';
  } else {
    code += '#menu-button{-moz-image-region:rect(0px,'+aWidth+'px,'+aHeight+'px,0px)!important;}';
  }
  if (aNoBorder)
    code += '#menu-button{border:none!important;padding:0!important;margin:0!important;background:transparent none!important;box-shadow:none!important;}';
  if (aFixSize) {
    code += '#menu-button>.toolbarbutton-icon{width:'+aFixWidth+'px!important;height:'+aFixHeight+'px!important;}';
  } else {
    code += '#menu-button>.toolbarbutton-icon{width:auto!important;height:auto!important;}';
  }

  this._iconStyle = IOS.newURI('data:text/css,' + encodeURIComponent(code), null, null);
  if (!SSS.sheetRegistered(this._iconStyle, SSS.AGENT_SHEET))
    SSS.loadAndRegisterSheet(this._iconStyle, SSS.AGENT_SHEET);
},

clearIconStyle: function CM_clearIconStyle() {
  if (!this._iconStyle) return;
  const SSS = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                        .getService(Components.interfaces.nsIStyleSheetService);
  if (SSS.sheetRegistered(this._iconStyle, SSS.AGENT_SHEET))
    SSS.unregisterSheet(this._iconStyle, SSS.AGENT_SHEET);
  this._iconStyle = null;
},

setIconFile: function CM_setIconFile(aFile) {
  this.resetAllWindowIcons();
  var lastLocalIconFile = this.getLocalIconFile();
  var destFile = this.toLocalIconFile(aFile);
  aFile.copyTo(destFile.parent, destFile.leafName);
  this.prefs.setCharPref(this.PREF_ICON_LOCALFILENAME, destFile.leafName);
  this.prefs.setComplexValue(this.PREF_ICON_FILE,
                             Components.interfaces.nsILocalFile, aFile);
  if (lastLocalIconFile && lastLocalIconFile.exists())
    lastLocalIconFile.remove(false);
},

toFileURI: function CM_toFileURI(aFile) {
  return Components.classes['@mozilla.org/network/io-service;1']
                   .getService(Components.interfaces.nsIIOService)
                   .newFileURI(aFile);
},

toLocalFile: function CM_toLocalFile(aFile) {
  if (aFile instanceof Components.interfaces.nsILocalFile)
    return aFile
  var localFile = Components.classes['@mozilla.org/file/local;1']
                            .createInstance(Components.interfaces.nsILocalFile);
  localFile.initWithPath(aFile.path);
  return localFile;
},

toLocalIconFile: function CM_toLocalIconFile(aFile) {
  var ext = (aFile.leafName.match(/\.[^.]+$/) || [''])[0];
  var localFile = this.toLocalFile(this.getProfileDir());
  localFile.appendRelativePath('compact' + (new Date()).getTime() + ext);
  return localFile;
},

// initialize methods {{{1

hookFunction: function CM_hookFunction(aTarget, aNewFunc) {
  try {
    var object = window, name = aTarget;
    if (aTarget instanceof Array)
      object = aTarget[0], name = aTarget[1];
    var orgFunc = object[name];
    if ('function' == typeof orgFunc) {
      object[name + '_without_CompactMenu'] = orgFunc;
      object[name + '_with_CompactMenu'] = object[name] = aNewFunc;
      this.c_dump('hooked "' + name + '"');
      return true;
    }
  } catch (e) {}
  this.c_dump('hook failed for "' + name + '" at ' + Components.stack.caller);
  return false;
},

hookAttribute: function CM_hookAttribute(aTarget, aAttrs, aCallback) {
  var has = {}, org = {};
  var hooks = {
    getAttribute: function(name) {
      return (null === aAttrs[name]) ? null :
                    (name in aAttrs) ? String(aAttrs[name]) :
                                       org.getAttribute.apply(this, arguments);
    },
    hasAttribute: function(name) {
      return (null === aAttrs[name]) ? true :
                                       org.hasAttribute.apply(this, arguments);
    }
  };
  for (let method in hooks) {
    has[method] = aTarget.hasOwnProperty(method);
    org[method] = aTarget[method];
    aTarget[method] = hooks[method];
  }

  try {
    let callback = aCallback, obj = null, args = [];
    if ('object' == typeof aCallback) {
      callback = aCallback[0];
      obj      = aCallback[1] || obj;
      args     = aCallback[2] || args;
    }
    return callback.apply(obj, args);
  } finally {
    for (let method in hooks) {
      delete aTarget[method];
      if (has[method]) aTarget[method] = org[method];
    }
  }
},

get application() {
  var appInfo = Components.classes['@mozilla.org/xre/app-info;1']
                          .getService(Components.interfaces.nsIXULAppInfo);
  var verComp = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
                          .getService(Components.interfaces.nsIVersionComparator)
  delete CompactMenu.application;
  return (CompactMenu.application = {
    isFx: appInfo.ID == '{ec8030f7-c20a-464f-9b0e-13a3a9e97384}',
    isTb: appInfo.ID == '{3550f703-e582-4d05-9a08-453d09bdfdc6}',
    isSb: appInfo.ID == '{718e30fb-e89b-41dd-9da7-e25a45638b28}',
    isSm: appInfo.ID == '{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}',
    version: appInfo.version,
    platformVersion: appInfo.platformVersion,
    compare: function CM_application_compare(aVersion) {
      return verComp.compare(this.version, aVersion);
    },
    platformCompare: function CM_application_platformCompare(aVersion) {
      return verComp.compare(this.platformVersion, aVersion);
    }
  });
},

init: function CM_init() {
  this.c_dump('init');
  this.mainWindowInitializing = true;

  if (this.application.isFx) {
    if (0 <= this.application.compare("4.0a")) {
      this.initToolbarContextMenu_Fx40();
    } else if (0 <= this.application.compare("3.6a")) {
      this.initToolbarContextMenu_Fx36();
    } else {
      this.initToolbarContextMenu_FxTb30();
    }
  } else if (this.application.isTb) {
    this.initToolbarContextMenu_FxTb30();
  } else if (this.application.isSb) {
    this.initToolbarContextMenu_Sb();
  } else if (this.application.isSm) {
    this.initToolbarContextMenu_Sm();
  }

  this.initMainToolbar();
  this.initIcon();
  this.addEvents();
  this.registerPrefObserver();
  this.initFirst();
  this.mainWindowInitializing = false;
},

initFirst: function CM_initFirst() {
  var navbar = this.getNavigationToolbar();
  var tabbar = this.getTabsToolbar();
  if (tabbar && tabbar.getAttribute('tabsontop') == 'true')
    navbar = tabbar;
  var initializedPref = this.toInitializedPrefId(navbar);
  if (this.getBoolPref(initializedPref)) return;
  this.setBoolPref(initializedPref, true);
  if (this.getMenuItem()) return;

  if ('insertItem' in navbar) {
    navbar.insertItem('menu-button', navbar.firstChild, null, false);
  } else {
    var buttons = navbar.currentSet.split(',');
    var newset = ['menu-button'].concat(buttons).join(',');
    navbar.currentSet = newset;
  }
  navbar.setAttribute('currentset', navbar.currentSet);
  navbar[this.HIDE_ATTRIBUTE] = false;
  document.persist(navbar.id, 'currentset');

  var menubar = this.getMainToolbar();
  menubar[this.HIDE_ATTRIBUTE] = true;

  var toolbox = this.getMainToolbox();
  if ('customizeDone' in toolbox)
    toolbox.customizeDone(true);

  this.delayBundleCall('init_first_popup', 1000,
                       this.bind(this.showArrowWindow));
},

showArrowWindow: function CM_showArrowWindow() {
  var menubar = this.getMainToolbar();
  var observer = {
    menubar: menubar,
    menubarHidden: this.isToolbarHidden(menubar),
    get panel() document.getElementById('compactArrowPanel'),
    // animation broken, if Gecko 1.9.1 or earlier
    movable: 0 <= this.application.platformCompare("1.9.2a"),

    initPopup: function CM_showArrowWindow_initPopup() {
      var self = this;

      this.panel.addEventListener('popupshown', function CM_showArrowWindow_popupshown() {
        if (self.movable)
          this.moveTo(0, 40, true, 0, function()
                      this.moveTo(0, -40, true, 500));
        this.fade(1, 300, function()
                  this.wait(10000, function()
                            this.hidePopup()));
      }, false);

      this.panel.addEventListener('popuphiding', function fadeHiding(aEvent) {
        aEvent.preventDefault();
        if (!this._hiding) {
          this._hiding = true;
          if (self.movable)
            this.moveTo(0, 40, true, 500);
          this.fade(-1, 200, function() {
            this.removeEventListener('popuphiding', fadeHiding, false);
            this.hidePopup()
          });
        }
        return false;
      }, false);

      this.panel.addEventListener('popuphidden', function CM_showArrowWindow_popuphidden() {
        var parent = this.parentNode;
        parent.removeChild(this);
        if (!parent.id && !parent.hasChildNodes())
          parent.parentNode.removeChild(parent);
      }, false);
    },

    openPopup: function CM_showArrowWindow_openPopup() {
      var menuitem = CompactMenu.getMenuItem();
      if (menuitem)
        this.panel.openPopup(menuitem, 'after_start', 0, 0, false, false);
    },

    observe: function CM_showArrowWindow_observe() {
      // menubar shown when overlay loaded
      this.menubar[CompactMenu.HIDE_ATTRIBUTE] = this.menubarHidden;

      if (this.panel) {
        this.initPopup();
        this.openPopup();
      }
    }
  };

  if (observer.panel) {
    observer.openPopup();
  } else {
    document.loadOverlay('chrome://compact/content/arrowWindow.xul', observer);
  }
},

initIcon: function CM_initIcon() {
  this.loadIcon();
},

_overlayLoading: false,

initMainToolbar: function CM_initMainToolbar() {
  var menubar = this.getMainToolbar();

  if ('true' == menubar.getAttribute(this.HIDE_ATTRIBUTE)) {
    menubar.removeAttribute(this.HIDE_ATTRIBUTE);
    document.persist(menubar.id, this.HIDE_ATTRIBUTE);
  }

  this.hookFunction([document, 'persist'], function CM_persist(aId, aAttr) {
    if (CompactMenu.HIDE_ATTRIBUTE == aAttr)
      for each (var menubar_id in CompactMenu.MAINTOOLBARS)
        if (menubar_id == aId) return;
    this.persist_without_CompactMenu.apply(this, arguments);
  });

  this.hookFunction([document, 'loadOverlay'], function CM_loadOverlay(aUrl, aObserver) {
    CompactMenu._overlayLoading = true;
    var hookObserver = {
      origObserver: aObserver,
      observe: function CM_loadOverlay_observe() {
        CompactMenu._overlayLoading = false;
        if (this.origObserver && this.origObserver.observe)
          this.origObserver.observe.apply(this.origObserver, arguments);
      }
    }
    this.loadOverlay_without_CompactMenu(aUrl, hookObserver)
  });

  this.addEventListener(menubar, 'DOMAttrModified',
                        this.bind(function CM_initMainToolbar_DOMAttrModified(aEvent) {
    if (this.HIDE_ATTRIBUTE == aEvent.attrName) {
      var newValue = 'true' == String(aEvent.newValue);
      var prevValue = 'true' == String(aEvent.prevValue);
      if (this._overlayLoading && !newValue && prevValue) {
        aEvent.target[this.HIDE_ATTRIBUTE] = true;
      } else {
        var pref = this.toToolbarPrefId(aEvent.target);
        this.setBoolPref(pref, newValue, true);
      }
    }
  }), false);

  menubar[this.HIDE_ATTRIBUTE] = this.isToolbarHidden(menubar);
},

initToolbarContextMenu_Fx40: function CM_initToolbarContextMenu_Fx40() {
  this.initToolbarContextMenu_Fx36();

  this.hookFunction('BrowserCustomizeToolbar',
                    function CM_BrowserCustomizeToolbar() {
    CompactMenu.showHideMenuBar();
    BrowserCustomizeToolbar_without_CompactMenu.apply(this, arguments);
  });

  this.hookFunction('updateAppButtonDisplay',
                    function CM_updateAppButtonDisplay() {
    var visible = CompactMenu.pref_appbutton_visible;
    CompactMenu.hookAttribute(
      CompactMenu.getMainToolbar(), { autohide: visible },
      [updateAppButtonDisplay_without_CompactMenu, this, arguments]);
    document.getElementById('cmd_ToggleAppButtonShowHide')
            .setAttribute('checked', visible);
    CompactMenu.updateTabsInTitlebar(true);
  });

  if (window.TabsInTitlebar) {
    this.hookFunction([TabsInTitlebar, 'allowedBy'],
                      function CM_TabsInTitlebar_allowedBy(condition, allow) {
      if ('sizemode' == condition) allow = false;
      TabsInTitlebar.allowedBy_without_CompactMenu(condition, allow);
    });
    this.addEventListener(window, 'resize', function() {
      CompactMenu.updateTabsInTitlebar();
    }, false);
  }

  updateAppButtonDisplay();
  this.initAdditionalContextMenu();
},

initToolbarContextMenu_Fx36: function CM_initToolbarContextMenu_Fx36() {
  this.initToolbarContextMenu_FxTb30();
  this.hookFunction('onViewToolbarCommand',
                    function CM_onViewToolbarCommand() {
    CompactMenu.hookAttribute(
      CompactMenu.getMainToolbar(), { type: null },
      [onViewToolbarCommand_without_CompactMenu, this, arguments]);
  });
  var menubar = this.getMainToolbar();
  menubar.setAttribute('autohide', false);
  document.persist(menubar, 'autohide');
},

initToolbarContextMenu_FxTb30: function CM_initToolbarContextMenu_FxTb30() {
  this.hookFunction('onViewToolbarsPopupShowing',
                    function CM_onViewToolbarsPopupShowing() {
    CompactMenu.hookAttribute(
      CompactMenu.getMainToolbar(), { type: null },
      [onViewToolbarsPopupShowing_without_CompactMenu, this, arguments]);
  });
},

initToolbarContextMenu_Sb: function CM_initToolbarContextMenu_Sb() {
  this.hookFunction('sbOnViewToolbarsPopupShowing',
                    function CM_sbOnViewToolbarsPopupShowing() {
    CompactMenu.hookAttribute(
      CompactMenu.getMainToolbar(), { type: null },
      [sbOnViewToolbarsPopupShowing_without_CompactMenu, this, arguments]);
  });
},

initToolbarContextMenu_Sm: function CM_initToolbarContextMenu_Sm() {
},

initAdditionalContextMenu: function CM_initAdditionalContextMenu() {
  var items = [ 'compactmenu-toggleAppButtonShowHide',
                'compactmenu-toggleTabsInTitlebar' ];
  this.evaluateEach('//xul:menuitem[@command="cmd_ToggleTabsOnTop"]', function(prev, i) {
    var next = prev.nextSibling;
    for each (let id in items) {
      let item = document.getElementById(id).cloneNode(true);
      item.id += i;
      prev.parentNode.insertBefore(item, next);
      if (!prev.hasAttribute('accesskey'))
        item.removeAttribute('accesskey');
    }
  });
},

onViewToolbarCommand: function CM_onViewToolbarCommand() {
  var menubar = this.getMainToolbar();
  if (menubar)
    menubar[this.HIDE_ATTRIBUTE] = !menubar[this.HIDE_ATTRIBUTE];
  this.hideAll();
},

onViewToolbarsPopupShowing: function CM_onViewToolbarsPopupShowing(aEvent, aMenuItemId) {
  if (window.onViewToolbarsPopupShowing) {
    var toolbox = this.getMainToolbox();
    window.onViewToolbarsPopupShowing(aEvent, toolbox.id);
  } else {
    var menubar = this.getMainToolbar();
    var menuitem = document.getElementById(aMenuItemId);
    if (menubar && menuitem)
      menuitem.setAttribute('checked', !menubar[this.HIDE_ATTRIBUTE]);
  }
},

// destroy methods {{{1

destroy: function CM_destroy() {
  this.c_dump('destroy');
  this.removeEventListeners();
  this.unregisterPrefObserver();
},

// event methods {{{1

get eventListeners() {
  if (!this.hasOwnProperty('_eventListeners'))
    this._eventListeners = [];
  return this._eventListeners;
},

addEventListener: function CM_addEventListener(aTarget, aType, aListener, aUseCapture) {
  aTarget.addEventListener(aType, aListener, aUseCapture);
  this.eventListeners.push([aTarget, aType, aListener, aUseCapture]);
},

removeEventListeners: function CM_removeEventListeners() {
  var listeners = this.eventListeners;
  this._eventListeners = [];
  for each (var l in listeners) {
    l[0].removeEventListener(l[1], l[2], l[3]);
  }
},

addEvents: function CM_addEvents() {
  this.addEventListener(window, 'unload', this, false);
  this.addEventListener(window, 'focus', this, true);
  this.addEventListener(window, 'blur', this, true);
  this.addEventListener(window, 'mousedown', this, true);
  this.addEventListener(window, 'DOMMouseScroll', this, true);
  this.addEventListener(window, 'keydown', this, true);
  this.addEventListener(window, 'keyup', this, true);
  this.addEventListener(window, 'keypress', this, true);
},

handleEvent: function CM_handleEvent(aEvent) {
  var handler = this['on' + aEvent.type];
  if (handler) handler.call(this, aEvent);
},

_delayBundleTimers: {},

delayBundleCall: function CM_delayBundleCall(aId, aDelay, aFunc) {
  var timers = this._delayBundleTimers;
  if (aId in timers) {
    timers[aId].cancel();
  } else {
    timers[aId] = Components.classes["@mozilla.org/timer;1"]
                            .createInstance(Components.interfaces.nsITimer);
  }
  timers[aId].init({ observe: function() { aFunc() } }, aDelay,
                   Components.interfaces.nsITimer.TYPE_ONE_SHOT);
},

bind: function CM_bind(aFunc) {
  var obj = this, args = Array.prototype.slice.call(arguments, 1);
  return function CM_binded() {
    return aFunc.apply(obj, Array.prototype.concat.apply(args, arguments));
  };
},

_menuKeyPressing: false,
_menuOpenCanceled: false,
_menuClosing: false,

onload: function CM_onload(aEvent) {
  this.init();
},

onunload: function CM_onunload(aEvent) {
  this.destroy();
},

onfocus: function CM_onfocus(aEvent) {
  this.hideAll();
  this._menuKeyPressing = false;
  this._menuOpenCanceled = true;
},

onblur: function CM_onblur(aEvent) {
  // avoid Alt-Tab (Task switching) on Firefox 3.5
  // 1. User push and release Alt-Tab
  // 2. Alt keydown detect, Tab keydown "NOT" detect
  // 3. Alt keyup detect
  // 4. window blur detect
  this._menuKeyPressing = false;
  this._menuOpenCanceled = true;
},

onmousedown: function CM_onmousedown(aEvent) {
  // avoid Download Link
  this._menuOpenCanceled = true;
},

onDOMMouseScroll: function CM_onDOMMouseScroll(aEvent) {
  // avoid Download Link
  this._menuOpenCanceled = true;
},

onkeydown: function CM_onkeydown(aEvent) {
  var pressing = this.isMenuAccessKey(aEvent, true);
  if (pressing && !this._menuKeyPressing) {
    var menuPopup = this.getMenuPopup();
    this._menuClosing = menuPopup && 'open' == menuPopup.state;
    this._menuOpenCanceled = this._menuClosing || !this.isMenuBarHidden();
  }
  this._menuKeyPressing = pressing;
},

onkeyup: function CM_onkeyup(aEvent) {
  if (this._menuKeyPressing && this.isMenuAccessKey(aEvent, true)) {
    this._menuKeyPressing = false;
    if (this.isMenuAccessKeyFocuses()) {
      if (!this._menuOpenCanceled || this._menuClosing)
        aEvent.stopPropagation();
      if (!this._menuOpenCanceled) {
        this.delayBundleCall('open_menupopup', 50, this.bind(function CM_open_menupoup() {
          if (!this._menuOpenCanceled)
            this.openMenuPopup();
        }));
      }
    }
  }
},

onkeypress: function CM_onkeypress(aEvent) {
  // avoid Alt-~ (Japanese IME switching), Space or Return (Link command)
  if (this._menuKeyPressing && (
      aEvent.altKey && aEvent.keyCode == KeyEvent.DOM_VK_BACK_QUOTE ||
      aEvent.keyCode == KeyEvent.DOM_VK_SPACE ||
      aEvent.keyCode == KeyEvent.DOM_VK_RETURN))
    this._menuKeyPressing = false;

  if (!this.isMenuAccessKey(aEvent)) return;
  var popup = this.getMenuPopup();
  if (!popup || 'open' == popup.state) return;

  var c = String.fromCharCode(aEvent.charCode);
  function matchAccesskey(aMenu) {
    if ('menu' == aMenu.localName && !aMenu.hidden) {
      return c == aMenu.getAttribute("accesskey").toLowerCase();
    }
    return false;
  }

  // check visible menu accesskey
  var menubars = document.getElementsByTagName('menubar');
  for each (var menubar in menubars) {
    if (menubar && !menubar.hidden &&
        menubar.parentNode && !menubar.parentNode.hidden &&
        menubar.parentNode.parentNode &&
        !menubar.parentNode.parentNode[this.HIDE_ATTRIBUTE]) {
      for each (var menu in menubar.childNodes)
        if (matchAccesskey(menu)) return;
    }
  }

  try {
    this.mapMenus(function(aMenu) {
      if (matchAccesskey(aMenu)) {
        aEvent.stopPropagation();
        var shown = this.bind(function CM_onkeypress_poupshown() {
          popup.removeEventListener('popupshown', shown, false);
          this.dispatchKeyEvent(popup, 0, c.charCodeAt(0));
        });
        popup.addEventListener('popupshown', shown, false);
        this.openMenuPopup();
        throw 'break';
      }
    });
  } catch (e if 'break' == e) {}
}

// }}}1

} // CompactMenu
