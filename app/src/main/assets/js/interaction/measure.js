// ============================================
// interaction/measure.js — قياس المسافات بنقرتين
// ============================================
var Measure = {
  active: false,
  points: [],
  markers: [],
  line: null,
  label: null,

  toggle: function () {
    this.active = !this.active;
    this.clear();
    this._toast(this.active ? '📏 انقر نقطتين للقياس' : '📏 القياس موقوف');
  },

  init: function () {
    var el = Scene.renderer.domElement;
    var self = this;

    el.addEventListener('click', function (e) {
      if (!self.active) return;
      self._onClick(e.clientX, e.clientY);
    });
  },

  _onClick: function (cx, cy) {
    var rect = Scene.renderer.domElement.getBoundingClientRect();
    var pointer = new THREE.Vector2();
    pointer.x = ((cx - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((cy - rect.top) / rect.height) * 2 + 1;
    var rc = new THREE.Raycaster();
    rc.setFromCamera(pointer, Scene.camera);

    // ابحث عن تقاطع مع الأرضية
    var plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    var point = new THREE.Vector3();
    var hit = rc.ray.intersectPlane(plane, point);
    if (!hit) return;

    this.points.push(point.clone());
    this._addMarker(point);

    if (this.points.length === 2) {
      this._drawLine();
    } else if (this.points.length > 2) {
      this.clear();
      this.points.push(point.clone());
      this._addMarker(point);
    }
  },

  _addMarker: function (p) {
    var m = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xff3333 })
    );
    m.position.copy(p);
    m.position.y = 0.02;
    Scene.scene.add(m);
    this.markers.push(m);
  },

  _drawLine: function () {
    var p1 = this.points[0];
    var p2 = this.points[1];
    p1.y = 0.02; p2.y = 0.02;

    var geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    var mat = new THREE.LineBasicMaterial({ color: 0xff3333, linewidth: 2 });
    this.line = new THREE.Line(geo, mat);
    Scene.scene.add(this.line);

    // النص
    var dist = p1.distanceTo(p2);
    var cm = (dist * 100).toFixed(1);

    var mid = p1.clone().add(p2).multiplyScalar(0.5);
    mid.y = 0.15;

    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#fff';
    ctx.font = '28px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(cm + ' cm', 128, 42);

    var tex = new THREE.CanvasTexture(canvas);
    var sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
    sprite.scale.set(0.6, 0.15, 1);
    sprite.position.copy(mid);
    Scene.scene.add(sprite);
    this.label = sprite;
  },

  clear: function () {
    for (var i = 0; i < this.markers.length; i++) {
      Scene.scene.remove(this.markers[i]);
    }
    this.markers = [];
    this.points = [];
    if (this.line) { Scene.scene.remove(this.line); this.line = null; }
    if (this.label) { Scene.scene.remove(this.label); this.label = null; }
  },

  _toast: function (msg) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText =
      'position:fixed;bottom:160px;left:50%;transform:translateX(-50%);' +
      'background:#333;color:#fff;padding:10px 18px;border-radius:20px;' +
      'font-size:14px;z-index:999;transition:opacity .3s';
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; }, 1200);
    setTimeout(function () { t.remove(); }, 1600);
  }
};
