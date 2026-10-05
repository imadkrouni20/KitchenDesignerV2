// ============================================
// ui/form-device.js — نموذج الجهاز المبسّط
// ============================================
var FormDevice = {
  render: function (d, opts) {
    opts = opts || {};

    var html =
      Fields.text('df-name', 'الاسم', d.name) +
      '<div class="field"><label>الأبعاد (سم)</label>' +
        '<div class="row three">' +
          '<input type="number" id="df-width" value="' + d.width + '" min="10" max="300">' +
          '<input type="number" id="df-height" value="' + d.height + '" min="10" max="250">' +
          '<input type="number" id="df-depth" value="' + d.depth + '" min="10" max="120">' +
        '</div>' +
      '</div>' +
      Fields.num('df-elevation', 'الارتفاع عن الأرض (سم)', d.elevation || 0, 0, 250, 0.5) +
      Fields.check('df-locked', '🔒 قفل الموضع', d.locked) +
      '<div class="field"><label>الألوان</label>' +
        '<div class="row">' +
          '<div><label style="font-size:11px">الجسم</label><input type="color" id="df-colorBody" value="' + d.colorBody + '"></div>' +
          '<div><label style="font-size:11px">المعدن</label><input type="color" id="df-colorMetal" value="' + d.colorMetal + '"></div>' +
        '</div>' +
      '</div>';

    // الرخام — للغسالة فقط
    if (d.type === 'dishwasher') {
      html += Fields.section('🪨 الرخام العلوي',
        Fields.check('df-hasCountertop', 'رخام علوي', d.hasCountertop) +
        Fields.num('df-marbleThickness', 'سمك الرخام (سم)', d.marbleThickness || 3, 1, 6, 0.5) +
        Fields.num('df-marbleOverhangFront', 'بروز أمامي (سم)', d.marbleOverhangFront || 2, 0, 10, 0.5) +
        Fields.num('df-marbleOverhangSides', 'بروز جانبي (سم)', d.marbleOverhangSides || 1, 0, 10, 0.5) +
        '<div class="field"><label style="font-size:11px">لون الرخام</label>' +
          '<input type="color" id="df-colorMarble" value="' + (d.colorMarble || '#e8e5df') + '"></div>',
        false);
    }

    return html + (opts.buttons || '');
  }
};
