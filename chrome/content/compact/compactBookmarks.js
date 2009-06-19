var CompactBookmarks = { __proto__: CompactMenu,

// debug methods

c_dump: function(msg) {
  this.__proto__.c_dump.call(this, 'CompactBookmarks :: ' + msg);
},

// initialize methods

init: function() {
  this.c_dump('init');
  if (window.BookmarksMenuDNDObserver) {
    this.initBookmarksFunctions_Fx2();
  } else {
    this.initBookmarksFunctions_Fx3();
  }
  this.initBookmarksItems();
  this.addEventListener(window, 'unload', this, false);
  this.addEventListener(window, 'focus', this, false);
},

initBookmarksFunctions_Fx2: function() {
  var BookmarksMenuDNDObserver_mObservers = BookmarksMenuDNDObserver.__lookupGetter__('mObservers');
  BookmarksMenuDNDObserver.__defineGetter__('mObservers', function() {
    var observers = [].concat(BookmarksMenuDNDObserver_mObservers.call(this));
    var items = ['compact-bk-menubar', 'compact-bk-button'];
    for each (var item in items) {
      var parent = document.getElementById(item);
      var popup = parent && parent.getElementsByTagName('menupopup')[0];
      if (popup) observers.push(popup);
    }
    return observers;
  });

  this.hookFunction('BookmarksMenuDNDObserver.onDragStart',
      'target\.id == "bookmarks-menu"',
      'target.id == "compact-bk-button" || $&');
  this.hookFunction('BookmarksMenuDNDObserver.canDrop',
      'target\.id == "bookmarks-menu"',
      'target.id == "compact-bk-button" || $&');
  this.hookFunction('BookmarksMenuDNDObserver.onDragCloseTarget',
      'this\.mObservers\[i\]\.parentNode.id == "bookmarks-menu"',
      'this.mObservers[i].parentNode.id == "compact-bk-button" || $&');

  this.hookFunction('BookmarksMenu.getBTSelection',
      'case "bookmarks-menu":',
      'case "compact-bk-button":$&');
  this.hookFunction('BookmarksMenu.getBTTarget',
      'case "bookmarks-menu":',
      'case "compact-bk-button":$&');
  this.hookFunction('BookmarksMenu.getBTContainer',
      'case "bookmarks-menu":',
      'case "compact-bk-button":$&');
},

initBookmarksFunctions_Fx3: function() {
  this.hookFunction('BookmarksMenuDropHandler.getSupportedFlavours',
      /{.*}/m,
      '{ return CompactBookmarks.getSupportedFlavours(); }');
  this.hookFunction('PlacesMenuDNDController._openBookmarksMenu',
      'event\.target\.id == "bookmarksMenu"',
      'event.target.id == "compact-bk-button" || $&');
},

initBookmarksItems: function() {
  this.initBookmarksMenubar();
  this.initBookmarksButton();
},

initBookmarksMenubar: function() {
  var compactBookmarksMenubar = document.getElementById('compact-bk-menubar');
  if (!compactBookmarksMenubar || compactBookmarksMenubar.initialized) return;
  this.c_dump('initBookmarksMenubar');

  compactBookmarksMenubar.removeChild(compactBookmarksMenubar.firstChild);
  var menu = this.getBookmarksMenu().cloneNode(false);
  this.cloneBookmarksMenu(menu);
  compactBookmarksMenubar.appendChild(menu);
  menu.removeAttribute('disabled');

  compactBookmarksMenubar.initialized = true;
},

initBookmarksButton: function() {
  var compactBookmarksButton = document.getElementById('compact-bk-button');
  if (!compactBookmarksButton || compactBookmarksButton.initialized) return;
  this.c_dump('initBookmarksButton');

  var attrs = this.getBookmarksMenu().attributes;
  for (var i = 0; i < attrs.length; ++i) {
    var attr = attrs[i];
    // copy onXXX (for All)
    // copy datasources, ref ... (for Fx2)
    if (/^on|^(datasources|ref|flags|template|infer)$/.test(attr.name))
      compactBookmarksButton.setAttribute(attr.name, attr.value);
  }
  this.cloneBookmarksMenu(compactBookmarksButton);

  // reinsert after clone (for Fx2)
  if (window.BookmarksMenuDNDObserver) {
    var next = compactBookmarksButton.nextSibling;
    var parent = compactBookmarksButton.parentNode;
    parent.removeChild(compactBookmarksButton);
    parent.insertBefore(compactBookmarksButton, next);
  }

  compactBookmarksButton.initialized = true;
},

// element manipulate methods

getBookmarksMenu: function() {
  var fx2Menu = document.getElementById('bookmarks-menu');
  var fx3Menu = document.getElementById('bookmarksMenu');
  return fx2Menu ? fx2Menu : fx3Menu;
},

getBookmarksMenuPopup: function() {
  return this.getBookmarksMenu().getElementsByTagName('menupopup')[0];
},

getSupportedFlavours: function() {
  var bookmarksMenuPopupId = this.getBookmarksMenuPopup().id;
  var menupopups = document.getElementsByTagName('menupopup');
  for (var i = 0; i < menupopups.length; ++i) {
    var menupopup = menupopups[i];
    if (menupopup.id == bookmarksMenuPopupId && menupopup.getSupportedFlavours) {
      return menupopup.getSupportedFlavours();
    }
  }
  return [];
},

cloneBookmarksMenu: function(parent) {
  if (!parent || parent.firstChild) return;

  var menupopup = this.getBookmarksMenuPopup();
  var clone_menupopup = menupopup.cloneNode(false);
  parent.appendChild(clone_menupopup);

  var nodes = menupopup.childNodes;
  for (var i = 0; i < nodes.length; ++i) {
    var node = nodes[i];
    clone_menupopup.appendChild(node.cloneNode(false));
    if ('menuseparator' == node.tagName) break;
  }

  var tbFolderMenu = document.getElementById('bookmarksToolbarFolderMenu');
  if (tbFolderMenu) {
    var tbFolderPopup = document.getElementById('bookmarksToolbarFolderPopup');
    var clone_tbFolderMenu = tbFolderMenu.cloneNode(false);
    var clone_tbFolderPopup = tbFolderPopup.cloneNode(false);
    var clone_separator = tbFolderMenu.nextSibling.cloneNode(false);

    var bms = PlacesUtils.bookmarks;
    if (bms) {
      if (!clone_tbFolderMenu.label)
        clone_tbFolderMenu.label = bms.getItemTitle(bms.toolbarFolder);
      if (!clone_tbFolderPopup.place)
        clone_tbFolderPopup.place = PlacesUtils.getQueryStringForFolder(bms.toolbarFolder);
    }

    clone_tbFolderMenu.appendChild(clone_tbFolderPopup);
    clone_menupopup.appendChild(clone_tbFolderMenu);
    clone_menupopup.appendChild(clone_separator);
  }
},

// event methods

handleEvent: function(event) {
  switch (event.type) {
    case 'load'  : this.init(); break;
    case 'unload': this.destroy(); break;
    case 'focus' : this.initBookmarksItems(); break;
  }
}

} // CompactBookmarks
CompactBookmarks.addEventListener(window, 'load', CompactBookmarks, false);
