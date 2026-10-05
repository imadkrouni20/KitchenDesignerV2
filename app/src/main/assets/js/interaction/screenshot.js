// ============================================
// interaction/screenshot.js
// ============================================
var Screenshot = {

  capture: function () {
    // أعِد الرسم أولاً
    Scene.renderer.render(Scene.scene, Scene.camera);
    var dataURL = Scene.renderer.domElement.toDataURL('image/png');

    // نزّل الملف
    var a = document.createElement('a');
    a.href = dataURL;
    a.download = 'kitchen_' + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    this._toast('📷 تم الحفظ');
  },

  _toast: function (msg) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText =
      'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);' +
      'background:#333;color:#fff;padding:10px 18px;border-radius:20px;' +
      'font-size:14px;z-index:999;transition:opacity .3s';
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; }, 1200);
    setTimeout(function () { t.remove(); }, 1600);
  }
};
