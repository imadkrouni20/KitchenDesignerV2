// ============================================
// builders/box/index.js — بناء الصندوق الكامل
// ============================================
function buildBox(data) {
  // طبّع البيانات حسب الفئة
  data = Schema.normalizeBox(data);

  var g = new THREE.Group();
  g.name = data.name || 'box';

  // 1. احسب ارتفاع الدعامة
  var supportH = BoxSupport.calcHeight(data);

  // 2. الأجزاء الأساسية
  var parts = BoxParts.build(data, { supportH: supportH });
  g.add(parts.group);

  var dims = parts.dims;

  // 3. الدعامة (أرجل/رخام أمامي/toe kick)
  BoxSupport.build(g, data, dims, supportH);

  // 4. الرخام + الحوض + الموقد
  BoxCountertop.build(g, data, dims, supportH);

  // 5. الأبواب
  BoxDoors.build(g, data, dims, supportH);
  BoxDoors.buildHandles(g, data, dims, supportH);

  // 6. الأدراج
  BoxDrawers.build(g, data, dims, supportH);

  // 7. الأجهزة (فرن/ميكروويف)
  BoxAppliances.build(g, data, dims, supportH);

  // 8. الرفوف المخصصة (طويل)
  BoxAppliances.buildCustomShelves(g, data, dims, supportH);

  g.userData = { type: 'box', data: data };
  return g;
}
