// $Id$
// $cvsId: compactPrefOverlay.js,v 1.17 2003/12/04 21:10:15 cdn Exp svc$
// $cvsId: compactPrefOverlay.js,v 1.2 2003/01/20 22:19:36 orbit Exp svc$

    var CompactMenu = {

      aConsoleService: Components.classes["@mozilla.org/consoleservice;1"].
      getService(Components.interfaces.nsIConsoleService),
      
      _prefs: Components.classes["@mozilla.org/preferences-service;1"].
      getService(Components.interfaces.nsIPrefService).getBranch("compact.menu."),

      c_dump: function(msg) {
        msg = 'Compact Menu :: ' + msg;
        this.aConsoleService.logStringMessage(msg);
        dump(msg);
      },

      _elementIDs: {
        'showmenu.file'      : {
          menuId: 'menu_FilePopup',
          custId: 'compact-fileMenu'
        },
        'showmenu.edit'      : {
          menuId: 'menu_EditPopup',
          custId: 'compact-editMenu'
        },
        'showmenu.view'      : {
          menuId: 'menu_viewPopup',
          custId: 'compact-viewMenu'
        },
        'showmenu.go'        : {
          menuId: 'goPopup',
          custId: 'compact-goMenu'
        },
        'showmenu.bookmarks' : {
          menuId: 'bookmarks-menu',
          custId: 'compact-bookmarksMenu',
          noParent: true
        },
        'showmenu.tasks'     : {
          menuId: 'menu_ToolsPopup',
          custId: 'compact-tasksMenu'
        },
        'showmenu.help'      : {
          menuId: 'menu_HelpPopup',
          custId: 'compact-helpMenu'
        }
      },

      map_menu_prefs: function(it) {
        for (var pref in CompactMenu._elementIDs) {
          var item = CompactMenu._elementIDs[pref];
          it.call(this, pref, item);
        }
      },
      
      custInit: function() {
        try {
          this.map_menu_prefs(function(pref, item) {
            document.getElementById(item.custId).checked = this._prefs.getBoolPref(pref);
          });
        } catch (e) {
          this.map_menu_prefs(function(pref, item) {
            document.getElementById(item.custId).checked = true;
          });
        }
      },
      
      custCustInit: function() {
        this.tweakSize();
        this.custInit();
        this.c_dump('CustomizeToolbarWindow loaded\n');
      },

      hideItems: function() {
        try {
          this.map_menu_prefs(function(pref, item) {
            var menu = document.getElementById(item.menuId);
            if (!item.noParent)
              menu = menu.parentNode;
            menu.hidden = ! this._prefs.getBoolPref(pref);
          });
        } catch (e) {
          this.c_dump('initial prefs\n');
          this.map_menu_prefs(function(pref) {
            this._prefs.setBoolPref(pref, true);
          });
        }
      },

      hideMenu: function() {
        var button = document.getElementById('menu-button');
        var menu = document.getElementById('menu_Popup');
        var menubar = document.getElementById('main-menubar');

        if (!button && !menu) {
          menubar.setAttribute('hidden', 'false');
        } else {
          this.menuIt('main-menubar');
          menubar.setAttribute('hidden', 'true');
        }
      },

      init: function() {
        this.hideItems();
        this.hideMenu();
      },

      menuIt: function(cmpopup) {
        this.c_dump('menuIt();\n');
        var cmPop = document.getElementById(cmpopup);

        if (!cmPop.hasChildNodes()) {
          var menuBars = [
            'main-menubar',
            'menu-popup',
            'menu_Popup'
          ];
          for (var i = 0; i < menuBars.length; ++i) {
            var menuBar = document.getElementById(menuBars[i]);
            if (menuBar && cmPop != menuBar) {
              for (var j = menuBar.childNodes.length; 0 < j--;) {
                var item = menuBar.firstChild;
                menuBar.removeChild(item);
                cmPop.appendChild(item);
              }
            }
          }
        }
      },
      
      saveSettings: function() {
        this.map_menu_prefs(function(pref, item) {
          var checked = document.getElementById(item.custId).checked;
          this._prefs.setBoolPref(pref, checked);
        });
        return true;
      },
      
      tweakSize: function() {
        window.outerHeight = window.outerHeight + 50;
      },

      update: function(menu) {
        if (document.getElementById('compact-' + menu + 'Menu').checked) {
          this.c_dump('show ' + menu + 'Menu\n');
          this._prefs.setBoolPref("showmenu." + menu, true);
        } else {
          this.c_dump('hide ' + menu + 'Menu\n');
          this._prefs.setBoolPref("showmenu." + menu, false);
        }
      }
      
    }

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
