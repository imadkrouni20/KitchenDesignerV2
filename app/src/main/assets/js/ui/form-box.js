// ============================================
// ui/form-box.js — نموذج الصندوق الكامل
// ============================================
var FormBox = {

  render: function (d, opts) {
    opts = opts || {};
    var self = this;
    var cat = d.category || 'lower';
    var isUpper = (cat === 'upper');
    var isTall = (cat === 'tall');
    var isDrawers = (cat === 'drawers');

    var parts = [];

    // ===== أساسي =====
    parts.push(Fields.section('📋 أساسي',
      Fields.text('bf-name', 'الاسم', d.name) +
      Fields.select('bf-category', 'الفئة', d.category, CONFIG.CATEGORIES) +
      Fields.num('bf-elevation', 'الارتفاع عن الأرض (سم)', d.elevation || 0, 0, 250, 0.5),
      false));

    // ===== الموضع والقفل =====
    parts.push(Fields.section('🔓 الموضع',
      Fields.check('bf-locked', '🔒 قفل الموضع (يمنع السحب)', d.locked) +
      (function () {
        var px = (d.position && d.position.x != null) ? d.position.x : 0;
        var py = (d.position && d.position.y != null) ? d.position.y : 0;
        var pz = (d.position && d.position.z != null) ? d.position.z : 0;
        return '<div class="field"><label>الموضع (متر)</label>' +
          '<div class="row three">' +
            '<div><label style="font-size:11px">X</label>' +
              '<input type="number" id="bf-pos-x" value="' + px.toFixed(2) + '" step="0.05"></div>' +
            '<div><label style="font-size:11px">Y</label>' +
              '<input type="number" id="bf-pos-y" value="' + py.toFixed(2) + '" step="0.05" disabled></div>' +
            '<div><label style="font-size:11px">Z</label>' +
              '<input type="number" id="bf-pos-z" value="' + pz.toFixed(2) + '" step="0.05"></div>' +
          '</div>' +
        '</div>';
      })(),
      false));

    // ===== الأبعاد =====
    parts.push(Fields.section('📏 الأبعاد',
      '<div class="field"><label>العرض × الارتفاع × العمق (سم)</label>' +
        '<div class="row three">' +
          '<input type="number" id="bf-width" value="' + d.width + '" min="10" max="300" step="1">' +
          '<input type="number" id="bf-height" value="' + d.height + '" min="10" max="300" step="1">' +
          '<input type="number" id="bf-depth" value="' + d.depth + '" min="10" max="120" step="1">' +
        '</div>' +
      '</div>' +
      Fields.num('bf-mdf', 'سمك MDF (سم)', d.mdfThickness, 0.5, 5, 0.1),
      false));

    // ===== الهيكل =====
    var struct = Fields.check('bf-hasTop', 'قطعة علوية', d.hasTop) +
                 Fields.check('bf-hasBack', 'ظهر خلفي', d.hasBack);
    if (!isTall) {
      struct += Fields.num('bf-shelfCount', 'عدد الرفوف (0-6)', d.shelfCount, 0, 6, 1) +
                Fields.check('bf-glassShelves', 'رفوف زجاجية', d.glassShelves);
    }
    parts.push(Fields.section('🏗️ الهيكل', struct, true));

    // ===== الدعامة (سفلي/أدراج فقط) =====
    if (!isUpper && !isTall) {
      var sup = Fields.select('bf-supportType', 'نوع الدعامة', d.supportType, CONFIG.SUPPORT_TYPES);
      if (d.supportType === 'legs') {
        sup += Fields.select('bf-legType', 'شكل الأرجل', d.legType || 'square', [
          { id: 'square', label: 'مربعة' },
          { id: 'round',  label: 'دائرية' }
        ]);
        sup += Fields.num('bf-legHeight', 'ارتفاع الأرجل (سم)', d.legHeight, 0, 40, 0.5);
      } else if (d.supportType === 'marble') {
        sup += Fields.num('bf-frontMarbleHeight', 'ارتفاع الرخام الأمامي (سم)', d.frontMarbleHeight, 5, 30, 0.5);
      }
      parts.push(Fields.section('🦵 الدعامة', sup, true));
    }

    // ===== الرخام + الحوض + الموقد (سفلي/أدراج/مخصص) =====
    if (!isUpper && !isTall) {
      var marble = Fields.check('bf-hasCountertop', 'رخام علوي', d.hasCountertop) +
        Fields.select('bf-marbleType', 'نوع الرخام', d.marbleType, CONFIG.MARBLE_TYPES) +
        Fields.num('bf-marbleThickness', 'سمك الرخام (سم)', d.marbleThickness, 1, 6, 0.5) +
        Fields.num('bf-marbleOverhangFront', 'بروز أمامي (سم)', d.marbleOverhangFront, 0, 10, 0.5) +
        Fields.num('bf-marbleOverhangSides', 'بروز جانبي (سم)', d.marbleOverhangSides, 0, 10, 0.5);
      parts.push(Fields.section('🪨 الرخام', marble, true));

      var sink = Fields.check('bf-hasSink', 'حوض', d.hasSink) +
        Fields.select('bf-sinkType', 'نوع الحوض', d.sinkType, CONFIG.SINK_TYPES) +
        Fields.num('bf-sinkWidth', 'عرض الحوض (سم)', d.sinkWidth, 20, 100, 1) +
        Fields.num('bf-sinkDepth', 'عمق الحوض (سم)', d.sinkDepth, 20, 80, 1) +
        Fields.num('bf-sinkOffset', 'إزاحة عن المركز (سم)', d.sinkOffset, -60, 60, 1);
      parts.push(Fields.section('🚰 الحوض', sink, true));

      var stove = Fields.check('bf-hasStove', 'موقد', d.hasStove) +
        Fields.select('bf-stoveType', 'نوع الموقد', d.stoveType, CONFIG.STOVE_TYPES) +
        Fields.num('bf-stoveWidth', 'عرض الموقد (سم)', d.stoveWidth, 20, 120, 1) +
        Fields.num('bf-stoveDepth', 'عمق الموقد (سم)', d.stoveDepth, 20, 80, 1) +
        Fields.num('bf-stoveOffset', 'إزاحة عن المركز (سم)', d.stoveOffset, -60, 60, 1);
      parts.push(Fields.section('🔥 الموقد', stove, true));
    }

    // ===== الأدراج =====
    if (isDrawers || (!isUpper && !isTall)) {
      var dr = Fields.num('bf-drawerCount', 'عدد الأدراج (0-5)', d.drawerCount, 0, 5, 1);
      if ((d.drawerCount || 0) >= 1) {
        dr += Fields.select('bf-drawerPosition', 'موضع الدرج (إن كان 1)', d.drawerPosition, [
          { id: 'top',    label: 'أعلى' },
          { id: 'middle', label: 'وسط' },
          { id: 'bottom', label: 'أسفل' }
        ]);
      }
      if ((d.drawerCount || 0) === 2) {
        dr += Fields.select('bf-drawerSplitMode', 'ترتيب الدرجين', d.drawerSplitMode, [
          { id: 'stack', label: 'مكدسان من الأعلى' },
          { id: 'split', label: 'تقسيم الارتفاع بالتساوي' }
        ]);
      }
      dr += Fields.num('bf-drawerHeight', 'ارتفاع الدرج (سم)', d.drawerHeight, 5, 40, 1);
      dr += Fields.select('bf-drawerFillMode', 'المساحة المتبقية', d.drawerFillMode, CONFIG.DRAWER_FILL);
      if (d.drawerFillMode && d.drawerFillMode !== 'none') {
        dr += Fields.num('bf-fillDoorHeight', 'ارتفاع الباب/الرف (سم) — 0 = تلقائي', d.fillDoorHeight, 0, 200, 1);
        if (d.drawerFillMode === 'door' || d.drawerFillMode === 'glassDoor') {
          dr += Fields.num('bf-fillDoorElevation', 'ارتفاع الباب عن الأرض (سم)', d.fillDoorElevation, 0, 200, 0.5);
        }
      }
      parts.push(Fields.section('🗄️ الأدراج', dr, true));
    }

    // ===== الأبواب =====
    if (isTall) {
      var tCount = d.tallDoorCount || 3;
      var tHeights = d.tallDoorHeights || [60, 60, 60, 60];
      var tElevs = d.tallDoorElevations || [0, 60, 120, 180];
      var tall = Fields.num('bf-tallDoorCount', 'عدد الأبواب عمودياً (1-4)', tCount, 1, 4, 1);
      for (var i = 0; i < tCount; i++) {
        tall += '<div style="border:1px solid #3a4148;border-radius:8px;padding:8px;margin-bottom:6px;background:#22262c">' +
          '<div style="font-size:12px;color:#9aa3ad;margin-bottom:4px">🚪 الباب ' + (i+1) + '</div>' +
          '<div class="row">' +
            '<div><label style="font-size:11px">عن الأرض</label>' +
              '<input type="number" id="bf-tallDoorElev-' + i + '" value="' + (tElevs[i] != null ? tElevs[i] : i*60) + '" min="0" max="250" step="0.5"></div>' +
            '<div><label style="font-size:11px">الارتفاع</label>' +
              '<input type="number" id="bf-tallDoorHeight-' + i + '" value="' + (tHeights[i] != null ? tHeights[i] : 60) + '" min="10" max="200" step="1"></div>' +
          '</div>' +
        '</div>';
      }
      tall += Fields.select('bf-doorMaterial', 'مادة الباب', d.doorMaterial, CONFIG.DOOR_MATERIALS);
      if (d.doorMaterial === 'glass-framed') {
        tall += Fields.num('bf-glassDoorFrameThickness', 'سمك إطار MDF (سم)', d.glassDoorFrameThickness, 2, 15, 0.5);
      }
      parts.push(Fields.section('🚪 أبواب عمودية', tall, false));

      var appl = Fields.check('bf-hasOven', '🔥 فرن مدمج', d.hasOven);
      if (d.hasOven) {
        appl += '<div class="row three">' +
          '<div><label style="font-size:11px">عرض</label><input type="number" id="bf-ovenWidth" value="' + (d.ovenWidth||60) + '" min="30" max="90"></div>' +
          '<div><label style="font-size:11px">ارتفاع</label><input type="number" id="bf-ovenHeight" value="' + (d.ovenHeight||45) + '" min="20" max="90"></div>' +
          '<div><label style="font-size:11px">عمق</label><input type="number" id="bf-ovenDepth" value="' + (d.ovenDepth||55) + '" min="30" max="100"></div>' +
        '</div>' +
        Fields.num('bf-ovenElevation', 'ارتفاع الفرن عن الأرض (سم)', d.ovenElevation, 0, 250, 0.5);
      }
      appl += Fields.check('bf-hasMicrowave', '📻 ميكروويف مدمج', d.hasMicrowave);
      if (d.hasMicrowave) {
        appl += '<div class="row three">' +
          '<div><label style="font-size:11px">عرض</label><input type="number" id="bf-mwWidth" value="' + (d.mwWidth||50) + '" min="30" max="90"></div>' +
          '<div><label style="font-size:11px">ارتفاع</label><input type="number" id="bf-mwHeight" value="' + (d.mwHeight||30) + '" min="20" max="90"></div>' +
          '<div><label style="font-size:11px">عمق</label><input type="number" id="bf-mwDepth" value="' + (d.mwDepth||35) + '" min="30" max="100"></div>' +
        '</div>' +
        Fields.num('bf-mwElevation', 'ارتفاع الميكروويف عن الأرض (سم)', d.mwElevation, 0, 250, 0.5);
      }
      parts.push(Fields.section('🔌 أجهزة مدمجة', appl, true));

      var cs = Fields.check('bf-useCustomShelves', 'تفعيل رفوف مخصصة', d.useCustomShelves);
      if (d.useCustomShelves) {
        var csCount = d.customShelfCount || 2;
        var csElevs = d.customShelfElevations || [];
        cs += Fields.num('bf-customShelfCount', 'عدد الرفوف (0-6)', csCount, 0, 6, 1);
        for (var j = 0; j < csCount; j++) {
          cs += Fields.num('bf-customShelfElev-' + j, 'الرف ' + (j+1) + ' — ارتفاع عن الأرض',
            csElevs[j] != null ? csElevs[j] : (j+1)*60, 0, 250, 0.5);
        }
      }
      parts.push(Fields.section('📚 رفوف مخصصة', cs, true));
    } else {
      var doors = Fields.num('bf-doorCount', 'عدد الأبواب (0-2)', d.doorCount, 0, 2, 1);
      if (d.doorCount === 1) {
        doors += Fields.select('bf-doorDirection', 'اتجاه الفتح', d.doorDirection, [
          { id: 'right', label: 'يمين' },
          { id: 'left',  label: 'يسار' }
        ]);
      }
      doors += Fields.select('bf-doorMaterial', 'مادة الباب', d.doorMaterial, CONFIG.DOOR_MATERIALS);
      if (d.doorMaterial === 'glass-framed') {
        doors += Fields.num('bf-glassDoorFrameThickness', 'سمك إطار MDF (سم)', d.glassDoorFrameThickness, 2, 15, 0.5);
      }
      parts.push(Fields.section('🚪 الأبواب', doors, true));
    }

    // ===== المقابض =====
    var handles = Fields.select('bf-handleType', 'نوع المقبض', d.handleType, CONFIG.HANDLE_TYPES);
    if (d.handleType && d.handleType !== 'none') {
      if (d.handleType === 'bar' || d.handleType === 'edge') {
        handles += Fields.num('bf-handleLength', 'طول المقبض (سم)', d.handleLength, 3, 40, 0.5);
      }
      handles += Fields.num('bf-handleOffset', 'بعد عن الحافة (سم)', d.handleOffset, 1, 15, 0.5);
    }
    parts.push(Fields.section('🔘 المقابض', handles, true));

    // ===== toe kick =====
    var tk = Fields.check('bf-hasToeKick', 'قاعدة سفلية (toe kick)', d.hasToeKick);
    if (d.hasToeKick) {
      tk += Fields.num('bf-toeKickHeight', 'ارتفاعها (سم)', d.toeKickHeight, 5, 20, 0.5);
      tk += Fields.num('bf-toeKickDepth', 'عمقها (سم)', d.toeKickDepth, 2, 15, 0.5);
    }
    parts.push(Fields.section('📐 القاعدة السفلية', tk, true));

    // ===== الألوان =====
    var colors =
      '<div class="row">' +
        '<div><label style="font-size:11px">MDF</label><input type="color" id="bf-colorMdf" value="' + d.colorMdf + '"></div>' +
        '<div><label style="font-size:11px">داخلي</label><input type="color" id="bf-colorMdfInner" value="' + d.colorMdfInner + '"></div>' +
      '</div>' +
      '<div class="row" style="margin-top:8px">' +
        '<div><label style="font-size:11px">الرفوف</label><input type="color" id="bf-colorShelves" value="' + d.colorShelves + '"></div>' +
        '<div><label style="font-size:11px">الرخام</label><input type="color" id="bf-colorMarble" value="' + d.colorMarble + '"></div>' +
      '</div>' +
      '<div class="row" style="margin-top:8px">' +
        '<div><label style="font-size:11px">المعدن</label><input type="color" id="bf-colorMetal" value="' + d.colorMetal + '"></div>' +
        '<div><label style="font-size:11px">المقابض</label><input type="color" id="bf-colorHandles" value="' + d.colorHandles + '"></div>' +
      '</div>' +
      '<div class="row" style="margin-top:8px">' +
        '<div><label style="font-size:11px">القاعدة</label><input type="color" id="bf-colorToeKick" value="' + (d.colorToeKick || '#5a5a5a') + '"></div>' +
      '</div>';
    parts.push(Fields.section('🎨 الألوان', colors, true));

    // ===== أزرار =====
    parts.push(opts.buttons || '');

    return parts.join('');
  }
};
