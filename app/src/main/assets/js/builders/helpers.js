// ============================================
// builders/helpers.js — أدوات مشتركة
// ============================================
var BuildHelp = {

  // cm → m
  cm: function (v) { return (v || 0) / 100; },

  // إنشاء mesh مكعب بسرعة
  box: function (w, h, d, mat, x, y, z) {
    var m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d), mat
    );
    m.position.set(x || 0, y || 0, z || 0);
    m.castShadow = m.receiveShadow = true;
    return m;
  },

  // إضافة مجموعة من meshes إلى parent
  addAll: function (parent, meshes) {
    for (var i = 0; i < meshes.length; i++) {
      if (meshes[i]) parent.add(meshes[i]);
    }
  },

  // تحويل لون HEX إلى رقم
  hex: function (c) {
    if (typeof c === 'number') return c;
    return parseInt(String(c).replace('#', '0x'), 16);
  }
};
