// ============================================
// builders/manager.js — إدارة + ترتيب تلقائي
// ============================================
var Objects = {
  boxes: [], devices: [],
  group: null,

  init: function () {
    this.group = new THREE.Group();
    this.group.name = 'objects';
    Scene.scene.add(this.group);

    this._boxGroup = new THREE.Group(); this._boxGroup.name = 'boxes';
    this._devGroup = new THREE.Group(); this._devGroup.name = 'devices';
    this.group.add(this._boxGroup);
    this.group.add(this._devGroup);
  },

  _isDefaultPos: function (pos) {
    if (!pos) return true;
    return (pos.x === 0 && pos.y === 0 && pos.z === 0);
  },

  // ============================================
  // الترتيب التلقائي — من الزاوية مع الالتصاق
  // ============================================
  _getAutoPlace: function (W, D) {
    var R = CONFIG.ROOM;
    var EPS = 0.05;
    var items = this.boxes.concat(this.devices);

    // ============================================
    // 1) الحائط الخلفي: زحف يسار → يمين
    // ============================================
    var maxRight = -R.width / 2;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var itW = BuildHelp.cm(it.data.width || 60);
      var itD = BuildHelp.cm(it.data.depth || 55);
      var ix = it.mesh.position.x;
      var iz = it.mesh.position.z;
      var ry = it.mesh.rotation.y;

      // غير مدوّر (على الحائط الخلفي)؟
      if (Math.abs(ry) < 0.1 && Math.abs(iz - (-R.depth / 2 + itD / 2)) < EPS) {
        var right = ix + itW / 2;
        if (right > maxRight) maxRight = right;
      }
    }

    if (maxRight + W <= R.width / 2 + 0.001) {
      return { x: maxRight + W / 2, z: -R.depth / 2 + D / 2, rotation: 0 };
    }

    // ============================================
    // 2) الحائط الأيسر: زحف خلف → أمام (دوران +90°)
    // ============================================
    var maxLeftZ = -R.depth / 2;
    for (var j = 0; j < items.length; j++) {
      var it2 = items[j];
      var it2W = BuildHelp.cm(it2.data.width || 60);
      var it2D = BuildHelp.cm(it2.data.depth || 55);
      var ix2 = it2.mesh.position.x;
      var iz2 = it2.mesh.position.z;
      var ry2 = it2.mesh.rotation.y;

      // مدوّر +90° (على الحائط الأيسر)؟
      if (Math.abs(ry2 - Math.PI / 2) < 0.1 &&
          Math.abs(ix2 - (-R.width / 2 + it2D / 2)) < EPS) {
        var front = iz2 + it2W / 2;
        if (front > maxLeftZ) maxLeftZ = front;
      }

      // عنصر على الحائط الخلفي في الزاوية اليسرى؟ احترم عمقه
      if (Math.abs(ry2) < 0.1 && Math.abs(iz2 - (-R.depth / 2 + it2D / 2)) < EPS) {
        if (ix2 - it2W / 2 < -R.width / 2 + 0.3) {
          var f2 = iz2 + it2D / 2;
          if (f2 > maxLeftZ) maxLeftZ = f2;
        }
      }
    }

    if (maxLeftZ + W <= R.depth / 2 + 0.001) {
      return {
        x: -R.width / 2 + D / 2,
        z: maxLeftZ + W / 2,
        rotation: Math.PI / 2
      };
    }

    // ============================================
    // 3) الحائط الأيمن: زحف خلف → أمام (دوران -90°)
    // ============================================
    var maxRightZ = -R.depth / 2;
    for (var k = 0; k < items.length; k++) {
      var it3 = items[k];
      var it3W = BuildHelp.cm(it3.data.width || 60);
      var it3D = BuildHelp.cm(it3.data.depth || 55);
      var ix3 = it3.mesh.position.x;
      var iz3 = it3.mesh.position.z;
      var ry3 = it3.mesh.rotation.y;

      if (Math.abs(ry3 + Math.PI / 2) < 0.1 &&
          Math.abs(ix3 - (R.width / 2 - it3D / 2)) < EPS) {
        var front3 = iz3 + it3W / 2;
        if (front3 > maxRightZ) maxRightZ = front3;
      }

      // corner من الحائط الخلفي على اليمين
      if (Math.abs(ry3) < 0.1 && Math.abs(iz3 - (-R.depth / 2 + it3D / 2)) < EPS) {
        if (ix3 + it3W / 2 > R.width / 2 - 0.3) {
          var f4 = iz3 + it3D / 2;
          if (f4 > maxRightZ) maxRightZ = f4;
        }
      }
    }

    if (maxRightZ + W <= R.depth / 2 + 0.001) {
      return {
        x: R.width / 2 - D / 2,
        z: maxRightZ + W / 2,
        rotation: -Math.PI / 2
      };
    }

    // ============================================
    // 4) ممتلئ
    // ============================================
    return null;
  },

  // ============================================
  // إضافة صندوق
  // ============================================
  addBox: function (data) {
    var W = BuildHelp.cm(data.width);
    var D = BuildHelp.cm(data.depth);

    if (this._isDefaultPos(data.position)) {
      var p = this._getAutoPlace(W, D);
      if (!p) {
        alert('⚠️ الغرفة ممتلئة — احذف أو حرّك عنصراً لإضافة آخر');
        return null;
      }
      data.position = {
        x: p.x,
        y: (data.elevation || 0) / 100,
        z: p.z
      };
      data.rotation = p.rotation || 0;
    }

    var mesh = buildBox(data);
    var pos = data.position || { x: 0, y: 0, z: 0 };
    mesh.position.set(
      pos.x || 0,
      (pos.y != null) ? pos.y : (data.elevation || 0) / 100,
      pos.z || 0
    );
    mesh.rotation.y = data.rotation || 0;

    this._boxGroup.add(mesh);
    var rec = { mesh: mesh, data: data, kind: 'box' };
    this.boxes.push(rec);
    return rec;
  },

  // ============================================
  // إضافة جهاز
  // ============================================
  addDevice: function (data) {
    var W = BuildHelp.cm(data.width);
    var D = BuildHelp.cm(data.depth);

    if (this._isDefaultPos(data.position)) {
      var p = this._getAutoPlace(W, D);
      if (!p) {
        alert('⚠️ الغرفة ممتلئة');
        return null;
      }
      data.position = {
        x: p.x,
        y: (data.elevation || 0) / 100,
        z: p.z
      };
      data.rotation = p.rotation || 0;
    }

    var mesh = buildDevice(data);
    var pos = data.position || { x: 0, y: 0, z: 0 };
    mesh.position.set(
      pos.x || 0,
      (pos.y != null) ? pos.y : (data.elevation || 0) / 100,
      pos.z || 0
    );
    mesh.rotation.y = data.rotation || 0;

    this._devGroup.add(mesh);
    var rec = { mesh: mesh, data: data, kind: 'device' };
    this.devices.push(rec);
    return rec;
  },

  // ============================================
  // استبدال (تعديل فوري)
  // ============================================
  replace: function (rec, newMesh, newData) {
    var parent = rec.mesh.parent;
    if (!parent) return;
    newMesh.position.copy(rec.mesh.position);
    newMesh.rotation.copy(rec.mesh.rotation);
    parent.remove(rec.mesh);
    parent.add(newMesh);
    rec.mesh = newMesh;
    rec.data = newData;
    if (!newData.position) newData.position = {};
    newData.position.x = newMesh.position.x;
    newData.position.y = newMesh.position.y;
    newData.position.z = newMesh.position.z;
    newData.rotation = newMesh.rotation.y;
  },

  // ============================================
  // حذف
  // ============================================
  remove: function (rec) {
    if (rec.mesh.parent) rec.mesh.parent.remove(rec.mesh);
    var arr = (rec.kind === 'box') ? this.boxes : this.devices;
    var idx = arr.indexOf(rec);
    if (idx >= 0) arr.splice(idx, 1);
  },

  allSelectableMeshes: function () {
    var arr = [];
    this._boxGroup.traverse(function (o) { if (o.isMesh) arr.push(o); });
    this._devGroup.traverse(function (o) { if (o.isMesh) arr.push(o); });
    return arr;
  },

  findRecordByMesh: function (hitMesh) {
    var p = hitMesh;
    while (p && p.parent !== this._boxGroup && p.parent !== this._devGroup) {
      p = p.parent;
    }
    if (!p) return null;
    for (var i = 0; i < this.boxes.length; i++) {
      if (this.boxes[i].mesh === p) return this.boxes[i];
    }
    for (var j = 0; j < this.devices.length; j++) {
      if (this.devices[j].mesh === p) return this.devices[j];
    }
    return null;
  }
};
