var CompactBookmarks = { __proto__: CompactMenu,

// debug methods {{{1

c_dump: function CB_c_dump(aMsg) {
  this.__proto__.c_dump.call(this, 'CompactBookmarks :: ' + aMsg);
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
                      function CB__openBookmarksMenu(aEvent) {
      this._openBookmarksMenu_without_CompactMenu.apply(this, arguments);
      if (aEvent.target.id == "compact-bk-button") {
        aEvent.target.lastChild.setAttribute("autoopened", "true");
        aEvent.target.lastChild.showPopup(aEvent.target.lastChild);
      }
    });
  }

  if ('FeedHandler' in window) {
    this.hookFunction([FeedHandler, 'updateFeeds'],
                      function CB_updateFeeds() {
      function $(id) document.getElementById(id);
      function find(path, el) CompactBookmarks.evaluate(path, el).singleNodeValue;
      function getmenu(el)
        el ? { item: find('.//xul:menuitem[@id="subscribeToPageMenuitem"]', el),
               popup: find('.//xul:menu[@id="subscribeToPageMenupopup"]', el) } : {};
      var menus = [
        getmenu($('compact-bk-menubar')),
        getmenu($('compact-bk-button')),
        getmenu(CompactBookmarks.getBookmarksMenu()),
        { item: this._feedMenuitem, popup: this._feedMenupopup }
      ];
      for each (var menu in menus) {
        if (menu.item && menu.item != this._feedMenuitem &&
            menu.popup && menu.popup != this._feedMenupopup) {
          this._feedMenuitem = menu.item;
          this._feedMenupopup = menu.popup;
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

cloneBookmarksMenu: function CB_cloneBookmarksMenu(aParent) {
  if (!aParent || aParent.firstChild) return;

  const OTHER_ID_CAPABLE = !!document.getElementById('bookmarks-menu-button');
  function find(path, el) CompactBookmarks.evaluate(path, el).singleNodeValue;

  var menupopup = this.getBookmarksMenuPopup();
  var clone_menupopup = menupopup.cloneNode(false);
  aParent.appendChild(clone_menupopup);

  var id_prefix = OTHER_ID_CAPABLE ? aParent.id + '_' : '';
  var skip_start = find('./*[@id="bookmarksMenuItemsSeparator"]', menupopup) ||
                   find('./*[@builder="start"]', menupopup);
  var skip_end   = find('./*[@builder="end"]', menupopup);
  var nodes = menupopup.childNodes;
  for (var i = 0, skip = false; i < nodes.length; ++i) {
    var node = nodes[i];
    if (node == skip_end) skip = false;
    if (!skip) {
      var clone = node.cloneNode(true);
      if (clone.id) clone.id = id_prefix + clone.id;
      clone_menupopup.appendChild(clone);
    }
    if (node == skip_start) skip = true;
  }

  // set places (for Fx3.0)
  if ('undefined' != typeof PlacesUtils && PlacesUtils.bookmarks && PlacesUtils.bookmarks.toolbarFolder) {
    var bms = PlacesUtils.bookmarks, tbf = bms.toolbarFolder;
    var clone_tbFolderMenu = find('.//xul:menu[@id="bookmarksToolbarFolderMenu"]', clone_menupopup);
    var clone_tbFolderPopup = find('.//xul:menupopup[@id="bookmarksToolbarFolderPopup"]', clone_menupopup);
    if (clone_tbFolderMenu && !clone_tbFolderMenu.label && 'getItemTitle' in bms)
      clone_tbFolderMenu.label = bms.getItemTitle(tbf);
    if (clone_tbFolderPopup && !clone_tbFolderPopup.place && 'getQueryStringForFolder' in PlacesUtils)
      clone_tbFolderPopup.place = PlacesUtils.getQueryStringForFolder(tbf);
  }
},

// event methods {{{1

handleEvent: function CB_handleEvent(aEvent) {
  switch (aEvent.type) {
    case 'load'  : this.init(); break;
    case 'unload': this.destroy(); break;
    case 'focus' : this.initBookmarksItems(); break;
  }
}

// }}}1

} // CompactBookmarks
CompactBookmarks.addEventListener(window, 'load', CompactBookmarks, false);
