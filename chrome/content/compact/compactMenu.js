var CompactMenu = {

DEBUG: true,

aConsoleService:
  Components.classes["@mozilla.org/consoleservice;1"]
    .getService(Components.interfaces.nsIConsoleService),

_prefs:
  Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService).getBranch("compact.menu."),

SHOWMENU: 'showmenu.',

ELEMENT_SHOWMENU: 'compact-showmenu-',

MAINTOOLBARS: [
    'toolbar-menubar',
    'mail-toolbar-menubar2',
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
    this.aConsoleService.logStringMessage(msg);
    dump(msg);
  }
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
  const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
  this.mapMenus(function(menu, index) {
    var id = menu.id || index;
    var pref = CompactMenu.SHOWMENU + id;
    var hasPref = this._prefs.prefHasUserValue(pref) && 
      nsIPrefBranch.PREF_BOOL == this._prefs.getPrefType(pref);
    var visible = hasPref? this._prefs.getBoolPref(pref): true;
    menu.hidden = !visible;
  });
},

hidePopup: function() {
  var document = this.getMainWindow().document;
  for each (var id in this.POPUPS) {
    var popup = document.getElementById(id);
    if (popup && popup.hidePopup) popup.hidePopup();
  }
},

hideMenu: function() {
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
  this.hideMenu();
},

isMenuAccessKey: function(event) {
  var accessKey = nsPreferences.getIntPref('ui.key.menuAccessKey');
  switch (accessKey) {
    case KeyEvent.DOM_VK_CONTROL : return event.ctrlKey && !event.altKey && !event.metaKey;
    case KeyEvent.DOM_VK_ALT     : return !event.ctrlKey && event.altKey && !event.metaKey;
    case KeyEvent.DOM_VK_META    : return !event.ctrlKey && !event.altKey && event.metaKey;
  }
  return false;
},

isRTL: function(node) {
  return 'rtl' == document.defaultView.getComputedStyle(node, '').direction;
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

dispatchKeyEvent: function(item, keyCode) {
  var event = document.createEvent('KeyboardEvent');
  event.initKeyEvent('keypress', true, true, null, false, false, false, false, keyCode, 0);
  item.dispatchEvent(event);
},

openMenu: function(menu) {
  var item = this.getMenuItem();
  var x = 0, y = 0;
  if (item) {
    var popup = item.getElementsByTagName('menupopup')[0];
    var anchor = popup.parentNode;
    var position = 'after_start';
  } else {
    var popup = document.getElementById(this.SINGLE_POPUP);
    var anchor = null;
    var position = '';
    // ToDo: fix popup position when RTL
  }

  popup.addEventListener('popupshown', function shown() {
    popup.removeEventListener('popupshown', shown, false);
    // dispatch DOWN key
    for (var pmenu = menu; pmenu; pmenu = pmenu.previousSibling) {
      if (!pmenu.hidden) {
        CompactMenu.dispatchKeyEvent(popup, KeyEvent.DOM_VK_DOWN);
      }
    }
    // dispatch LEFT or RIGHT key
    var key = CompactMenu.isRTL(popup) ? KeyEvent.DOM_VK_LEFT : KeyEvent.DOM_VK_RIGHT;
    CompactMenu.dispatchKeyEvent(popup, key);
    // open popup
  }, false);

  this.addPopupMethods(popup);
  popup.openPopup(anchor, position, x, y, false, false);
},

init: function() {
  if (window.onViewToolbarsPopupShowing) {
    this.initToolbarContextMenu_Fx();
  } else {
    this.initToolbarContextMenu_Tb();
  }
  this.initKeyEvents();
},

initKeyEvents: function() {
  window.addEventListener("keypress", function(event) {
    if (!CompactMenu.isMenuAccessKey(event)) return;

    var c = String.fromCharCode(event.charCode);
    function matchAccesskey(menu) {
      if ('menu' == menu.localName && !menu.hidden) {
        var accesskey = menu.getAttribute("accesskey").toLowerCase();
        return c == accesskey;
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
          CompactMenu.openMenu(menu);
          event.stopPropagation();
          throw 'break';
        }
      });
    } catch (e if 'break' == e) { }
  } , true);
},

