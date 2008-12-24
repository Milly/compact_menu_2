var CompactMenu = {

DEBUG: true,

_prefs:
  Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService)
    .getBranch("compact.menu."),

toToolbarPrefId: function(element_or_id) {
  if (element_or_id.ownerDocument) {
    var windowElement = element_or_id.ownerDocument.documentElement;
    var id = element_or_id.id;
  } else {
    var mainWindow = this.getMainWindow();
    var windowElement = mainWindow.document.documentElement;
    var id = element_or_id;
  }
  var windowId = (windowElement.id || '_id_') + '-' + (windowElement.getAttribute('windowtype') || '_windowtype_');
  return 'hidetoolbar.' + windowId + '.' + id;
},

toMenuPrefId: function(id) {
  var mainWindow = this.getMainWindow();
  var windowElement = mainWindow.document.documentElement;
  var windowId = (windowElement.id || '_id_') + '-' + (windowElement.getAttribute('windowtype') || '_windowtype_');
  return 'hidemenu.' + windowId + '.' + id;
},

toMenuElementId: function(id) {
  return 'compact-showmenu-' + id;
},

MAINWINDOWS: [
    'navigator:browser',
    'mail:3pane',
    'mail:messageWindow',
    'mail:addressbook',
    'msgcompose',
  ],

