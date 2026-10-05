// ============================================
// storage/library.js — مكتبة الصناديق
// ============================================
var Library = {
  KEY: 'kd_library_v3',
  items: [],

  init: function () {
    try {
      var raw = localStorage.getItem(this.KEY);
      this.items = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('⚠️ فشل قراءة المكتبة:', e);
      this.items = [];
    }
  },

  save: function () {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(this.items));
      return true;
    } catch (e) {
      console.warn('⚠️ فشل الحفظ:', e);
      return false;
    }
  },

  add: function (data) {
    var item = {
      id: 'lib_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: data.name || 'صندوق',
      category: data.category || 'custom',
      created: Date.now(),
      data: JSON.parse(JSON.stringify(data))
    };
    this.items.push(item);
    this.save();
    return item;
  },

  remove: function (id) {
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].id === id) {
        this.items.splice(i, 1);
        this.save();
        return true;
      }
    }
    return false;
  },

  get: function (id) {
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].id === id) return this.items[i];
    }
    return null;
  },

  count: function () { return this.items.length; }
};
