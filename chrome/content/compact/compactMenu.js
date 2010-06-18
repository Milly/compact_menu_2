var CompactMenu = {

// constants {{{1

DEBUG: false,

PREFROOT_COMPACTMENU:    'compact.menu.',
PREFBASE_HIDEMENU:       'hidemenu.',
PREFBASE_HIDETOOLBAR:    'hidetoolbar.',
PREF_ICON_ENABLED:       'icon.enabled',
PREF_ICON_FILE:          'icon.file',
PREF_ICON_LOCALFILENAME: 'icon.localfilename',
PREF_ICON_MULTIPLE:      'icon.multiple',
PREF_ICON_NOBORDER:      'icon.noborder',
PREFBASE_INITIALIZED:    'initialized.',

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

MENUBARS: [
    'main-menubar',
    'mail-menubar',
    'event-menubar',
  ],

ITEMS: [
    'menu-button',
    'compact-menu',
  ],

POPUPS: [
    'menu-button-popup',
    'compact-menu-popup',
    'main-menu-popup',
  ],

SINGLE_POPUP: 'main-menu-popup',

get HIDE_ATTRIBUTE() {
  delete CompactMenu.HIDE_ATTRIBUTE;
  return (CompactMenu.HIDE_ATTRIBUTE =
    this.application.isSm ? 'hidden' : 'collapsed');
},

// debug methods {{{1

get console() {
  delete CompactMenu.consoleService;
  return (CompactMenu.consoleService =
    Components.classes["@mozilla.org/consoleservice;1"]
              .getService(Components.interfaces.nsIConsoleService));
},

c_dump: function(msg) {
  if (this.DEBUG) {
    msg = 'Compact Menu :: ' + msg;
    this.console.logStringMessage(msg);
    dump(msg);
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

getString: function(key, replacements) {
  if (!replacements)
    return this.strings.GetStringFromName(key);
  else
    return this.strings.formatStringFromName(key, replacements, replacements.length);
},

// preferences methods {{{1

get prefs() {
  delete CompactMenu.prefs;
  return (CompactMenu.prefs =
    Components.classes['@mozilla.org/preferences-service;1']
              .getService(Components.interfaces.nsIPrefService)
              .getBranch(this.PREFROOT_COMPACTMENU));
},

getBoolPref: function(pref, defaultValue) {
  const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
  if (this.prefs.prefHasUserValue(pref) && nsIPrefBranch.PREF_BOOL == this.prefs.getPrefType(pref))
    return this.prefs.getBoolPref(pref);
  return defaultValue;
},

isToolbarHidden: function(element_or_id) {
  var pref = this.toToolbarPrefId(element_or_id);
  return this.getBoolPref(pref, false);
},

isMenuHidden: function(id) {
  var pref = this.toMenuPrefId(id);
  return this.getBoolPref(pref, false);
},

isMenuBarHidden: function() {
  return this.getMenuBar().hasAttribute('hidden');
},

setBoolPref: function(pref, value, clearOnFalse) {
  if (this.prefs.prefHasUserValue(pref))
    CompactMenu.prefs.clearUserPref(pref);
  if (value || !clearOnFalse)
    CompactMenu.prefs.setBoolPref(pref, !!value);
},

toMenuElementId: function(id) {
  return 'compact-showmenu-' + id;
},

toInitializedPrefId: function(element_or_id) {
  return this.toPrefId(element_or_id, this.PREFBASE_INITIALIZED);
},

toMenuPrefId: function(element_or_id) {
  return this.toPrefId(element_or_id, this.PREFBASE_HIDEMENU);
},

toToolbarPrefId: function(element_or_id) {
  return this.toPrefId(element_or_id, this.PREFBASE_HIDETOOLBAR);
},

toPrefId: function(element_or_id, prefBase) {
  if (!element_or_id)
    this.c_dump('toPrefId : ' + Error().stack);
  if (element_or_id.ownerDocument) {
    var windowElement = element_or_id.ownerDocument.documentElement;
    var id = element_or_id.id;
  } else {
    var mainWindow = this.getMainWindow();
    var windowElement = mainWindow.document.documentElement;
    var id = element_or_id;
  }
  var windowId = (windowElement.id || '_id_') + '-' + (windowElement.getAttribute('windowtype') || '_windowtype_');
  return prefBase + windowId + '.' + id;
},

// element manipulate methods {{{1

addPopupMethods: function(popup) {
  if (!('openPopup' in popup) /* Mozilla < 1.9 */) {
    this.c_dump('add popup.openPopup');
    popup.openPopup = function(anchor, position, x, y, isContextMenu, attributesOverride) {
      if (!anchor) {
        var document = this.ownerDocument;
        anchor = document.documentElement;
        position = null;
      } else {
        var posAttr = this.getAttribute('position');
        position = attributesOverride ? (position || posAttr) : (posAttr || position);
      }
      var p = ({
        after_start: ['bottomleft', 'topleft'],
        after_end: ['bottomright', 'topright'],
        before_start: ['topleft', 'bottomleft'],
        before_end: ['topright', 'bottomright'],
        end_after: ['bottomright', 'bottomleft'],
        end_before: ['topright', 'topleft'],
        start_after: ['bottomleft', 'bottomright'],
        start_before: ['topleft', 'topright'],
        overlap: ['topleft', 'topleft']
      })[position] || [];
      var popupType = isContextMenu ? 'context' : 'popup';
      this.showPopup(anchor, -1, -1, popupType, p[0], p[1]);
    };
  }

  if (!('openPopupAtScreen' in popup) /* Mozilla < 1.9 */) {
    this.c_dump('add popup.openPopupAtScreen');
    popup.openPopupAtScreen = function(x, y, isContextMenu) {
      var document = this.ownerDocument;
      document.popupNode = null;
      var popupType = isContextMenu ? 'context' : 'popup';
      this.showPopup(document.documentElement, x, y, popupType, null, null);
    };
  }

  if (!('state' in popup) /* Mozilla < 1.9 */) {
    this.c_dump('add popup.state');
    var self = this;
    var popup_state = 'closed';
    popup.__defineGetter__('state', function() { return popup_state; });
    function addPopupStateEvent(type, state) {
      self.addEventListener(popup, type, function() { popup_state = state; }, true);
    }
    addPopupStateEvent('popupshowing', 'showing');
    addPopupStateEvent('popupshown',   'open');
    addPopupStateEvent('popuphiding',  'hiding');
    addPopupStateEvent('popuphidden',  'closed');
  }
},

getCurrentMenuContainer: function() {
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

getElementByIds: function(ids) {
  var document = (this.getMainWindow() || {}).document;
  if (document) {
    for each (var id in ids) {
      var item = document.getElementById(id);
      if (item) return item;
    }
  }
  return null;
},

getMainToolbar: function() {
  return this.getElementByIds(this.MAINTOOLBARS);
},

getMainToolbox: function() {
  return this.getElementByIds(this.MAINTOOLBOXS);
},

getMainWindows: function() {
  const windowMediator = Components.classes['@mozilla.org/appshell/window-mediator;1']
                                   .getService(Components.interfaces.nsIWindowMediator);

  var windows = [];
  var mainWindow = this.getMainWindow();
  if (mainWindow) windows.push(mainWindow);
  var en = windowMediator.getEnumerator(null);
  while (en.hasMoreElements()) {
    var win = en.getNext();
    var type = win.document.documentElement.getAttribute('windowtype');
    if (0 <= this.MAINWINDOWS.indexOf(type) && mainWindow != win) windows.push(win);
  }

  return windows;
},

getMainWindow: function() {
  if (this.mainWindowInitializing) return window;

  const windowMediator = Components.classes['@mozilla.org/appshell/window-mediator;1']
                                   .getService(Components.interfaces.nsIWindowMediator);

  var types = [].concat(this.MAINWINDOWS);
  var i = 0;
  for (var win = window; win; win = win.opener) {
    var currentWindowType = win.document.documentElement.getAttribute('windowtype');
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

getMenuBar: function() {
  return this.getElementByIds(this.MENUBARS);
},

getMenuItem: function() {
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

getMenuPopup: function(menu) {
  var item = this.getMenuItem();
  var popup = item ?
    item.getElementsByTagName('menupopup')[0]:
    this.getElementByIds([this.SINGLE_POPUP]);
  if (popup) this.addPopupMethods(popup);
  return popup;
},

getNavigationToolbar: function() {
  return this.getElementByIds(this.NAVITOOLBARS);
},

hideItems: function() {
  this.mapMenus(function(menu, index) {
    var id = menu.id || index;
    menu.hidden = this.isMenuHidden(id);
  });
},

hidePopup: function() {
  var document = (this.getMainWindow() || {}).document;
  if (document) {
    for each (var id in this.POPUPS) {
      var popup = document.getElementById(id);
      if (popup && popup.hidePopup) popup.hidePopup();
    }
  }
},

hideMenuBar: function() {
  var menubar = this.getMenuBar();
  if (menubar) {
    this.menuIt(menubar);
    if (this.getMenuItem() || (this.getMainToolbar() || {})[this.HIDE_ATTRIBUTE]) {
      menubar.setAttribute('hidden', 'true');
    } else {
      menubar.removeAttribute('hidden');
    }
  }
},

hideAll: function() {
  this.hideItems();
  this.hidePopup();
  this.hideMenuBar();
},

isRTL: function() {
  var document = this.getMainWindow().document;
  var menubar = this.getMenuBar();
  return 'rtl' == document.defaultView.getComputedStyle(menubar, '').direction;
},

mapMenus: function(it) {
  var res = [];
  var menuContainer = this.getCurrentMenuContainer();
  if (menuContainer) {
    for (var i = 0; i < menuContainer.childNodes.length; ++i) {
      var menu = menuContainer.childNodes[i];
      if ('menu' == menu.localName)
      {
        var v = it.call(this, menu, i);
        if ('undefined' != typeof v) res.push(v);
      }
    }
  }
  return res;
},

menuIt: function(targetMenu) {
  if ('string' == typeof targetMenu)
    targetMenu = document.getElementById(targetMenu);
  if (targetMenu && !targetMenu.hasChildNodes()) {
    this.c_dump('menuIt : ' + targetMenu.id);
    var currentMenu = this.getCurrentMenuContainer();
    if (currentMenu && targetMenu != currentMenu) {
      while (currentMenu.firstChild) {
        targetMenu.appendChild(currentMenu.firstChild);
      }
    }
  }
},

openMenuPopup: function() {
  var popup = this.getMenuPopup();
  if (!popup) return;
  var x = 0, y = 0;
  if (this.SINGLE_POPUP != popup.id) {
    var anchor = popup.parentNode;
    var position = 'after_start';
  } else {
    var anchor = null;
    var position = '';
    // ToDo: fix popup position when RTL
  }
  popup.openPopup(anchor, position, x, y, false, false);
},

setMenuTooltip: function(tooltip, node) {
  if ('menupopup' != node.parentNode.localName) {
    var menus = this.mapMenus(function(menu) {
      return menu.hidden ? undefined : menu.getAttribute('label');
    });
    var text = menus
      .slice(0, 2)
      .concat(2 < menus.length ? ['...'] : [])
      .join(' ');
    if (text) {
      tooltip.setAttribute('label', text);
      return true;
    }
  }
  return false;
},

// keybord methods {{{1

dispatchKeyEvent: function(item, keyCode, charCode) {
  var event = document.createEvent('KeyboardEvent');
  event.initKeyEvent('keypress', true, true, null, false, false, false, false, keyCode || 0, charCode || 0);
  item.dispatchEvent(event);
},

isMenuAccessKey: function(event, checkKeyCode) {
  var accessKey = nsPreferences.getIntPref('ui.key.menuAccessKey');
  if (checkKeyCode) {
    if (event.keyCode != accessKey) return false;
    if ('keyup' == event.type) return !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey;
  }
  switch (accessKey) {
    case KeyEvent.DOM_VK_CONTROL : return event.ctrlKey && !event.altKey && !event.metaKey;
    case KeyEvent.DOM_VK_ALT     : return !event.ctrlKey && event.altKey && !event.metaKey;
    case KeyEvent.DOM_VK_META    : return !event.ctrlKey && !event.altKey && event.metaKey;
  }
  return false;
},

// icon methods {{{1

getIconFile: function() {
  try {
    return this.prefs.getComplexValue(this.PREF_ICON_FILE, Components.interfaces.nsILocalFile);
  } catch (e) {
    return null;
  }
},

getLocalIconFile: function() {
  var localFileName = this.prefs.getCharPref(this.PREF_ICON_LOCALFILENAME);
  if (!localFileName) return null;
  var localFile = this.toLocalFile(this.getProfileDir());
  localFile.appendRelativePath(localFileName);
  return localFile;
},

getProfileDir: function() {
  return Components.classes["@mozilla.org/file/directory_service;1"]
    .getService(Components.interfaces.nsIProperties)
    .get("ProfD", Components.interfaces.nsIFile);
},

loadIcon: function() {
  var button = document.getElementById('menu-button');
  if (!button) return;

  var iconEnable = this.getBoolPref(this.PREF_ICON_ENABLED, false);
  if (iconEnable) {
    var icon = this.getLocalIconFile();
    if (icon && icon.exists()) {
      this.c_dump('change icon: ' +  icon.path);
      var iconURI = this.toFileURI(icon).spec;
      var listStyleImage = 'url(' + iconURI + ')';
      button.style.setProperty('list-style-image', listStyleImage, '');
    }
  }

  if (!iconURI) {
    var listStyleImage = window.getComputedStyle(button, '').getPropertyValue('list-style-image');
    var iconURI = (listStyleImage.match(/url\((.*?)\)/) || [])[1] || '';
  }

  if (iconURI) {
    var iconMultiple = this.getBoolPref(this.PREF_ICON_MULTIPLE, false);
    var iconNoBorder = this.getBoolPref(this.PREF_ICON_NOBORDER, false);
    var img = new Image();
    img.onload = function() {
      CompactMenu.c_dump('icon loaded: width='+img.width+', height='+img.height);
      if (img.width && img.height && (iconEnable || 16 != img.width || 48 != img.height))
        CompactMenu.setIconStyle(img.width, img.height, iconEnable && iconMultiple, iconNoBorder);
    };
    img.src = iconURI;
  }
},

resetIcon: function(win) {
  var windows = win ? [win] : this.getMainWindows();
  for each (var win in windows)
    win.eval("CompactMenu.clearIconStyle();");
},

_iconStyle: null,
setIconStyle: function(width, height, multiple, noborder) {
  if (multiple) {
    var h1 = Math.ceil(height / 3), h2 = h1 * 2, h3 = h1 * 3;
    var code = 'data:text/css,@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);'
             + '#menu-button{-moz-image-region:rect(0px,'+width+'px,'+h1+'px,0px)!important;}'
             + '#menu-button:hover{-moz-image-region:rect('+h1+'px,'+width+'px,'+h2+'px,0px)!important;}'
             + '#menu-button[open="true"]{-moz-image-region:rect('+h2+'px,'+width+'px,'+h3+'px,0px)!important;}';
    if (noborder) code += '#menu-button{border:none!important;}';
    var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                        .getService(Components.interfaces.nsIStyleSheetService);
    var ios = Components.classes["@mozilla.org/network/io-service;1"]
                        .getService(Components.interfaces.nsIIOService);
    var uri = ios.newURI(code, null, null);
    if (!sss.sheetRegistered(uri, sss.USER_SHEET))
      sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
    this._iconStyle = uri;
  } else {
    var button = document.getElementById('menu-button');
    if (button) {
      var imageRegion = 'rect(0px,'+width+'px,'+height+'px,0px)';
      button.style.setProperty('-moz-image-region', imageRegion, '');
      if (noborder) button.style.setProperty('border', 'none', '');
    }
  }
},

clearIconStyle: function() {
  var button = document.getElementById('menu-button');
  if (button) {
    button.style.removeProperty('list-style-image');
    button.style.removeProperty('-moz-image-region');
    button.style.removeProperty('border');
  }

  var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                      .getService(Components.interfaces.nsIStyleSheetService);
  if (this._iconStyle) {
    if (sss.sheetRegistered(this._iconStyle, sss.USER_SHEET))
      sss.unregisterSheet(this._iconStyle, sss.USER_SHEET);
    this._iconStyle = null;
  }
},

setIconFile: function(file) {
  this.resetIcon();
  var lastLocalIconFile = this.getLocalIconFile();
  var destFile = this.toLocalIconFile(file);
  file.copyTo(destFile.parent, destFile.leafName);
  this.prefs.setCharPref(this.PREF_ICON_LOCALFILENAME, destFile.leafName);
  this.prefs.setComplexValue(this.PREF_ICON_FILE, Components.interfaces.nsILocalFile, file);
  if (lastLocalIconFile && lastLocalIconFile.exists())
    lastLocalIconFile.remove(false);
},

toFileURI: function(file) {
  return Components.classes['@mozilla.org/network/io-service;1']
    .getService(Components.interfaces.nsIIOService)
    .newFileURI(file);
},

toLocalFile: function(file) {
  if (file instanceof Components.interfaces.nsILocalFile)
    return file
  var localFile = Components.classes['@mozilla.org/file/local;1']
    .createInstance(Components.interfaces.nsILocalFile);
  localFile.initWithPath(file.path);
  return localFile;
},

toLocalIconFile: function(file) {
  var ext = (file.leafName.match(/\.[^.]+$/) || [''])[0];
  var localFile = this.toLocalFile(this.getProfileDir());
  localFile.appendRelativePath('compact' + (new Date()).getTime() + ext);
  return localFile;
},

// initialize methods {{{1

hookFunction: function(orgFunc, orgCode, newCode) {
  try {
    var orgSource = eval(orgFunc).toSource();
    var newSource = orgSource.replace(orgCode, newCode);
    if (orgSource != newSource) {
      eval(orgFunc + '=' + newSource);
      return true;
    }
  } catch (e) {}
  this.c_dump('hook failed for "' + orgFunc + '" at ' + Error().stack.split(/\n/)[2]);
  return false;
},

get application() {
  var appInfo = Components.classes['@mozilla.org/xre/app-info;1']
                          .getService(Components.interfaces.nsIXULAppInfo);
  delete CompactMenu.application;
  return (CompactMenu.application = {
    isFx: appInfo.ID == '{ec8030f7-c20a-464f-9b0e-13a3a9e97384}',
    isTb: appInfo.ID == '{3550f703-e582-4d05-9a08-453d09bdfdc6}',
    isSb: appInfo.ID == '{718e30fb-e89b-41dd-9da7-e25a45638b28}',
    isSm: appInfo.ID == '{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}',
    version: appInfo.version,
  });
},

init: function() {
  this.c_dump('init');
  this.mainWindowInitializing = true;

  var versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
                                 .getService(Components.interfaces.nsIVersionComparator);
  if (this.application.isFx) {
    if (0 <= versionChecker.compare(this.application.version, "3.6a")) {
      this.initToolbarContextMenu_Fx36();
    } else {
      this.initToolbarContextMenu_FxTb30();
    }
  } else if (this.application.isTb) {
    if (0 <= versionChecker.compare(this.application.version, "3.0a")) {
      this.initToolbarContextMenu_FxTb30();
    } else {
      this.initToolbarContextMenu_Tb20();
    }
  } else if (this.application.isSb) {
    this.initToolbarContextMenu_Sb();
  } else if (this.application.isSm) {
    this.initToolbarContextMenu_Sm();
  }

  this.initMainToolbar();
  this.initIcon(window);
  this.addEvents();
  this.initFirst();
  this.mainWindowInitializing = false;
},

initFirst: function() {
  var navbar = this.getNavigationToolbar();
  var initializedPref = this.toInitializedPrefId(navbar);
  if (this.getBoolPref(initializedPref)) return;
  this.setBoolPref(initializedPref, true);

  window.setTimeout(function() {
    if (!CompactMenu.getMenuItem()) {
      const PromptService = Components.classes['@mozilla.org/embedcomp/prompt-service;1']
                                      .getService(Components.interfaces.nsIPromptService);
      var res = PromptService.confirmEx(
        window,
        CompactMenu.getString('initialize.confirm.title'),
        CompactMenu.getString('initialize.confirm.description'),
        (PromptService.BUTTON_TITLE_YES * PromptService.BUTTON_POS_0) +
        (PromptService.BUTTON_TITLE_NO  * PromptService.BUTTON_POS_1),
        null, null, null, null, {}
      );
      if (0 == res) {
        var buttons = navbar.currentSet.split(',');
        var newset = ['menu-button'].concat(buttons).join(',');
        navbar.currentSet = newset;
        navbar.setAttribute('currentset', newset);
        navbar[CompactMenu.HIDE_ATTRIBUTE] = false;
        document.persist(navbar.id, 'currentset');
        var menubar = CompactMenu.getMainToolbar();
        menubar[CompactMenu.HIDE_ATTRIBUTE] = true;
        var toolbox = CompactMenu.getMainToolbox();
        if ('customizeDone' in toolbox)
          toolbox.customizeDone(true);
      }
    }
  }, 1000);
},

initIcon: function(win) {
  this.resetIcon(win);
  var windows = win ? [win] : this.getMainWindows();
  for each (var win in windows) {
    win.setTimeout("CompactMenu.loadIcon();", 0);
  }
},

initMainToolbar: function() {
  var menubar = this.getMainToolbar();
  var attr = this.HIDE_ATTRIBUTE;

  if ('true' == menubar.getAttribute(attr)) {
    menubar.removeAttribute(attr);
    document.persist(menubar.id, attr);
  }

  var org_setAttribute = menubar.setAttribute;
  menubar.setAttribute = function(name, value) {
    if (attr == name) {
      var pref = CompactMenu.toToolbarPrefId(this);
      CompactMenu.setBoolPref(pref, 'true' == String(value), true);
      org_setAttribute.call(menubar, name, value);
      CompactMenu.hideMenuBar();
    } else {
      org_setAttribute.call(menubar, name, value);
    }
  };

  var org_removeAttribute = menubar.removeAttribute;
  menubar.removeAttribute = function(name) {
    if (attr == name) {
      var pref = CompactMenu.toToolbarPrefId(this);
      CompactMenu.setBoolPref(pref, false, true);
      org_removeAttribute.call(menubar, name);
      CompactMenu.hideMenuBar();
    } else {
      org_removeAttribute.call(menubar, name);
    }
  };

  menubar.__defineGetter__(attr, function(){
    return 'true' == this.getAttribute(attr);
  });

  menubar.__defineSetter__(attr, function(value){
    this.setAttribute(attr, value);
  });

  menubar[this.HIDE_ATTRIBUTE] = this.isToolbarHidden(menubar);
},

initToolbarContextMenu_Fx36: function() {
  this.hookFunction('onViewToolbarsPopupShowing', '"autohide"', '"collapsed"');
  this.hookFunction('onViewToolbarCommand', '"autohide"', '"collapsed"');
  this.hookFunction('onViewToolbarCommand',
      'document.persist(toolbar.id, hidingAttribute);',
      'if (!/\\btoolbar-menubar2?$/.test(toolbar.id)) { $& }');
  this.getMainToolbar().setAttribute('autohide', false);
},

initToolbarContextMenu_FxTb30: function() {
  this.hookFunction('onViewToolbarsPopupShowing', 'type != "menubar"', 'true');
  this.hookFunction('onViewToolbarCommand',
      'document.persist(toolbar.id, "collapsed");',
      'if (!/\\btoolbar-menubar2?$/.test(toolbar.id)) { $& }');
},

initToolbarContextMenu_Tb20: function() {
  this.hookFunction('CustomizeMailToolbar', '{', '{ CompactMenu.hideMenuBar();');

  // add menuitem to messengercomposer
  var menu = document.getElementById('menu_ToolbarsNew');
  if (menu) {
    var menupopup = menu.getElementsByTagName('menupopup')[0];
    menupopup.onpopupshowing = "CompactMenu.onViewToolbarsPopupShowing(event, 'menu_showMenubar');";
    var menuitem = document.getElementById('ShowMenubar').cloneNode(false);
    menuitem.id = 'menu_showMenubar';
    menupopup.insertBefore(menuitem, menupopup.firstChild);
  }
},

initToolbarContextMenu_Sb: function() {
  this.hookFunction('sbOnViewToolbarsPopupShowing', 'type != "menubar"', 'true');
  this.hookFunction('sbOnViewToolbarCommand',
      'document.persist(toolbar.id, "collapsed");',
      'if ("main-toolbar" != toolbar.id) { $& }');
},

initToolbarContextMenu_Sm: function() {
  this.hookFunction('goToggleToolbar',
      'document.persist(id, "hidden");',
      'if (!/\\btoolbar-menubar2?$/.test(id)) { $& }');
},

onViewToolbarCommand: function() {
  var menubar = this.getMainToolbar();
  if (menubar)
    menubar[this.HIDE_ATTRIBUTE] = !menubar[this.HIDE_ATTRIBUTE];
  this.hideAll();
},

onViewToolbarsPopupShowing: function(event, aMenuItemId) {
  if (window.onViewToolbarsPopupShowing) {
    var toolbox = this.getMainToolbox();
    window.onViewToolbarsPopupShowing(event, toolbox.id);
  } else {
    var menubar = this.getMainToolbar();
    var menuitem = document.getElementById(aMenuItemId);
    if (menubar && menuitem)
      menuitem.setAttribute('checked', !menubar[this.HIDE_ATTRIBUTE]);
  }
},

// destroy methods {{{1

destroy: function() {
  this.c_dump('destroy');
  this.removeEventListeners();
},

// event methods {{{1

get eventListeners() {
  if (!this.hasOwnProperty('_eventListeners'))
    this._eventListeners = [];
  return this._eventListeners;
},

addEventListener: function(target, type, listener, useCapture) {
  target.addEventListener(type, listener, useCapture);
  this.eventListeners.push([target, type, listener, useCapture]);
},

removeEventListeners: function() {
  var listeners = this.eventListeners;
  this._eventListeners = [];
  for each (var l in listeners) {
    l[0].removeEventListener(l[1], l[2], l[3]);
  }
},

addEvents: function() {
  this.addEventListener(window, 'unload', this, false);
  this.addEventListener(window, 'focus', this, true);
  this.addEventListener(window, 'blur', this, true);
  this.addEventListener(window, 'mousedown', this, true);
  this.addEventListener(window, 'DOMMouseScroll', this, true);
  this.addEventListener(window, 'keydown', this, true);
  this.addEventListener(window, 'keyup', this, true);
  this.addEventListener(window, 'keypress', this, true);
},

handleEvent: function(event) {
  var handler = this['on' + event.type];
  if (handler) handler.call(this, event);
},

_menuKeyPressing: false,
_menuOpenCanceled: false,

onload: function(event) {
  this.init();
},

onunload: function(event) {
  this.destroy();
},

onfocus: function(event) {
  this.hideAll();
  this._menuKeyPressing = false;
  this._menuOpenCanceled = true;
},

onblur: function(event) {
  // avoid Alt-Tab (Task switching) on Firefox 3.5
  // 1. User push and release Alt-Tab
  // 2. Alt keydown detect, Tab keydown "NOT" detect
  // 3. Alt keyup detect
  // 4. window blur detect
  this._menuKeyPressing = false;
  this._menuOpenCanceled = true;
},

onmousedown: function(event) {
  // avoid Download Link
  this._menuOpenCanceled = true;
},

onDOMMouseScroll: function(event) {
  // avoid Download Link
  this._menuOpenCanceled = true;
},

onkeydown: function(event) {
  var pressing = this.isMenuAccessKey(event, true);
  if (pressing && !this._menuKeyPressing)
    this._menuOpenCanceled = ('open' == (this.getMenuPopup() || {}).state) || !this.isMenuBarHidden();
  this._menuKeyPressing = pressing;
},

onkeyup: function(event) {
  if (this._menuKeyPressing && this.isMenuAccessKey(event, true)) {
    this._menuKeyPressing = false;
    event.stopPropagation();
    if (!this._menuOpenCanceled) {
      setTimeout(function() {
        if (!CompactMenu._menuOpenCanceled)
          CompactMenu.openMenuPopup();
      }, 50);
    }
  }
},

onkeypress: function(event) {
  // avoid Alt-~ (Japanese IME switching), Space or Return (Link command)
  if (this._menuKeyPressing && (
      event.altKey && event.keyCode == KeyEvent.DOM_VK_BACK_QUOTE ||
      event.keyCode == KeyEvent.DOM_VK_SPACE ||
      event.keyCode == KeyEvent.DOM_VK_RETURN))
    this._menuKeyPressing = false;

  if (!this.isMenuAccessKey(event)) return;
  var popup = this.getMenuPopup();
  if (!popup || 'open' == popup.state) return;

  var c = String.fromCharCode(event.charCode);
  function matchAccesskey(menu) {
    if ('menu' == menu.localName && !menu.hidden) {
      return c == menu.getAttribute("accesskey").toLowerCase();
    }
    return false;
  }

  // check visible menu accesskey
  var menubars = document.getElementsByTagName('menubar');
  for each (var menubar in menubars) {
    if (menubar && !menubar.hidden
        && menubar.parentNode && !menubar.parentNode.hidden
        && menubar.parentNode.parentNode && !menubar.parentNode.parentNode[this.HIDE_ATTRIBUTE]) {
      for each (var menu in menubar.childNodes) {
        if (matchAccesskey(menu)) return;
      }
    }
  }

  try {
    this.mapMenus(function(menu) {
      if (matchAccesskey(menu)) {
        event.stopPropagation();
        var self = this;
        popup.addEventListener('popupshown', function shown(event) {
          popup.removeEventListener('popupshown', shown, false);
          self.dispatchKeyEvent(popup, 0, c.charCodeAt(0));
        }, false);
        this.openMenuPopup();
        throw 'break';
      }
    });
  } catch (e if 'break' == e) {}
}

// }}}1

} // CompactMenu
