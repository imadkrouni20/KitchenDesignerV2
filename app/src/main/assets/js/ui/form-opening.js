// ============================================
// ui/form-opening.js
// ============================================
var FormOpening = {
  render: function (d, opts) {
    opts = opts || {};
    var html =
      Fields.text('of-name', 'الاسم', d.name) +
      Fields.select('of-wall', 'الحائط', d.wall, CONFIG.WALLS) +
      '<div class="field"><label>الأبعاد (سم)</label>' +
        '<div class="row three">' +
          '<input type="number" id="of-width" value="' + d.width + '" min="30" max="250">' +
          '<input type="number" id="of-height" value="' + d.height + '" min="30" max="240">' +
          '<input type="number" id="of-thickness" value="' + d.thickness + '" min="4" max="20">' +
        '</div>' +
      '</div>' +
      Fields.num('of-elevation', 'الارتفاع عن الأرض (سم)', d.elevation, 0, 250, 0.5) +
      Fields.num('of-offset', 'إزاحة أفقية عن المركز (سم)', d.offset, -300, 300, 1) +
      '<div class="field"><label>الألوان</label>' +
        '<div class="row">' +
          '<div><label style="font-size:11px">الإطار</label><input type="color" id="of-frameColor" value="' + d.frameColor + '"></div>' +
          '<div><label style="font-size:11px">الزجاج</label><input type="color" id="of-glassColor" value="' + d.glassColor + '"></div>' +
        '</div>' +
      '</div>' +
      Fields.num('of-glassOpacity', 'شفافية الزجاج (0-1)', d.glassOpacity, 0, 1, 0.05) +
      Fields.check('of-hasHandle', 'مقبض (للأبواب)', d.hasHandle) +
      Fields.check('of-locked', '🔒 قفل الموضع', d.locked);

    return html + (opts.buttons || '');
  }
};
