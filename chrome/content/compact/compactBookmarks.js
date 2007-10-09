var CompactBookmarks = {

init: function() {
  var bookmarkMenubar = document.getElementById('compact-bk-menubar');
  if (!bookmarkMenubar)
  {
    if (this.orig_mObservers) {
      BookmarksMenuDNDObserver.__defineGetter__('mObservers', this.orig_mObservers);
      this.orig_mObservers = null;
    }
    return;
  }
  if (bookmarkMenubar.initialized)
    return;

  var bookmarks = document.getElementById('bookmarks-menu');
  var compactBookmarks = bookmarkMenubar.firstChild;
  var isFx3 = bookmarks == compactBookmarks;
  if (isFx3) {
    bookmarks = document.getElementById('bookmarksMenu');
    compactBookmarks.style.display = 'none';
    compactBookmarks = compactBookmarks.nextSibling;
    compactBookmarks.style.display = '';
  } else {
    this.orig_mObservers = BookmarksMenuDNDObserver.__lookupGetter__('mObservers');
    BookmarksMenuDNDObserver.__defineGetter__('mObservers', function() {
      return [compactBookmarksPopup].concat(CompactBookmarks.orig_mObservers.call(this));
    });
  }

  var compactBookmarksPopup = compactBookmarks.firstChild;
  var separator = compactBookmarksPopup.firstChild;
  if ('bookmarksMenuSeparator' == separator.id) {
    var nodes = bookmarks.firstChild.childNodes;
    for (var i = 0; i < nodes.length && 'menuseparator' != nodes[i].tagName; ++i) {
      var node = nodes[i];
      var item = this.cloneNode(node);
      compactBookmarksPopup.insertBefore(item, separator);
    }
  }

  bookmarkMenubar.initialized = true;
},

cloneNode: function(node) {
  var item = document.createElement(node.tagName);
  for (var i = 0; i < node.attributes.length; ++i) {
    var attr = node.attributes[i];
    item.setAttribute(attr.name, attr.value);
  }
  return item;
},

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
