var CompactMenu = {

DEBUG: false,

aConsoleService:
  Components.classes["@mozilla.org/consoleservice;1"]
    .getService(Components.interfaces.nsIConsoleService),

_prefs:
  Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService).getBranch("compact.menu."),

SHOWMENU: 'showmenu.',

ELEMENT_SHOWMENU: 'compact-showmenu-',

c_dump: function(msg) {
  if (this.DEBUG) {
    msg = 'Compact Menu :: ' + msg;
    this.aConsoleService.logStringMessage(msg);
    dump(msg);
  }
},

getCurrentMenuContainer: function(it) {
  var names = [
    'main-menubar',
    'mail-menubar',
    'menu-popup',
    'menu_Popup',
  ];
  var document = this.getMainWindow().document;
  for each (var name in names) {
    var menuContainer = document.getElementById(name);
    if (menuContainer && menuContainer.hasChildNodes()) {
      return menuContainer;
    }
  }
  return null;
},

mapMenus: function(it) {
  var menuContainer = this.getCurrentMenuContainer();
  if (menuContainer) {
    for (var i = 0; i < menuContainer.childNodes.length; ++i) {
      var menu = menuContainer.childNodes[i];
      if ('menu' == menu.tagName)
      {
        it.call(this, menu, i);
      }
    }
  }
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

hideMenu: function() {
  var menupopup  = document.getElementById('menu-popup')
  var menupopup2 = document.getElementById('menu_Popup');
  var menubar = document.getElementById('main-menubar')
    || document.getElementById('mail-menubar');

  if (menupopup || menupopup2) {
    if (menupopup) menupopup.hidePopup();
    if (menupopup2) menupopup2.hidePopup();
    CompactMenu.mapMenus(function(menu) {
      if (menu && menu.hidePopup) menu.hidePopup();
    });
    this.menuIt(menubar);
    menubar.setAttribute('hidden', 'true');
  } else {
    menubar.removeAttribute('hidden');
  }
},

hideAll: function() {
  this.hideItems();
  this.hideMenu();
},

init: function() {
  if (window.onViewToolbarsPopupShowing ) {
    this.initToolbarContextMenu_Fx();
  } else {
    this.initToolbarContextMenu_Tb();
  }
  this.initKeyEvents();
},

initKeyEvents: function() {
  window.addEventListener("keypress", function(event) {
    if (!event.altKey) return;
    var popup = document.getElementById('menu-popup')
      || document.getElementById('menu_Popup');
    if (!popup) return;

    var c = String.fromCharCode(event.charCode);
    function matchAccesskey(menu) {
      if ('menu' == menu.localName) {
        var accesskey = menu.getAttribute("accesskey").toLowerCase();
        return c == accesskey;
      }
      return false;
    }
    function dispatchKeyEvent(item, keyCode) {
      var event = document.createEvent('KeyboardEvent');
      event.initKeyEvent('keypress', true, true, null, false, false, false, false, keyCode, 0);
      item.dispatchEvent(event);
    }

    var menubars = document.getElementsByTagName('menubar');
    for each (var menubar in menubars) {
      if ('main-menubar' != menubar.id && 'mail-menubar' != menubar.id) {
        for each (var menu in menubar.childNodes) {
          if (matchAccesskey(menu)) return;
        }
      }
    }

    try {
      var index = 0;
      CompactMenu.mapMenus(function(menu) {
        if (matchAccesskey(menu)) {
          popup.addEventListener('popupshown', function shown() {
            popup.removeEventListener('popupshown', shown, true);
            for (var i = index; 0 <= i--;)
              dispatchKeyEvent(popup, 40);
            dispatchKeyEvent(popup, 39);
            menu.lastChild.showPopup();
          }, true);
          popup.showPopup();
          throw 0;
        }
        if ('menu' == menu.localName && !menu.hidden) ++index;
      });
    } catch (e) {
      event.stopPropagation();
    }
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
  });

  if (collapsed) {
    menubar.removeAttribute('collapsed');
    document.persist(menubar.id, 'collapsed');
  }
  menubar.collapsed = collapsed || menubar.collapsed;

  function hookCode(orgFunc, orgCode, myCode) {
    eval(orgFunc + '=' + eval(orgFunc).toString().replace(orgCode, myCode));
  }

  hookCode('onViewToolbarsPopupShowing', '&& type != "menubar"', '');
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
  this.mapMenus(function(menu, index) {
    var id = menu.id || index;
    var pref = CompactMenu.SHOWMENU + id;
    var eid = CompactMenu.ELEMENT_SHOWMENU + id;
    var visible = this._prefs.prefHasUserValue(pref)? this._prefs.getBoolPref(pref): true;
    this.addVisibleMenuCheckbox(menu, eid, visible);
  });
  var orig_onAccept = window.onAccept || function() { return true; };
  window.onAccept = function() {
    CompactMenu.prefAccept();
    return orig_onAccept();
  }
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
  return true;
},

addVisibleMenuCheckbox: function(menu, id, checked) {
  var container = document.getElementById('compact-visible_menus');
  var item = document.createElement('checkbox');
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
