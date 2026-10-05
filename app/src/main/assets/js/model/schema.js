// ============================================
// model/schema.js — تطبيع البيانات حسب الفئة
// ============================================
var Schema = {

  // يعيد نسخة منظّفة من البيانات حسب قواعد الفئة
  normalizeBox: function (data) {
    var d = JSON.parse(JSON.stringify(data));

    if (d.category === 'upper') {
      d.supportType = 'none';
      d.hasCountertop = false;
      d.hasSink = false;
      d.hasStove = false;
      d.hasToeKick = false;
      d.drawerCount = 0;
    }

    if (d.category === 'tall') {
      d.shelfCount = 0;
      d.glassShelves = false;
      d.hasCountertop = false;
      d.hasSink = false;
      d.hasStove = false;
      d.doorCount = 0;
    }

    if (d.category === 'drawers') {
      d.shelfCount = 0;
      d.glassShelves = false;
      d.doorCount = 0;   // الأبواب تُدار بالملء
    }

    // الأرجل × الرخام الأمامي: أحدهما
    if (d.supportType === 'legs' && d.supportType === 'marble') {
      d.supportType = 'legs';
    }

    // الحوض والموقد يحتاجان رخام
    if (d.hasSink && !d.hasCountertop) d.hasSink = false;
    if (d.hasStove && !d.hasCountertop) d.hasStove = false;

    // تطبيع المقابض
    if (d.handleType === 'none') d.hasHandles = false;
    else d.hasHandles = true;

    return d;
  },

  normalizeDevice: function (data) {
    return JSON.parse(JSON.stringify(data));
  },

  normalizeOpening: function (data) {
    return JSON.parse(JSON.stringify(data));
  },

  // أبعاد الحائط حسب نوعه
  wallDim: function (wallId) {
    var R = CONFIG.ROOM;
    return (wallId === 'back') ? R.width : R.depth;
  },

  // ارتفاع الحائط
  wallHeight: function () {
    return CONFIG.ROOM.height;
  }
};
