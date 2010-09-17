var CompactBookmarks = { __proto__: CompactMenu,

// debug methods {{{1

c_dump: function CB_c_dump(msg) {
  this.__proto__.c_dump.call(this, 'CompactBookmarks :: ' + msg);
},

// initialize methods {{{1

init: function CB_init() {
  this.c_dump('init');
  this.initBookmarksFunctions();
  this.initBookmarksItems();
  this.addEventListener(window, 'unload', this, false);
  this.addEventListener(window, 'focus', this, true);
},

initBookmarksFunctions: function CB_initBookmarksFunctions() {
  if ('BookmarksMenuDropHandler' in window) {
    this.hookFunction([BookmarksMenuDropHandler, 'getSupportedFlavours'],
                      this.bind(this.getSupportedFlavours));
  }

  if ('PlacesMenuDNDController' in window) {
    this.hookFunction([PlacesMenuDNDController, '_openBookmarksMenu'],
                      function CB__openBookmarksMenu(event) {
      this._openBookmarksMenu_without_CompactMenu.apply(this, arguments);
      if (event.target.id == "compact-bk-button") {
        event.target.lastChild.setAttribute("autoopened", "true");
        event.target.lastChild.showPopup(event.target.lastChild);
      }
    });
  }

  if ('FeedHandler' in window) {
    this.hookFunction([FeedHandler, 'updateFeeds'],
                      function CB_updateFeeds() {
      CompactBookmarks.c_dump('FeedHandler.updateFeeds(): called');
      function find(element, tagName, id) {
        var tags = element.getElementsByTagName(tagName);
        for (var i = 0; i < tags.length; ++i)
          if (id == tags[i].id) return tags[i];
      }
      var menus = [
        document.getElementById('compact-bk-menubar'),
        document.getElementById('compact-bk-button'),
        CompactBookmarks.getBookmarksMenu()
      ];
      for (var i = 0; i < menus.length; ++i) {
        if (menus[i]) {
          this._feedMenuitem = find(menus[i], 'menuitem', 'subscribeToPageMenuitem');
          this._feedMenupopup = find(menus[i], 'menu', 'subscribeToPageMenupopup');
          this.updateFeeds_without_CompactMenu();
        }
      }
    });
  }
},

initBookmarksItems: function CB_initBookmarksItems() {
  this.initBookmarksMenubar();
  this.initBookmarksButton();
},

initBookmarksMenubar: function CB_initBookmarksMenubar() {
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

initBookmarksButton: function CB_initBookmarksButton() {
  var compactBookmarksButton = document.getElementById('compact-bk-button');
  if (!compactBookmarksButton || compactBookmarksButton.initialized) return;
  this.c_dump('initBookmarksButton');

  var attrs = this.getBookmarksMenu().attributes;
  for (var i = 0; i < attrs.length; ++i) {
    var attr = attrs[i];
    // copy onXXX (for All)
    if (/^on/.test(attr.name))
      compactBookmarksButton.setAttribute(attr.name, attr.value);
  }
  this.cloneBookmarksMenu(compactBookmarksButton);

  compactBookmarksButton.initialized = true;
},

// element manipulate methods {{{1

getBookmarksMenu: function CB_getBookmarksMenu() {
  return document.getElementById('bookmarksMenu');
},

getBookmarksMenuPopup: function CB_getBookmarksMenuPopup() {
  return this.getBookmarksMenu().getElementsByTagName('menupopup')[0];
},

getSupportedFlavours: function CB_getSupportedFlavours() {
  var bookmarksMenuPopupId = this.getBookmarksMenuPopup().id;
  var menupopups = document.getElementsByTagName('menupopup');
  for (var i = 0; i < menupopups.length; ++i) {
    var menupopup = menupopups[i];
    if (menupopup.id == bookmarksMenuPopupId &&
        menupopup.getSupportedFlavours)
      return menupopup.getSupportedFlavours();
  }
  return [];
},

cloneBookmarksMenu: function CB_cloneBookmarksMenu(parent) {
  if (!parent || parent.firstChild) return;

  var menupopup = this.getBookmarksMenuPopup();
  var clone_menupopup = menupopup.cloneNode(false);
  parent.appendChild(clone_menupopup);

  // fix onpopupshowing (for Fx3.7)
  if (clone_menupopup.hasAttribute('onpopupshowing')) {
    var pops = clone_menupopup.getAttribute('onpopupshowing');
    pops = pops.replace("document.getElementById('bookmarksMenu')",
                        'this.parentNode');
    clone_menupopup.setAttribute('onpopupshowing', pops);
  }

  var nodes = menupopup.childNodes;
  for (var i = 0; i < nodes.length; ++i) {
    var node = nodes[i];
    clone_menupopup.appendChild(node.cloneNode(true));
    if ('menuseparator' == node.tagName) break;
  }

  // add bookmarks-toolbar-folder-menu (for Fx3.0 or later)
  var tbFolderMenu = document.getElementById('bookmarksToolbarFolderMenu');
  var tbFolderPopup = document.getElementById('bookmarksToolbarFolderPopup');
  if (tbFolderMenu && tbFolderPopup) {
    var clone_tbFolderMenu = tbFolderMenu.cloneNode(false);
    var clone_tbFolderPopup = tbFolderPopup.cloneNode(false);
    var clone_separator = tbFolderMenu.nextSibling.cloneNode(false);

    // set places (for Fx3.0)
    if ('PlacesUtils' in window && 'bookmarks' in PlacesUtils) {
      var bms = PlacesUtils.bookmarks;
      if (!clone_tbFolderMenu.label)
        clone_tbFolderMenu.label = bms.getItemTitle(bms.toolbarFolder);
      if (!clone_tbFolderPopup.place && 'getQueryStringForFolder' in PlacesUtils)
        clone_tbFolderPopup.place = PlacesUtils.getQueryStringForFolder(bms.toolbarFolder);
    }

    clone_tbFolderMenu.appendChild(clone_tbFolderPopup);
    clone_menupopup.appendChild(clone_tbFolderMenu);
    clone_menupopup.appendChild(clone_separator);
  }
},

// event methods {{{1

handleEvent: function CB_handleEvent(event) {
  switch (event.type) {
    case 'load'  : this.init(); break;
    case 'unload': this.destroy(); break;
    case 'focus' : this.initBookmarksItems(); break;
  }
}

// }}}1

} // CompactBookmarks
CompactBookmarks.addEventListener(window, 'load', CompactBookmarks, false);
