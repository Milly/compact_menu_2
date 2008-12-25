var CompactBookmarks = { __proto__: CompactMenu,

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
  this.addEventListener(window, 'unload', this, false);
  this.addEventListener(window, 'focus', this, false);
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
    var bms = PlacesUtils.bookmarks;
    compactBookmarksToolbarFolderMenu.label = bms.getItemTitle(bms.toolbarFolder);
    if (PlacesUtils.getQueryStringForFolder) {
      compactBookmarksToolbarFolderMenu.firstChild.place =
        PlacesUtils.getQueryStringForFolder(bms.toolbarFolder);
    }
  }
},

cloneNode: function(node) {
  var item = document.createElement(node.tagName);
  for (var i = 0; i < node.attributes.length; ++i) {
    var attr = node.attributes[i];
    item.setAttribute(attr.name, attr.value);
  }
  return item;
},

// handle events

handleEvent: function(event) {
  switch (event.type) {
    case 'load'  : this.init(); break;
    case 'unload': this.destroy(); break;
    case 'focus' : this.initBookmarksMenubar(); break;
  }
}

} // CompactBookmarks
CompactBookmarks.addEventListener(window, 'load', CompactBookmarks, false);