initToolbarContextMenu_Fx: function() {
  var menubar = document.getElementById('toolbar-menubar');
  var collapsed = 'true' == menubar.getAttribute('collapsed');

  menubar.__defineGetter__('collapsed', function(){
    var pref = 'showtoolbar.' + this.id;
    return !(CompactMenu._prefs.prefHasUserValue(pref) ? CompactMenu._prefs.getBoolPref(pref) : true);
  });
  menubar.__defineSetter__('collapsed', function(){
    CompactMenu._prefs.setBoolPref('showtoolbar.' + this.id, !arguments[0]);
    if (arguments[0]) {
      this.setAttribute('collapsed', true);
    } else {
      this.removeAttribute('collapsed');
    }
    CompactMenu.hideMenu();
  });

  if (collapsed) {
    menubar.removeAttribute('collapsed');
    document.persist(menubar.id, 'collapsed');
  }
  menubar.collapsed = collapsed || menubar.collapsed;

  function hookCode(orgFunc, orgCode, myCode) {
    eval(orgFunc + '=' + eval(orgFunc).toString().replace(orgCode, myCode));
  }

  hookCode('onViewToolbarsPopupShowing', 'type != "menubar"', 'true');
  hookCode('onViewToolbarCommand',
      'document.persist(toolbar.id, "collapsed");',
      'if ("toolbar-menubar" == toolbar.id) return; $&');

  // check All-in-One-Sidebar
  if (document.getElementById('aios-viewToolbar')) return;

  hookCode('onViewToolbarCommand',
      'toolbar.collapsed = ',
      '$& (1 < CompactMenu.getVisibleToolbarCount()) &&');
  if (0 == this.getVisibleToolbarCount()) {
    menubar.collapsed = false;
    document.persist(menubar.id, "collapsed");
  }
},

initToolbarContextMenu_Tb: function() {
  var menubar = document.getElementById('mail-toolbar-menubar2');
  var menu = document.getElementById('ShowMenubar');
  var context = document.getElementById('toolbar-context-menu');
  var pref = 'showtoolbar.' + menubar.id;
  var visible = this._prefs.prefHasUserValue(pref)? this._prefs.getBoolPref(pref): true;
  if (visible == menubar.collapsed) {
    toggleMenubarVisible();
  }

  function toggleMenubarVisible() {
    menubar.collapsed = !menubar.collapsed;
    CompactMenu._prefs.setBoolPref(pref, !menubar.collapsed);
    CompactMenu.hideMenu();
  }
  function onToolbarContextMenuShowing() {
    menu.setAttribute('checked', (!menubar.collapsed).toString());
  }
  menu.addEventListener('command', toggleMenubarVisible, false);
  context.addEventListener('popupshowing', onToolbarContextMenuShowing, false);
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

getMainWindow: function() {
  const mediatorClass = '@mozilla.org/appshell/window-mediator;1';
  const types = [
    'navigator:browser',
    'mail:3pane',
  ];
  var mediator = Components.classes[mediatorClass].getService(Components.interfaces.nsIWindowMediator);
  for each (var type in types) {
    var window = mediator.getMostRecentWindow(type);
    if (window)
      return window;
  }
  return null;
},

// Preference

prefInit: function() {
  this.c_dump('load prefs');
  this.mapMenus(function(menu, index) {
    var id = menu.id || index;
    var pref = CompactMenu.SHOWMENU + id;
    var eid = CompactMenu.ELEMENT_SHOWMENU + id;
    var visible = this._prefs.prefHasUserValue(pref)? this._prefs.getBoolPref(pref): true;
    this.addVisibleMenuCheckbox(menu, eid, visible);
  });
},

prefAccept: function() {
  this.c_dump('save prefs');
  this.mapMenus(function(menu, index) {
    var id = menu.id || index;
    var pref = CompactMenu.SHOWMENU + id;
    var eid = CompactMenu.ELEMENT_SHOWMENU + id;
    var item = document.getElementById(eid);
    this._prefs.setBoolPref(CompactMenu.SHOWMENU + id, item.checked);
  });
  this.hideAll();
  return true;
},

addVisibleMenuCheckbox: function(menu, id, checked) {
  var container = document.getElementById('compact-visible_menus');
  var item = document.getElementById(id) || document.createElement('checkbox');
  item.setAttribute('id', id);
  item.setAttribute('type', 'checkbox');
  item.setAttribute('label', menu.getAttribute('label'));
  item.setAttribute('accesskey', menu.getAttribute('accesskey'));
  item.setAttribute('checked', checked);
  container.appendChild(item);
  return item;
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
