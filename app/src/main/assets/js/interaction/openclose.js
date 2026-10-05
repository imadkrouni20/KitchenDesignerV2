// ============================================
// interaction/openclose.js — فتح/إغلاق الأبواب والأدراج
// ============================================
var OpenClose = {
  state: {},   // id → true/false

  // افتح أو أغلق عنصراً
  toggle: function (rec) {
    if (!rec) return false;

    // هل يحتوي على أبواب/أدراج؟
    var hasAnim = false;
    rec.mesh.traverse(function (o) {
      if (o.userData && o.userData.animType) hasAnim = true;
    });
    if (!hasAnim) return false;

    var key = rec.data.id || (rec.data.name + '_' + rec.mesh.position.x);
    var isOpen = !this.state[key];
    this.state[key] = isOpen;

    // اضبط الأهداف
    var angle = isOpen ? Math.PI / 2 : 0;   // 90°
    rec.mesh.traverse(function (o) {
      if (!o.userData) return;

      if (o.userData.animType === 'door') {
        // اتجاه الفتح يعتمد على hingeSign
        o.userData.targetAngle = o.userData.hingeSign * angle;
      } else if (o.userData.animType === 'drawer') {
        o.userData.targetZ = isOpen ? o.userData.openZ : o.userData.closedZ;
      }
    });

    return true;
  },

  // يعمل كل إطار — lerp سلس
  update: function (dt) {
    var k = Math.min(1, dt * 8);   // معامل التباطؤ

    // مرّ على كل العناصر المفتوحة/المغلقة
    for (var i = 0; i < Objects.boxes.length; i++) {
      var rec = Objects.boxes[i];
      var key = rec.data.id || (rec.data.name + '_' + rec.mesh.position.x);
      var target = this.state[key];

      rec.mesh.traverse(function (o) {
        if (!o.userData) return;

        if (o.userData.animType === 'door' && o.userData.targetAngle != null) {
          var diff = o.userData.targetAngle - o.rotation.y;
          if (Math.abs(diff) > 0.001) {
            o.rotation.y += diff * k;
          } else {
            o.rotation.y = o.userData.targetAngle;
          }
        } else if (o.userData.animType === 'drawer' && o.userData.targetZ != null) {
          var diffZ = o.userData.targetZ - o.position.z;
          if (Math.abs(diffZ) > 0.001) {
            o.position.z += diffZ * k;
          } else {
            o.position.z = o.userData.targetZ;
          }
        }
      });
    }
  }
};
