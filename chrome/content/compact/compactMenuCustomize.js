var CompactMenuCustomize = { __proto__: CompactMenu,

init: function() {
  this.c_dump('customizeInit');

  if (window.gToolbox) {
    var windowtype = gToolbox.ownerDocument.documentElement.getAttribute('windowtype');
    if (windowtype) {
      this.c_dump('detect window : ' + windowtype);
      this.MAINWINDOWS = [windowtype];
    }
  }

  this.mapMenus(function(menu, index) {
    var id = menu.id || index;
    var eid = this.toMenuElementId(id);
    var visible = !this.isMenuHidden(id);
    this.addVisibleMenuCheckbox(menu, eid, visible);
  });

  this.addEventListener(window, 'unload', this, false);
  this.addEventListener(window, 'dialogcancel', this, true);
},

accept: function() {
  this.c_dump('customizeAccept');

  this.mapMenus(function(menu, index) {
    var id = menu.id || index;
    var pref = this.toMenuPrefId(id);
    var eid = this.toMenuElementId(id);
    var item = document.getElementById(eid);
    this.setBoolPref(pref, !item.checked, true);
  });

  this.hideAll();
},

addVisibleMenuCheckbox: function(menu, id, checked) {
  var container = document.getElementById('compact-visible_menus');
  var item = document.getElementById(id) || document.createElement('checkbox');
  item.setAttribute('id', id);
  item.setAttribute('type', 'checkbox');
  item.setAttribute('label', menu.getAttribute('label'));
  item.setAttribute('accesskey', menu.getAttribute('accesskey'));
  item.setAttribute('checked', checked);
  var row = container.lastChild;
  if (4 <= row.childNodes.length) {
    row = document.createElement(row.nodeName);
    container.appendChild(row);
  }
  row.appendChild(item);
  return item;
},

// handle events

handleEvent: function(event) {
  switch (event.type) {
    case 'load':
    case 'dialogcancel':
      this.init();
      break;
    case 'unload':
      this.accept();
	  this.destroy();
      break;
  }
}

} // CompactMenuCustomize
CompactMenuCustomize.addEventListener(window, 'load', CompactMenuCustomize, false);
