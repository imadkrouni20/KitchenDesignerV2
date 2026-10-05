// ============================================
// interaction/drag.js — سحب بالنسبة للكاميرا + snap
// ============================================
var Drag = {
  active: null,
  startPos: null,
  _startX: 0, _startY: 0,
  moved: false,
  _wasOrbitEnabled: true,

  init: function () {
    var el = Scene.renderer.domElement;
    var self = this;

    el.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      self._start(e.touches[0].clientX, e.touches[0].clientY);
    }, { capture: true, passive: true });

    el.addEventListener('touchmove', function (e) {
      if (e.touches.length !== 1 || !self.active) return;
      e.preventDefault();
      self._move(e.touches[0].clientX, e.touches[0].clientY);
    }, { capture: true, passive: false });

    el.addEventListener('touchend', function () {
      self._end();
    }, { capture: true, passive: true });

    el.addEventListener('mousedown', function (e) {
      self._start(e.clientX, e.clientY);
    }, { capture: true });
    window.addEventListener('mousemove', function (e) {
      if (self.active) self._move(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', function () {
      self._end();
    });
  },

  _start: function (cx, cy) {
    var rec = Selection.current;
    if (!rec) return;
    if (rec.data.locked) return;
    if (rec.kind === 'opening') return;

    this.active = rec;
    this.moved = false;
    this._startX = cx;
    this._startY = cy;

    var p = rec.mesh.position;
    this.startPos = { x: p.x, y: p.y, z: p.z };

    if (Scene.orbit) {
      this._wasOrbitEnabled = Scene.orbit.enabled;
      Scene.orbit.enabled = false;
    }
  },

  _move: function (cx, cy) {
    if (!this.active) return;
    var dx = cx - this._startX;
    var dy = cy - this._startY;
    var dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 8 && !this.moved) return;
    this.moved = true;

    // ===== اتجاهات الكاميرا على الأرض =====
    var cam = Scene.camera;
    var up = new THREE.Vector3(0, 1, 0);
    var forward = new THREE.Vector3();
    cam.getWorldDirection(forward);
    forward.y = 0;
    if (forward.length() < 0.001) forward.set(0, 0, -1);
    forward.normalize();

    var right = new THREE.Vector3().crossVectors(forward, up).normalize();

    // ===== الإزاحة بالنسبة للشاشة =====
    var sens = 0.004;
    var p = this.active.mesh.position;
    p.x = this.startPos.x + (dx * right.x - dy * forward.x) * sens;
    p.z = this.startPos.z + (dx * right.z - dy * forward.z) * sens;

    // حدود الغرفة
    var R = CONFIG.ROOM;
    var half = 0.05;
    if (p.x < -R.width/2 + half) p.x = -R.width/2 + half;
    if (p.x >  R.width/2 - half) p.x =  R.width/2 - half;
    if (p.z < -R.depth/2 + half) p.z = -R.depth/2 + half;
    if (p.z >  R.depth/2 - half) p.z =  R.depth/2 - half;

    Selection.refreshOutline();
  },

  _end: function () {
    if (!this.active) return;
    if (this.moved) {
      this._snap(this.active);
      var p = this.active.mesh.position;
      this.active.data.position = { x: p.x, y: p.y, z: p.z };
    }
    this.active = null;
    if (Scene.orbit) Scene.orbit.enabled = this._wasOrbitEnabled;
  },

  // ============================================
  // الالتصاق المغناطيسي — باستخدام البيانات مباشرة
  // ============================================
  _snap: function (rec) {
    var SNAP = 0.10;   // 10cm
    var p = rec.mesh.position;

    // الأبعاد من البيانات (لا من Box3)
    var W = (rec.data.width  || 60) / 100;
    var D = (rec.data.depth  || 55) / 100;

    // ===== التصاق بالحوائط =====
    var R = CONFIG.ROOM;
    var wallBack  = -R.depth / 2 + D / 2;
    var wallLeft  = -R.width / 2 + W / 2;
    var wallRight =  R.width / 2 - W / 2;

    if (Math.abs(p.z - wallBack)  < SNAP) p.z = wallBack;
    if (Math.abs(p.x - wallLeft)  < SNAP) p.x = wallLeft;
    if (Math.abs(p.x - wallRight) < SNAP) p.x = wallRight;

    // ===== التصاق بصناديق وأجهزة أخرى =====
    var others = Objects.boxes.concat(Objects.devices);
    for (var i = 0; i < others.length; i++) {
      var other = others[i];
      if (other === rec) continue;
      if (!other.mesh) continue;

      var o = other.mesh.position;
      var oW = (other.data.width || 60) / 100;

      // نفس "الصف"؟ (زاوية z قريبة، ونفس الارتفاع)
      if (Math.abs(p.z - o.z) > 0.20) continue;
      if (Math.abs(p.y - o.y) > 0.06) continue;

      // يمين الجار: p.x = o.x - (oW + W)/2
      var targetRight = o.x - (oW + W) / 2;
      if (Math.abs(p.x - targetRight) < SNAP) {
        p.x = targetRight;
      }
      // يسار الجار: p.x = o.x + (oW + W)/2
      var targetLeft = o.x + (oW + W) / 2;
      if (Math.abs(p.x - targetLeft) < SNAP) {
        p.x = targetLeft;
      }
    }

    // ===== التصاق بالأرضية (y) =====
    if (Math.abs(p.y) < SNAP) p.y = 0;

    Selection.refreshOutline();
  }
};
