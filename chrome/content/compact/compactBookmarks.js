var CompactBookmarks = { __proto__: CompactMenu,

// debug methods {{{1

c_dump: function(msg) {
  this.__proto__.c_dump.call(this, 'CompactBookmarks :: ' + msg);
},

// initialize methods {{{1

init: function() {
  this.c_dump('init');
  this.initBookmarksFunctions();
  this.initBookmarksItems();
  this.addEventListener(window, 'unload', this, false);
  this.addEventListener(window, 'focus', this, true);
},

initBookmarksFunctions: function() {
	this.initBookmarksFunctions_Fx3();
  if ('FeedHandler' in window && 'updateFeeds' in FeedHandler) {
    FeedHandler.updateFeeds_without_CompactBookmark = FeedHandler.updateFeeds;
    FeedHandler.updateFeeds_with_CompactBookmark = FeedHandler.updateFeeds = function() {
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
          this.updateFeeds_without_CompactBookmark();
        }
      }
    };
  }
},

initBookmarksFunctions_Fx3: function() {
  this.hookFunction([BookmarksMenuDropHandler, 'getSupportedFlavours'],
                    this.bind(this.getSupportedFlavours));
  this.hookFunction([PlacesMenuDNDController, '_openBookmarksMenu'], function(event) {
    this._openBookmarksMenu_without_CompactMenu.apply(this, arguments);
    if (event.target.id == "compact-bk-button") {
      event.target.lastChild.setAttribute("autoopened", "true");
      event.target.lastChild.showPopup(event.target.lastChild);
    }
  });
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
    if (/^on/.test(attr.name))
      compactBookmarksButton.setAttribute(attr.name, attr.value);
  }
  this.cloneBookmarksMenu(compactBookmarksButton);

  compactBookmarksButton.initialized = true;
},

// element manipulate methods {{{1

getBookmarksMenu: function() {
  return document.getElementById('bookmarksMenu');
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

handleEvent: function(event) {
  switch (event.type) {
    case 'load'  : this.init(); break;
    case 'unload': this.destroy(); break;
    case 'focus' : this.initBookmarksItems(); break;
  }
}

// }}}1

} // CompactBookmarks
CompactBookmarks.addEventListener(window, 'load', CompactBookmarks, false);
