// ============================================
// ui/panel.js — اللوحة الجانبية
// ============================================
var Panel = {
  el: null, body: null, title: null,
  isOpen: false,
  onClose: null,

  init: function () {
    this.el = document.getElementById('panel');
    this.body = document.getElementById('panel-body');
    this.title = document.getElementById('panel-title');

    var self = this;
    document.getElementById('fab-menu').addEventListener('click', function () {
      if (self.isOpen) self.close();
      else if (self.onOpenMenu) self.onOpenMenu();
    });
    document.getElementById('panel-close').addEventListener('click', function () {
      self.close();
    });
  },

  open: function (title, html) {
    if (title) this.title.textContent = title;
    if (html !== undefined) this.body.innerHTML = html;
    this.el.classList.add('open');
    this.isOpen = true;
  },

  close: function () {
    this.el.classList.remove('open');
    this.isOpen = false;
    if (this.onClose) this.onClose();
  }
};