MAINTOOLBARS: [
    'toolbar-menubar',
    'mail-toolbar-menubar2',
    'addrbook-toolbar-menubar2',
    'compose-toolbar-menubar2',
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

hookCode: function(orgFunc, orgCode, myCode) {
  eval(orgFunc + '=' + eval(orgFunc).toString().replace(orgCode, myCode));
},

getBoolPref: function(pref, defaultValue) {
  const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
  if (this._prefs.prefHasUserValue(pref) && nsIPrefBranch.PREF_BOOL == this._prefs.getPrefType(pref))
    return this._prefs.getBoolPref(pref);
  return defaultValue;
},

setBoolPref: function(pref, value, clearOnFalse) {
  if (this._prefs.prefHasUserValue(pref))
    CompactMenu._prefs.clearUserPref(pref);
  if (value || !clearOnFalse)
    CompactMenu._prefs.setBoolPref(pref, !!value);
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

getCurrentMenuContainer: function() {
  var document = this.getMainWindow().document;
  var containerIds = this.MENUBARS.concat(this.POPUPS);
  for each (var id in containerIds) {
    var menuContainer = document.getElementById(id);
    if (menuContainer && menuContainer.hasChildNodes()) {
      return menuContainer;
    }
  }
  return null;
},

getMenuPopup: function(menu) {
  var item = this.getMenuItem();
  if (item) {
    var popup = item.getElementsByTagName('menupopup')[0];
  } else {
    var document = this.getMainWindow().document;
    var popup = document.getElementById(this.SINGLE_POPUP);
  }
  this.addPopupMethods(popup);
  return popup;
},

getMenuItem: function() {
  var document = this.getMainWindow().document;
  for each (var id in this.ITEMS) {
    var item = document.getElementById(id);
    if (item && !item.parentNode.collapsed) return item;
  }
  return null;
},

getMenuBar: function() {
  var document = this.getMainWindow().document;
  for each (var id in this.MENUBARS) {
    var item = document.getElementById(id);
    if (item) return item;
  }
  return null;
},

getMainToolbar: function() {
  var document = this.getMainWindow().document;
  for each (var id in this.MAINTOOLBARS) {
    var item = document.getElementById(id);
    if (item) return item;
  }
  return null;
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

hideItems: function() {
  this.mapMenus(function(menu, index) {
    var id = menu.id || index;
    menu.hidden = this.isMenuHidden(id);
  });
},

hidePopup: function() {
  var document = this.getMainWindow().document;
  for each (var id in this.POPUPS) {
    var popup = document.getElementById(id);
    if (popup && popup.hidePopup) popup.hidePopup();
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

isRTL: function() {
  var document = this.getMainWindow().document;
  var menubar = this.getMenuBar();
  return 'rtl' == document.defaultView.getComputedStyle(menubar, '').direction;
},

addPopupMethods: function(e) {
  if (!e.openPopup /* Mozilla < 1.9 */) {
    this.c_dump('add openPopup, openPopupAtScreen');
    e.openPopup = function(anchor, position, x, y, isContextMenu, attributesOverride) {
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
    e.openPopupAtScreen = function(x, y, isContextMenu) {
      document.popupNode = null;
      var popupType = isContextMenu ? 'context' : 'popup';
      this.showPopup(document.documentElement, x, y, popupType, null, null);
    };
  }
},

dispatchKeyEvent: function(item, keyCode, charCode) {
  var event = document.createEvent('KeyboardEvent');
  event.initKeyEvent('keypress', true, true, null, false, false, false, false, keyCode || 0, charCode || 0);
  item.dispatchEvent(event);
},

openMenuPopup: function() {
  var popup = this.getMenuPopup();
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

init: function() {
  if (window.onViewToolbarsPopupShowing) {
    this.initToolbarContextMenu_Fx();
  } else {
    this.initToolbarContextMenu_Tb();
  }
  this.initKeyEvents();
  this.initIcon();
},

initKeyEvents: function() {
  var menuKeyPressing = false;
  var menuOpened = false;

  window.addEventListener("keydown", function(event) {
    var pressing = CompactMenu.isMenuAccessKey(event, true);
    if (pressing && !menuKeyPressing) {
      menuOpened = ('open' == CompactMenu.getMenuPopup().state);
    }
    menuKeyPressing = pressing && CompactMenu.isMenuBarHidden();
  }, true);

  window.addEventListener("keyup", function(event) {
    if (menuKeyPressing && CompactMenu.isMenuAccessKey(event, true)) {
      menuKeyPressing = false;
      event.stopPropagation();
      if (!menuOpened) {
        CompactMenu.openMenuPopup();
      }
    }
  }, true);

  window.addEventListener("keypress", function(event) {
    if (!CompactMenu.isMenuAccessKey(event)) return;
    var popup = CompactMenu.getMenuPopup();
    if ('open' == popup.state) return;

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
      CompactMenu.mapMenus(function(menu) {
        if (matchAccesskey(menu)) {
          event.stopPropagation();
          popup.addEventListener('popupshown', function shown(event) {
            popup.removeEventListener('popupshown', shown, false);
            CompactMenu.dispatchKeyEvent(popup, 0, c.charCodeAt(0));
          }, false);
          CompactMenu.openMenuPopup();
          throw 'break';
        }
      });
    } catch (e if 'break' == e) {}
  }, true);
},

initToolbarContextMenu_Fx: function() {
  var menubar = this.getMainToolbar();
  var collapsed = 'true' == menubar.getAttribute('collapsed');

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

  if (collapsed) {
    menubar.removeAttribute('collapsed');
    document.persist(menubar.id, 'collapsed');
  }
  menubar.collapsed = collapsed || menubar.collapsed;

  this.hookCode('onViewToolbarsPopupShowing', 'type != "menubar"', 'true');
  this.hookCode('onViewToolbarCommand',
      'document.persist(toolbar.id, "collapsed");',
      'if ("toolbar-menubar" == toolbar.id) return; $&');

  // check All-in-One-Sidebar
  if (document.getElementById('aios-viewToolbar')) return;

  this.hookCode('onViewToolbarCommand',
      'toolbar.collapsed = ',
      '$& (1 < CompactMenu.getVisibleToolbarCount()) &&');
  if (0 == this.getVisibleToolbarCount()) {
    menubar.collapsed = false;
    document.persist(menubar.id, "collapsed");
  }
},

initToolbarContextMenu_Tb: function() {
  var menubar = this.getMainToolbar();
  var menu = document.getElementById('ShowMenubar');
  var context = document.getElementById('toolbar-context-menu');
  var hidden = this.isToolbarHidden(menubar);
  if (hidden != menubar.collapsed) {
    toggleMenubarVisible();
  }

  function toggleMenubarVisible() {
    menubar.collapsed = !menubar.collapsed;
    var pref = CompactMenu.toToolbarPrefId(menubar);
    CompactMenu.setBoolPref(pref, menubar.collapsed, true);
    CompactMenu.hideMenuBar();
  }
  function onToolbarContextMenuShowing() {
    menu.setAttribute('checked', (!menubar.collapsed).toString());
  }
  menu.addEventListener('command', toggleMenubarVisible, false);
  context.addEventListener('popupshowing', onToolbarContextMenuShowing, false);

  this.hookCode('CustomizeMailToolbar', '{', '{ CompactMenu.hideMenuBar();');
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

initIcon: function() {
  this.resetIcon();
  for each (var win in this.getMainWindows()) {
    win.eval('CompactMenu.loadIcon()');
  }
},

loadIcon: function() {
  var button = document.getElementById('menu-button');
  if (!button) return;

  var iconEnable = this.getBoolPref('icon.enabled', false);
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

getVisibleToolbarCount: function() {
  var count = 0;
  var toolbox = document.getElementById('navigator-toolbox')
    || document.getElementById('mail-toolbox');
  for (var i = 0; i < toolbox.childNodes.length; ++i) {
    var toolbar = toolbox.childNodes[i];
    var name = toolbar.getAttribute('toolbarname');
    var collapsed = toolbar.getAttribute('collapsed') != 'true';
    count += (name && collapsed)? 1: 0;
  }
  return count;
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

setMenuTooltip: function(tooltip, node) {
  if ('menupopup' != node.parentNode.localName) {
    var menus = this.mapMenus(function(menu) {
      if (!menu.hidden) {
        return menu.getAttribute('label');
      }
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

getLocalIconFile: function() {
  var localFileName = this._prefs.getCharPref('icon.localfilename');
  if (!localFileName) return null;
  var localFile = this.toLocalFile(this.getProfileDir());
  localFile.appendRelativePath(localFileName);
  return localFile;
},

getIconFile: function() {
  try {
    return this._prefs.getComplexValue('icon.file', Components.interfaces.nsILocalFile);
  } catch (e) {
    return null;
  }
},

setIconFile: function(file) {
  this.resetIcon();
  var lastLocalIconFile = this.getLocalIconFile();
  var destFile = this.toLocalIconFile(file);
  file.copyTo(destFile.parent, destFile.leafName);
  this._prefs.setCharPref('icon.localfilename', destFile.leafName);
  this._prefs.setComplexValue('icon.file', Components.interfaces.nsILocalFile, file);
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

getProfileDir: function() {
  return Components.classes["@mozilla.org/file/directory_service;1"]
    .getService(Components.interfaces.nsIProperties)
    .get("ProfD", Components.interfaces.nsIFile);
},

// Customize

customizeInit: function() {
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
},

customizeAccept: function() {
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

// Preference

prefInit: function() {
  this.c_dump('prefInit');

  var icon_enable = document.getElementById('icon_enable');
  if (icon_enable) {
    icon_enable.checked = this.getBoolPref('icon.enabled', false);
    icon_enable.doCommand();
    var icon_file = document.getElementById('icon_file');
    icon_file.file = this.getIconFile();
    if (icon_file.file) {
      var localIconFile = this.getLocalIconFile();
      if (localIconFile && localIconFile.exists())
        icon_file.image = this.toFileURI(localIconFile).spec;
    }
  }
},

prefAccept: function() {
  this.c_dump('prefAccept');

  var icon_enable = document.getElementById('icon_enable');
  if (icon_enable) {
    var icon_file = document.getElementById('icon_file').file;
    this.setBoolPref('icon.enabled', icon_enable.checked);
    if (icon_enable.checked && icon_file && icon_file.exists())
      this.setIconFile(icon_file);
  }

  this.initIcon();
},

disableGroup: function(group, disabled) {
  var group = document.getElementById(group);
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
}

} // CompactMenu

/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Compact Menu.
 *
 * The Initial Developer of the Original Code is Chris Neale.
 * Portions created by the Initial Developer are Copyright (C) 2003
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 *   Chris Neale <org.mozdev@cdn>
 *   Milly
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
