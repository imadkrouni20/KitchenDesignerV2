// ============================================
// builders/cutlist.js — قائمة قطع MDF
// ============================================
var Cutlist = {

  // يُرجع قائمة كل القطع بمقاساتها
  generate: function () {
    var pieces = [];
    var T = 1.8;   // سمك MDF الافتراضي

    for (var i = 0; i < Objects.boxes.length; i++) {
      var rec = Objects.boxes[i];
      var d = rec.data;
      if (d.category === 'custom' && d.skipCutlist) continue;

      var W = d.width, H = d.height, D = d.depth;
      var t = d.mdfThickness || T;
      var name = d.name || 'صندوق';

      // القاع
      pieces.push({ name: name + ' — قاع', w: W, h: D, thick: t, qty: 1 });

      // الجانبان
      pieces.push({ name: name + ' — جانب', w: H, h: D, thick: t, qty: 2 });

      // العلوي
      if (d.hasTop) pieces.push({ name: name + ' — علوي', w: W, h: D, thick: t, qty: 1 });

      // الظهر
      if (d.hasBack) pieces.push({ name: name + ' — ظهر', w: W, h: H, thick: t, qty: 1 });

      // الأرفف
      var sc = d.shelfCount || 0;
      if (sc > 0) pieces.push({ name: name + ' — رف', w: W - t * 2, h: D - t, thick: t, qty: sc });

      // رفوف مخصصة (طويل)
      if (d.useCustomShelves && d.customShelfCount > 0) {
        pieces.push({ name: name + ' — رف مخصص', w: W - t * 2, h: D - t, thick: t, qty: d.customShelfCount });
      }

      // أدراج
      if (d.drawerCount > 0) {
        var dh = d.drawerHeight || 15;
        pieces.push({ name: name + ' — واجهة درج', w: W - 0.4, h: dh - 0.4, thick: t, qty: d.drawerCount });
      }

      // الأبواب
      var doorH = H - 0.4;
      if (d.category === 'tall') {
        var heights = d.tallDoorHeights || [];
        for (var k = 0; k < (d.tallDoorCount || 0); k++) {
          var hh = (heights[k] || 60) - 0.4;
          pieces.push({ name: name + ' — باب طويل #' + (k+1), w: W - 0.4, h: hh, thick: t, qty: 1 });
        }
      } else if (d.doorCount === 1) {
        pieces.push({ name: name + ' — باب', w: W - 0.4, h: doorH, thick: t, qty: 1 });
      } else if (d.doorCount === 2) {
        pieces.push({ name: name + ' — باب', w: W/2 - 0.4, h: doorH, thick: t, qty: 2 });
      }

      // رخام علوي
      if (d.hasCountertop) {
        var mW = W + (d.marbleOverhangSides || 0) * 2;
        var mD = D + (d.marbleOverhangFront || 0);
        pieces.push({ name: name + ' — رخام علوي', w: mW, h: mD, thick: d.marbleThickness || 3, qty: 1 });
      }
    }

    return pieces;
  },

  // يُرجع HTML للعرض
  renderHTML: function () {
    var pieces = this.generate();
    if (pieces.length === 0) {
      return '<div style="text-align:center;color:#9aa3ad;padding:24px;font-size:13px">' +
        '📭 لا توجد قطع — أضف صناديق أولاً</div>';
    }

    var html = '<div style="font-size:12px;color:#9aa3ad;margin-bottom:10px">' +
      '📋 ' + pieces.length + ' قطعة' +
      '</div>';

    // جمّع القطع المتشابهة
    var grouped = {};
    for (var i = 0; i < pieces.length; i++) {
      var p = pieces[i];
      var key = p.thick + '|' + p.w + '|' + p.h;
      if (!grouped[key]) {
        grouped[key] = { name: p.name, w: p.w, h: p.h, thick: p.thick, qty: 0 };
      }
      grouped[key].qty += p.qty;
    }

    html += '<table style="width:100%;border-collapse:collapse;font-size:11px">' +
      '<thead><tr style="background:#171b20;color:#9aa3ad">' +
        '<th style="padding:6px;text-align:right">الاسم</th>' +
        '<th style="padding:6px">عرض</th>' +
        '<th style="padding:6px">طول</th>' +
        '<th style="padding:6px">سُمك</th>' +
        '<th style="padding:6px">عدد</th>' +
      '</tr></thead><tbody>';

    for (var key in grouped) {
      var g = grouped[key];
      html += '<tr style="border-bottom:1px solid #3a4148">' +
        '<td style="padding:5px;font-size:10px">' + this._esc(g.name) + '</td>' +
        '<td style="padding:5px;text-align:center">' + g.w.toFixed(1) + '</td>' +
        '<td style="padding:5px;text-align:center">' + g.h.toFixed(1) + '</td>' +
        '<td style="padding:5px;text-align:center">' + g.thick.toFixed(1) + '</td>' +
        '<td style="padding:5px;text-align:center;font-weight:600">' + g.qty + '</td>' +
      '</tr>';
    }

    html += '</tbody></table>';
    html += '<button class="btn-primary" id="cut-export" style="margin-top:10px">📄 نسخ كنص</button>';
    return html;
  },

  // تصدير كنص
  exportText: function () {
    var pieces = this.generate();
    var grouped = {};
    for (var i = 0; i < pieces.length; i++) {
      var p = pieces[i];
      var key = p.thick + '|' + p.w + '|' + p.h;
      if (!grouped[key]) {
        grouped[key] = { name: p.name, w: p.w, h: p.h, thick: p.thick, qty: 0 };
      }
      grouped[key].qty += p.qty;
    }

    var lines = ['قائمة القص — مصمم المطبخ', '========================', ''];
    for (var key in grouped) {
      var g = grouped[key];
      lines.push(g.name + ' | ' + g.w.toFixed(1) + '×' + g.h.toFixed(1) + '×' + g.thick.toFixed(1) + ' سم | ' + g.qty + ' قطعة');
    }
    lines.push('');
    lines.push('المجموع: ' + pieces.length + ' قطعة');
    return lines.join('\n');
  },

  _esc: function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }
};
