var CompactBookmarks = {

init: function() {
  if (window.BookmarksMenuDNDObserver) {
    var BookmarksMenuDNDObserver_mObservers = BookmarksMenuDNDObserver.__lookupGetter__('mObservers');
    BookmarksMenuDNDObserver.__defineGetter__('mObservers', function() {
      var observers = BookmarksMenuDNDObserver_mObservers.call(this);
      var bm = document.getElementById('compact-bk-menubar');
      if (bm) {
        var popup = bm.getElementsByTagName('menupopup')[0];
        if (popup) observers = [popup].concat(observers);
      }
      return observers;
    });
  }
},

initBookmarksMenubar: function() {
  var compactBookmarksMenubar = document.getElementById('compact-bk-menubar');
  if (!compactBookmarksMenubar || compactBookmarksMenubar.initialized) return;

  var bookmarksMenu = document.getElementById('bookmarks-menu');
  var compactBookmarksMenu = compactBookmarksMenubar.firstChild;
  if (bookmarksMenu == compactBookmarksMenu) {
    bookmarksMenu = document.getElementById('bookmarksMenu');
    compactBookmarksMenu.style.display = 'none';
    compactBookmarksMenu = compactBookmarksMenu.nextSibling;
    compactBookmarksMenu.style.display = '';
  }
  this.bookmarksMenuNodes = bookmarksMenu.firstChild.childNodes;

  this.cloneBookmarksMenu(compactBookmarksMenu);

  compactBookmarksMenubar.initialized = true;
},

cloneBookmarksMenu: function(menu) {
  if (!menu) return;
  var popup = menu.getElementsByTagName('menupopup')[0];
  var separator = popup.firstChild;
  if ('bookmarksMenuSeparator' != separator.id) return;

  var nodes = this.bookmarksMenuNodes;
  for (var i = 0; i < nodes.length && 'menuseparator' != nodes[i].tagName; ++i) {
    var node = nodes[i];
    var item = this.cloneNode(node);
    popup.insertBefore(item, separator);
  }
  var compactBookmarksToolbarFolderMenu = separator.nextSibling;
  if (compactBookmarksToolbarFolderMenu) {
    compactBookmarksToolbarFolderMenu.label =
      PlacesUtils.bookmarks.getItemTitle(PlacesUtils.bookmarks.toolbarFolder);
    compactBookmarksToolbarFolderMenu.firstChild.place =
      PlacesUtils.getQueryStringForFolder(PlacesUtils.bookmarks.toolbarFolder);
  }
},

cloneNode: function(node) {
  var item = document.createElement(node.tagName);
  for (var i = 0; i < node.attributes.length; ++i) {
    var attr = node.attributes[i];
    item.setAttribute(attr.name, attr.value);
  }
  return item;
}

} // CompactBookmarks

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
 * The Original Code is Compact Menu 2.
 *
 * The Initial Developer of the Original Code is Milly.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
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
