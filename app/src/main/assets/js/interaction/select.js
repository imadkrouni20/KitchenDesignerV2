// ============================================
// interaction/select.js — تحديد العناصر
// ============================================
var Selection = {
  current: null,
  outline: null,
  raycaster: null,
  pointer: null,
  _downTime: 0, _downX: 0, _downY: 0,

  init: function () {
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    var el = Scene.renderer.domElement;
    var self = this;

    el.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      self._downX = e.touches[0].clientX;
      self._downY = e.touches[0].clientY;
      self._downTime = Date.now();
    }, { passive: true });

    el.addEventListener('touchend', function (e) {
      if (e.changedTouches.length !== 1) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - self._downX;
      var dy = t.clientY - self._downY;
      var dist = Math.sqrt(dx*dx + dy*dy);
      var dur = Date.now() - self._downTime;
      if (dist < 12 && dur < 400) self.tap(t.clientX, t.clientY);
    }, { passive: true });

    el.addEventListener('click', function (e) {
      self.tap(e.clientX, e.clientY);
    });
  },

    tap: function (cx, cy) {
    var rect = Scene.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((cx - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((cy - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, Scene.camera);

    var meshes = Objects.allSelectableMeshes().concat(Openings.allMeshes());
    var hits = this.raycaster.intersectObjects(meshes, false);
    if (hits.length === 0) { this.deselect(); return; }

    // جرّب كل hits بالترتيب
    for (var h = 0; h < hits.length; h++) {
      var hitMesh = hits[h].object;

      // باب/نافذة؟
      var opRec = Openings.findRecordByMesh(hitMesh);
      if (opRec) { this.select(opRec); return; }

      // صندوق/جهاز؟
      var rec = Objects.findRecordByMesh(hitMesh);
      if (rec) { this.select(rec); return; }
    }

    this.deselect();
  },

  _updateOpenBtn: function (rec) {
    var btn = document.getElementById('fab-open');
    if (!btn) return;
    var hasAnim = false;
    if (rec && rec.mesh) {
      rec.mesh.traverse(function (o) {
        if (o.userData && o.userData.animType) hasAnim = true;
      });
    }
    btn.style.display = hasAnim ? 'flex' : 'none';
    if (hasAnim) {
      var key = rec.data.id || (rec.data.name + '_' + rec.mesh.position.x);
      btn.textContent = OpenClose.state[key] ? '🔒' : '🔓';
    }
  },

  select: function (rec) {
    this.current = rec;
    this._showOutline(rec.mesh);
    this._updateOpenBtn(rec);
    if (UI && UI.openProps) UI.openProps(rec);
  },

  deselect: function () {
    this.current = null;
    this._removeOutline();
    var btn = document.getElementById('fab-open');
    if (btn) btn.style.display = 'none';
    if (Panel && Panel.isOpen && UI && UI.closeProps) UI.closeProps();
  },

  refreshOutline: function () {
    if (this.current) this._showOutline(this.current.mesh);
  },

  _showOutline: function (mesh) {
    this._removeOutline();
    var box = new THREE.Box3().setFromObject(mesh);
    var helper = new THREE.Box3Helper(box, 0x00aaff);
    helper.name = 'selection-outline';
    Scene.scene.add(helper);
    this.outline = helper;
  },

  _removeOutline: function () {
    if (this.outline) {
      Scene.scene.remove(this.outline);
      this.outline = null;
    }
  }
};
