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
  delete CompactMenu.console;
  return (CompactMenu.console =
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
    this.prefs.clearUserPref(pref);
  if (value || !clearOnFalse)
    this.prefs.setBoolPref(pref, !!value);
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

_prefObserver: null,

registerPrefObserver: function() {
  if (this._prefObserver) return;
  this._prefObserver = {
    observe: this.bind(function(branch, topic, name){
      if (topic == 'nsPref:changed' && 'onPrefChanged' in this)
        this.onPrefChanged(name);
    })
  };
  this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
  this.prefs.addObserver('', this._prefObserver, false);
},

unregisterPrefObserver: function() {
  if (!this._prefObserver) return;
  this.prefs.removeObserver('', this._prefObserver);
  this._prefObserver = null;
},

onPrefChanged: function(name) {
  switch (name) {
    case this.PREF_ICON_ENABLED:
    case this.PREF_ICON_LOCALFILENAME:
    case this.PREF_ICON_MULTIPLE:
    case this.PREF_ICON_NOBORDER:
      this.delayBundleCall('change_icon', 20, this.bind(this.initIcon));
      break;
  }
},

// element manipulate methods {{{1

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
    img.onload = this.bind(function() {
      this.c_dump('icon loaded: width='+img.width+', height='+img.height);
      if (img.width && img.height && (iconEnable || 16 != img.width || 48 != img.height))
        this.setIconStyle(img.width, img.height, iconEnable && iconMultiple, iconNoBorder);
    });
    img.src = iconURI;
  }
},

resetAllWindowIcons: function() {
  var windows = this.getMainWindows();
  for each (var win in windows)
    win.CompactMenu.clearIconStyle();
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
  this.resetAllWindowIcons();
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

hookFunction: function(target, newFunc) {
  try {
    var object = window, name = target;
    if (target instanceof Array)
      object = target[0], name = target[1];
    var orgFunc = object[name];
    if ('function' == typeof orgFunc) {
      object[name + '_without_CompactMenu'] = orgFunc;
      object[name + '_with_CompactMenu'] = object[name] = newFunc;
      this.c_dump('hooked "' + name + '"');
      return true;
    }
  } catch (e) {}
  this.c_dump('hook failed for "' + name + '" at ' + Error().stack.split(/\n/)[2]);
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
    compare: function(version) {
      return Components.classes["@mozilla.org/xpcom/version-comparator;1"]
                       .getService(Components.interfaces.nsIVersionComparator)
                       .compare(this.version, version);
    }
  });
},

init: function() {
  this.c_dump('init');
  this.mainWindowInitializing = true;

  if (this.application.isFx) {
    if (0 <= this.application.compare("3.6a")) {
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

initFirst: function() {
  var navbar = this.getNavigationToolbar();
  var initializedPref = this.toInitializedPrefId(navbar);
  if (this.getBoolPref(initializedPref)) return;
  this.setBoolPref(initializedPref, true);

  this.delayBundleCall('first_init_popup', 1000, this.bind(function() {
    if (!this.getMenuItem()) {
      const PromptService = Components.classes['@mozilla.org/embedcomp/prompt-service;1']
                                      .getService(Components.interfaces.nsIPromptService);
      var res = PromptService.confirmEx(
        window,
        this.getString('initialize.confirm.title'),
        this.getString('initialize.confirm.description'),
        (PromptService.BUTTON_TITLE_YES * PromptService.BUTTON_POS_0) +
        (PromptService.BUTTON_TITLE_NO  * PromptService.BUTTON_POS_1),
        null, null, null, null, {}
      );
      if (0 == res) {
        var buttons = navbar.currentSet.split(',');
        var newset = ['menu-button'].concat(buttons).join(',');
        navbar.currentSet = newset;
        navbar.setAttribute('currentset', newset);
        navbar[this.HIDE_ATTRIBUTE] = false;
        document.persist(navbar.id, 'currentset');
        var menubar = this.getMainToolbar();
        menubar[this.HIDE_ATTRIBUTE] = true;
        var toolbox = this.getMainToolbox();
        if ('customizeDone' in toolbox)
          toolbox.customizeDone(true);
      }
    }
  }));
},

initIcon: function() {
  this.clearIconStyle();
  this.loadIcon();
},

initMainToolbar: function() {
  var menubar = this.getMainToolbar();

  if ('true' == menubar.getAttribute(this.HIDE_ATTRIBUTE)) {
    menubar.removeAttribute(this.HIDE_ATTRIBUTE);
    document.persist(menubar.id, this.HIDE_ATTRIBUTE);
  }

  this.hookFunction([document, 'persist'], function(id, attr) {
    if (CompactMenu.HIDE_ATTRIBUTE == attr)
      for each (var menubar_id in CompactMenu.MAINTOOLBARS)
        if (menubar_id == id) return;
    this.persist_without_CompactMenu.apply(this, arguments);
  });

  this.addEventListener(menubar, 'DOMAttrModified', this.bind(function(event) {
    if (this.HIDE_ATTRIBUTE == event.attrName) {
      var pref = this.toToolbarPrefId(event.target);
      this.setBoolPref(pref, 'true' == String(event.newValue), true);
      this.hideMenuBar();
    }
  }), false);

  menubar[this.HIDE_ATTRIBUTE] = this.isToolbarHidden(menubar);
},

initToolbarContextMenu_Fx36: function() {
  this.initToolbarContextMenu_FxTb30();
  this.hookFunction('onViewToolbarCommand', function() {
    var menubar = CompactMenu.getMainToolbar();
    var type = menubar.getAttribute('type');
    menubar.removeAttribute('type');
    onViewToolbarCommand_without_CompactMenu.apply(this, arguments);
    menubar.setAttribute('type', type);
  });
  this.getMainToolbar().setAttribute('autohide', false);
},

initToolbarContextMenu_FxTb30: function() {
  this.hookFunction('onViewToolbarsPopupShowing', function() {
    var menubar = CompactMenu.getMainToolbar();
    var type = menubar.getAttribute('type');
    menubar.removeAttribute('type');
    onViewToolbarsPopupShowing_without_CompactMenu.apply(this, arguments);
    menubar.setAttribute('type', type);
  });
},

initToolbarContextMenu_Sb: function() {
  this.hookFunction('sbOnViewToolbarsPopupShowing', function() {
    var menubar = CompactMenu.getMainToolbar();
    var type = menubar.getAttribute('type');
    menubar.removeAttribute('type');
    sbOnViewToolbarsPopupShowing_without_CompactMenu.apply(this, arguments);
    menubar.setAttribute('type', type);
  });
},

initToolbarContextMenu_Sm: function() {
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
  this.unregisterPrefObserver();
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

_delayBundleTimers: {},

delayBundleCall: function(id, delay, func) {
  var timers = this._delayBundleTimers;
  if (id in timers) {
    timers[id].cancel();
  } else {
    timers[id] = Components.classes["@mozilla.org/timer;1"]
                           .createInstance(Components.interfaces.nsITimer);
  }
  timers[id].init({ observe: func }, delay, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
},

bind: function(func) {
  var obj = this;
  return function() { return func.apply(obj, arguments); };
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
      this.delayBundleCall('open_menupopup', 50, this.bind(function() {
        if (!this._menuOpenCanceled)
          this.openMenuPopup();
      }));
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
        var shown = this.bind(function(event) {
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
