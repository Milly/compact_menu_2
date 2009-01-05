var CompactMenu = {

// constants

DEBUG: true,

PREFROOT_COMPACTMENU:    'compact.menu.',
PREFBASE_HIDEMENU:       'hidemenu.',
PREFBASE_HIDETOOLBAR:    'hidetoolbar.',
PREF_ICON_ENABLED:       'icon.enabled',
PREF_ICON_FILE:          'icon.file',
PREF_ICON_LOCALFILENAME: 'icon.localfilename',
PREFBASE_INITIALIZED:    'initialized.',

MAINWINDOWS: [
    'navigator:browser',
    'mail:3pane',
    'mail:messageWindow',
    'mail:addressbook',
    'msgcompose',
  ],

MAINTOOLBOXS: [
    'navigator-toolbox',
    'mail-toolbox',
  ],

MAINTOOLBARS: [
    'toolbar-menubar',
    'mail-toolbar-menubar2',
    'addrbook-toolbar-menubar2',
    'compose-toolbar-menubar2',
  ],

NAVITOOLBARS: [
    'nav-bar',
    'navigation-toolbar',
    'mail-bar2',
    'ab-bar2',
    'composeToolbar2',
  ],

MENUBARS: [
    'main-menubar',
    'mail-menubar',
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

// debug methods

c_dump: function(msg) {
  if (this.DEBUG) {
    msg = 'Compact Menu :: ' + msg;
    this._consoleService = this._consoleService
      || Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService);
    this._consoleService.logStringMessage(msg);
    dump(msg);
  }
},

// string methods

_strings: null,
get strings function() {
  return this._strings || (this._strings =
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

// preferences methods

_prefs: null,
get prefs function() {
  return this._prefs || (this._prefs =
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

// element manipulate methods

addPopupMethods: function(popup) {
  if (!('openPopup' in popup) /* Mozilla < 1.9 */) {
    this.c_dump('add popup.openPopup');
    popup.openPopup = function(anchor, position, x, y, isContextMenu, attributesOverride) {
      if (!anchor) {
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

  var types = [].concat(this.MAINWINDOWS);
  var currentWindowType = document.documentElement.getAttribute('windowtype');
  var pos = this.MAINWINDOWS.indexOf(currentWindowType);
  if (0 <= pos) {
    types.splice(pos, 1);
    types.unshift(currentWindowType);
  }

  var windows = [];
  for each (var type in types) {
    var window = windowMediator.getMostRecentWindow(type);
    if (window) windows.push(window);
  }
  return windows;
},

getMainWindow: function() {
  return this.getMainWindows()[0] || null;
},

getMenuBar: function() {
  return this.getElementByIds(this.MENUBARS);
},

getMenuItem: function() {
  return this.getElementByIds(this.ITEMS);
},

getMenuPopup: function(menu) {
  var item = this.getMenuItem();
  if (item) {
    var parent = item.parentNode;
    while (parent && 'toolbar' != parent.nodeName)
      parent = parent.parentNode;
    if (parent && !parent.collapsed)
      var popup = item.getElementsByTagName('menupopup')[0];
  }
  var popup = popup || this.getElementByIds([this.SINGLE_POPUP]);
  if (popup) this.addPopupMethods(popup);
  return popup;
},

getNavigationToolbar: function() {
  return this.getElementByIds(this.NAVITOOLBARS);
},

getVisibleToolbars: function() {
  var toolbars = [];
  var toolbox = this.getMainToolbox();
  for (var i = 0; i < toolbox.childNodes.length; ++i) {
    var toolbar = toolbox.childNodes[i];
    var hasName = !!toolbar.getAttribute('toolbarname');
    var visible = toolbar.getAttribute('collapsed') != 'true';
    if (hasName && visible) toolbars.push(toolbar);
  }
  return toolbars;
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
  this.menuIt(menubar);
  if (this.getMenuItem() || this.getMainToolbar().collapsed) {
    menubar.setAttribute('hidden', 'true');
  } else {
    menubar.removeAttribute('hidden');
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

// keybord methods

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

// icon methods

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
    var img = new Image();
    img.onload = function() {
      if (img.width && img.height && (16 != img.width || 48 != img.height)) {
        button.style.setProperty('-moz-image-region', 'rect(0px, ' + img.width + 'px, ' + img.height + 'px, 0px)', '');
      }
    };
    img.src = iconURI;
  }
},

resetIcon: function() {
  for each (var win in this.getMainWindows()) {
    var button = win.document.getElementById('menu-button');
    if (button) {
      button.style.removeProperty('list-style-image');
      button.style.removeProperty('-moz-image-region');
    }
  }

  var icon_file = window.document.getElementById('icon_file');
  if (icon_file) {
    icon_file.image = null;
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

// initialize methods

_eventListeners: [],

addEventListener: function(target, type, listener, useCapture) {
  target.addEventListener(type, listener, useCapture);
  this._eventListeners.push([target, type, listener, useCapture]);
},

hookFunction: function(orgFunc, orgCode, newCode) {
  var orgSource = eval(orgFunc).toSource();
  var newSource = orgSource.replace(orgCode, newCode);
  if (orgSource == newSource) {
    this.c_dump('hook failed for "' + orgFunc + '" at ' + Error().stack.split(/\n/)[2]);
    return false;
  }
  eval(orgFunc + '=' + newSource);
  return true;
},

init: function() {
  this.initMainToolbar();
  if (window.onViewToolbarsPopupShowing) {
    this.initToolbarContextMenu_Fx();
  } else {
    this.initToolbarContextMenu_Tb();
  }
  this.initIcon();
  this.addEventListener(window, 'unload', this, false);
  this.addEventListener(window, 'focus', this, false);
  this.addEventListener(window, 'keydown', this, true);
  this.addEventListener(window, 'keyup', this, true);
  this.addEventListener(window, 'keypress', this, true);
  this.initFirst();
},

initFirst: function() {
  var navbar = this.getNavigationToolbar();
  var initializedPref = this.toInitializedPrefId(navbar);
  if (!this.getBoolPref(initializedPref)) {
    if (!this.getMenuItem()) {
      const PromptService = Components.classes['@mozilla.org/embedcomp/prompt-service;1']
                                      .getService(Components.interfaces.nsIPromptService);
      var res = PromptService.confirmEx(
        null,
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
        navbar.collapsed = false;
        document.persist(navbar.id, 'currentset');
        var menubar = this.getMainToolbar();
        menubar.collapsed = true;
        if ('BrowserToolboxCustomizeDone' in window)
          window.setTimeout('BrowserToolboxCustomizeDone(true);', 0);
      }
    }

    this.setBoolPref(initializedPref, true);
  }
},

initIcon: function() {
  this.resetIcon();
  for each (var win in this.getMainWindows()) {
    win.eval('CompactMenu.loadIcon()');
  }
},

initMainToolbar: function() {
  var menubar = this.getMainToolbar();

  if ('true' == menubar.getAttribute('collapsed')) {
    menubar.removeAttribute('collapsed');
    document.persist(menubar.id, 'collapsed');
  }

  menubar.__defineGetter__('collapsed', function(){
    return CompactMenu.isToolbarHidden(this);
  });

  menubar.__defineSetter__('collapsed', function(){
    var collapsed = arguments[0];
    var pref = CompactMenu.toToolbarPrefId(this);
    CompactMenu.setBoolPref(pref, collapsed, true);
    if (collapsed) {
      this.setAttribute('collapsed', true);
    } else {
      this.removeAttribute('collapsed');
    }
    CompactMenu.hideMenuBar();
  });

  menubar.collapsed = this.isToolbarHidden(menubar);
},

initToolbarContextMenu_Fx: function() {
  var menubar = this.getMainToolbar();

  this.hookFunction('onViewToolbarsPopupShowing', 'type != "menubar"', 'true');
  this.hookFunction('onViewToolbarCommand',
      'document.persist(toolbar.id, "collapsed");',
      'if ("toolbar-menubar" != toolbar.id) { $& }');

  // check All-in-One-Sidebar
  if (document.getElementById('aios-viewToolbar')) return;

  this.hookFunction('onViewToolbarCommand',
      'toolbar.collapsed = ',
      '$& (1 < CompactMenu.getVisibleToolbars().length) &&');
  if (0 == this.getVisibleToolbars().length) {
    menubar.collapsed = false;
  }
},

initToolbarContextMenu_Tb: function() {
  var menubar = this.getMainToolbar();
  var menu = document.getElementById('ShowMenubar');
  var context = document.getElementById('toolbar-context-menu');

  this.addEventListener(menu, 'command', function() {
    menubar.collapsed = !menubar.collapsed;
  }, false);

  this.addEventListener(context, 'popupshowing', function() {
    menu.setAttribute('checked', (!menubar.collapsed).toString());
  }, false);

  this.hookFunction('CustomizeMailToolbar', '{', '{ CompactMenu.hideMenuBar();');
},

// destroy methods

destroy: function() {
  var listeners = this._eventListeners;
  this._eventListeners = [];
  for each (var l in listeners) {
    l[0].removeEventListener(l[1], l[2], l[3]);
  }
},

// handle events

handleEvent: function(event) {
  switch (event.type) {
    case 'load'    : this.init(); break;
    case 'unload'  : this.destroy(); break;
    case 'focus'   : this.hideAll(); break;
    case 'keydown' : this.onKeyDown(event); break;
    case 'keyup'   : this.onKeyUp(event); break;
    case 'keypress': this.onKeyPress(event); break;
  }
},

_menuKeyPressing: false,
_menuOpened: false,

onKeyDown: function(event) {
  var pressing = this.isMenuAccessKey(event, true);
  if (pressing && !this._menuKeyPressing) {
    this._menuOpened = ('open' == (this.getMenuPopup() || {}).state);
  }
  this._menuKeyPressing = pressing && this.isMenuBarHidden();
},

onKeyUp: function(event) {
  if (this._menuKeyPressing && this.isMenuAccessKey(event, true)) {
    this._menuKeyPressing = false;
    event.stopPropagation();
    if (!this._menuOpened) {
      this.openMenuPopup();
    }
  }
},

onKeyPress: function(event) {
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
        && menubar.parentNode.parentNode && !menubar.parentNode.parentNode.collapsed) {
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

} // CompactMenu
