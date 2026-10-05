// ============================================
// ui/fabs.js — الأزرار العائمة الجانبية
// ============================================
var Fabs = {

  init: function () {
    var body = document.body;
    var bottom = 'calc(16px + env(safe-area-inset-bottom))';
    var left = 'calc(16px + env(safe-area-inset-left))';

    body.insertAdjacentHTML('beforeend',
      '<button id="fab-undo" class="fab" style="left:' + left + ';bottom:' + bottom + ';background:#555;font-size:20px">↶</button>' +
      '<button id="fab-redo" class="fab" style="left:' + left + ';bottom:calc(' + bottom + ' + 68px);background:#555;font-size:20px">↷</button>' +
      '<button id="fab-shot" class="fab" style="left:' + left + ';bottom:calc(' + bottom + ' + 136px);background:#666;font-size:20px">📷</button>'
    );

    var undo = document.getElementById('fab-undo');
    var redo = document.getElementById('fab-redo');
    var shot = document.getElementById('fab-shot');
    var open = document.getElementById('fab-open');

    if (undo) undo.addEventListener('click', function () {
      if (History.undo()) Fabs._toast('↶ تراجع');
    });
    if (redo) redo.addEventListener('click', function () {
      if (History.redo()) Fabs._toast('↷ إعادة');
    });
    if (shot) shot.addEventListener('click', function () {
      Screenshot.capture();
    });
    if (open) open.addEventListener('click', function () {
      Fabs._onOpenClick();
    });
  },

  _onOpenClick: function () {
    var rec = Selection.current;
    if (!rec) { this._toast('⚠️ اختر عنصراً أولاً'); return; }

    var ok = OpenClose.toggle(rec);
    if (!ok) { this._toast('⚠️ لا أبواب أو أدراج'); return; }

    var key = rec.data.id || (rec.data.name + '_' + rec.mesh.position.x);
    var isOpen = OpenClose.state[key];
    var btn = document.getElementById('fab-open');
    if (btn) btn.textContent = isOpen ? '🔒' : '🔓';
    this._toast(isOpen ? '🔓 مفتوح' : '🔒 مغلق');
  },

  _toast: function (msg) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText =
      'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);' +
      'background:#333;color:#fff;padding:10px 18px;border-radius:20px;' +
      'font-size:14px;z-index:999;transition:opacity .3s';
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; }, 1000);
    setTimeout(function () { t.remove(); }, 1400);
  }
};
