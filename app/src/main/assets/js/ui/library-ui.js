// ============================================
// ui/library-ui.js — عرض وحذف عناصر المكتبة
// ============================================
var LibraryUI = {
  _pressTimer: null,
  _pressedRecently: false,

  init: function () {
    var self = this;

    document.addEventListener('touchstart', function (e) {
      var el = e.target.closest ? e.target.closest('[data-lib-id]') : null;
      if (!el) return;
      var id = el.getAttribute('data-lib-id');
      self._pressTimer = setTimeout(function () {
        self._onLong(id);
      }, 600);
    }, { passive: true });

    document.addEventListener('touchend', function () {
      if (self._pressTimer) { clearTimeout(self._pressTimer); self._pressTimer = null; }
    }, { passive: true });

    document.addEventListener('touchmove', function () {
      if (self._pressTimer) { clearTimeout(self._pressTimer); self._pressTimer = null; }
    }, { passive: true });

    document.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-lib-id]') : null;
      if (!el) return;
      if (self._pressedRecently) return;
      self._onTap(el.getAttribute('data-lib-id'));
    });
  },

  _onTap: function (id) {
    var item = Library.get(id);
    if (!item) return;
    var data = JSON.parse(JSON.stringify(item.data));

    // اجعل الموضع فارغاً ليُرتَّب تلقائياً على الحائط
    data.position = null;
    data.name = (data.name || 'صندوق') + ' (نسخة)';

    var rec = Objects.addBox(data);
    Panel.close();
    Selection.select(rec);
    if (typeof History !== 'undefined') History.record();
  },

  _onLong: function (id) {
    var item = Library.get(id);
    if (!item) return;
    this._pressedRecently = true;
    var self = this;
    setTimeout(function () { self._pressedRecently = false; }, 600);
    if (confirm('حذف "' + item.name + '" من المكتبة؟')) {
      Library.remove(id);
      this.render('lib-list');
    }
  },

  render: function (containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;

    if (Library.count() === 0) {
      el.innerHTML = '<div style="text-align:center;color:#9aa3ad;padding:24px 12px;font-size:13px">' +
        '📭 المكتبة فارغة<br><br>احفظ صندوقاً ليظهر هنا</div>';
      return;
    }

    var html = '';
    for (var i = Library.items.length - 1; i >= 0; i--) {
      var it = Library.items[i];
      var d = it.data;
      html += '<div data-lib-id="' + it.id + '" ' +
        'style="background:#2c323a;border:1px solid #3a4148;border-radius:10px;' +
        'padding:10px;margin-bottom:8px;cursor:pointer;user-select:none">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:6px">' +
          '<strong style="font-size:14px">' + this._esc(it.name) + '</strong>' +
          '<span style="font-size:11px;color:#9aa3ad">' + this._cat(it.category) + '</span>' +
        '</div>' +
        '<div style="font-size:11px;color:#9aa3ad">' +
          d.width + '×' + d.height + '×' + d.depth + ' سم</div>' +
        '</div>';
    }
    el.innerHTML = html;
  },

  _cat: function (id) {
    for (var i = 0; i < CONFIG.CATEGORIES.length; i++) {
      if (CONFIG.CATEGORIES[i].id === id) return CONFIG.CATEGORIES[i].label;
    }
    return id;
  },

  _esc: function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }
};
