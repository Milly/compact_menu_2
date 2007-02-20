// $Id$
// $cvsId: compactPrefOverlay.js,v 1.17 2003/12/04 21:10:15 cdn Exp svc$
// $cvsId: compactPrefOverlay.js,v 1.2 2003/01/20 22:19:36 orbit Exp svc$

    var CompactMenu = {

      aConsoleService: Components.classes["@mozilla.org/consoleservice;1"].
      getService(Components.interfaces.nsIConsoleService),
      
      _elementIDs: ["compact-fileMenu", "compact-editMenu", "compact-viewMenu",
                       "compact-goMenu", "compact-bookmarksMenu",
                       "compact-tasksMenu", "compact-helpMenu"],

      _prefs: Components.classes["@mozilla.org/preferences-service;1"].
      getService(Components.interfaces.nsIPrefService).getBranch("compact.menu."),

      c_dump: function(msg) {
        msg = 'Compact Menu :: ' + msg;
        this.aConsoleService.logStringMessage(msg);
        dump(msg);
      },
      
      custInit: function() {
       try {
        document.getElementById('compact-fileMenu').checked = this._prefs.getBoolPref("showmenu.file");
        document.getElementById('compact-editMenu').checked = this._prefs.getBoolPref("showmenu.edit");
        document.getElementById('compact-viewMenu').checked = this._prefs.getBoolPref("showmenu.view");
        document.getElementById('compact-goMenu').checked = this._prefs.getBoolPref("showmenu.go");
        document.getElementById('compact-bookmarksMenu').checked = this._prefs.getBoolPref("showmenu.bookmarks");
        document.getElementById('compact-tasksMenu').checked = this._prefs.getBoolPref("showmenu.tasks");
        document.getElementById('compact-helpMenu').checked = this._prefs.getBoolPref("showmenu.help");
       } catch(ex) {
        document.getElementById('compact-fileMenu').checked = true;
        document.getElementById('compact-editMenu').checked = true;
        document.getElementById('compact-viewMenu').checked = true;
        document.getElementById('compact-goMenu').checked = true;
        document.getElementById('compact-bookmarksMenu').checked = true;
        document.getElementById('compact-tasksMenu').checked = true;
        document.getElementById('compact-helpMenu').checked = true;
       }
      },
      
      custCustInit: function() {
        this.tweakSize();
        this.custInit();
        this.c_dump('CustomizeToolbarWindow loaded\n');
      },

      hideItems: function() {

        // don't loop ?
        if(window.xxcompactDone) return;
       // window.xxcompactDone = true;
  
        var _fm = document.getElementById('menu_FilePopup').parentNode;
        var _em = document.getElementById('menu_EditPopup').parentNode;
        var _vm = document.getElementById('menu_viewPopup').parentNode;
        var _go = document.getElementById('goPopup').parentNode;
        var _bk = document.getElementById('bookmarks-menu');
        var _tm = document.getElementById('menu_ToolsPopup').parentNode;
        var _hm = document.getElementById('menu_HelpPopup').parentNode;

      // _fm.setAttribute('label', _fm.getAttribute('label').substr(0, 1));
        try {
          _fm.hidden = ! this._prefs.getBoolPref("showmenu.file");
          _em.hidden = ! this._prefs.getBoolPref("showmenu.edit");
          _vm.hidden = ! this._prefs.getBoolPref("showmenu.view");
          _go.hidden = ! this._prefs.getBoolPref("showmenu.go");
          _bk.hidden = ! this._prefs.getBoolPref("showmenu.bookmarks");
          _tm.hidden = ! this._prefs.getBoolPref("showmenu.tasks");
          _hm.hidden = ! this._prefs.getBoolPref("showmenu.help");
        }
        catch(ex) {
          this.c_dump('initial prefs\n');
          this._prefs.setBoolPref("showmenu.file", true);
          this._prefs.setBoolPref("showmenu.edit", true);
          this._prefs.setBoolPref("showmenu.view", true);
          this._prefs.setBoolPref("showmenu.go", true);
          this._prefs.setBoolPref("showmenu.bookmarks", true);
          this._prefs.setBoolPref("showmenu.tasks", true);
          this._prefs.setBoolPref("showmenu.help", true);
        }

      },

      hideMenu: function() {
        var sharc = document.getElementById('menu-button');
        var cMenu = document.getElementById('menu_Popup');

        if(!sharc && !cMenu) {
         // document.getElementById('main-menubar').removeAttribute("hidden");
          document.getElementById('main-menubar').setAttribute("hidden", 'false');
        }
        else {
          document.getElementById('main-menubar').setAttribute("hidden", "true");
        }
      },

      init: function() {
        this.hideItems();
        this.hideMenu();
      },

      menuIt: function(cmpopup) {

        this.c_dump('menuIt();\n');

        var cmPop = document.getElementById(cmpopup);

        if ( ! cmPop.hasChildNodes() )
        {
          var c2fileMenu = document.getElementById('menu_FilePopup').parentNode.cloneNode(true);
          var c2editMenu = document.getElementById('menu_EditPopup').parentNode.cloneNode(true);
          var c2viewMenu = document.getElementById('menu_viewPopup').parentNode.cloneNode(true);

          var _go = document.getElementById('goPopup').parentNode;

          var c2goMenu = document.createElement('menu');
              c2goMenu.setAttribute('label', _go.getAttribute('label'));
              c2goMenu.setAttribute('accesskey', _go.getAttribute('accesskey'));
              c2goMenu.setAttribute('oncommand', "var url = event.target.getAttribute('statustext'); if (url) openTopWin(url);");

          var c2goPopup = document.createElement('menupopup');
              c2goPopup.setAttribute('id', 'cloneGoPopup');
              c2goPopup.setAttribute('onpopupshowing', "updateGoMenu(this);");
              c2goPopup.setAttribute('onpopuphiding', "onGoMenuHidden();");

          var items = document.getElementById('goPopup').childNodes;

          for (var i = 0; i < items.length; i++) {
            c2goPopup.appendChild(items[i]);
          }

          c2goMenu.appendChild(c2goPopup);

          var c2bookMenu = document.getElementById('bookmarks-menu').cloneNode(true); /* odd one out */
          var c2toolMenu = document.getElementById('menu_ToolsPopup').parentNode.cloneNode(true);
          var c2helpMenu = document.getElementById('menu_HelpPopup').parentNode.cloneNode(true);

          var TBE_tabMenu = document.getElementById('tabMenu');

          if (TBE_tabMenu) {
            var c2tbeTabMenu = TBE_tabMenu.cloneNode(true); /* odd one out [2] */
            cmPop.appendChild(c2tbeTabMenu);
             this.c_dump('appended TBE tab menu\n');
          }

          cmPop.appendChild(c2fileMenu);
           this.c_dump('appended file menu\n');
          cmPop.appendChild(c2editMenu);
           this.c_dump('appended edit menu\n');
          cmPop.appendChild(c2viewMenu);
           this.c_dump('appended view menu\n');
          if (this._prefs.getBoolPref("showmenu.go")) {
            cmPop.appendChild(c2goMenu);
             this.c_dump('appended go menu\n');
          }
          cmPop.appendChild(c2bookMenu);
           this.c_dump('appended bookmarks menu\n');
          cmPop.appendChild(c2toolMenu);
           this.c_dump('appended tools menu\n');
          cmPop.appendChild(c2helpMenu);
           this.c_dump('appended help menu\n\n');

        }
      },
      
      saveSettings: function() {
       for (var i = 0; i < this._elementIDs.length; ++i) {
         var checkbox = document.getElementById(this._elementIDs[i]);
         this._prefs.setBoolPref(checkbox.getAttribute("prefstring"), checkbox.checked);
       }
       return true;
      },
      
      tweakSize: function() {
        window.outerHeight = window.outerHeight + 50;
      },

      update: function(menu) {
        if ( document.getElementById('compact-' + menu + 'Menu').checked == true ) {
          this.c_dump('show ' + menu + 'Menu\n');
          this._prefs.setBoolPref("showmenu." + menu, true);
        }
        else {
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