// ============================================
// builders/box/doors.js — أبواب بمقابض داخلية
// ============================================
var BoxDoors = {

  build: function (parent, data, dims, supportH) {
    var W = dims.W, H = dims.H, D = dims.D;
    var GAP = CONFIG.DOOR_GAP;

    if (data.category === 'tall') {
      this._buildTall(parent, data, dims, supportH);
      return;
    }

    var dc = data.doorCount || 0;
    if (dc === 0) return;

    var doorH = H - GAP;
    var doorT = 0.02;
    var doorZ = D / 2 + doorT / 2;
    var doorY = supportH + H / 2;

    if (dc === 1) {
      var hinge = (data.doorDirection === 'right') ? 1 : -1;
      var pivotX = hinge * (W / 2 - 0.01);
      this._single(parent, data, W - GAP, doorH, doorT, pivotX, doorY, doorZ, hinge);
    } else if (dc === 2) {
      var doorW = W / 2 - GAP / 2;
      this._single(parent, data, doorW, doorH, doorT, -W / 2 + 0.01, doorY, doorZ, -1);
      this._single(parent, data, doorW, doorH, doorT,  W / 2 - 0.01, doorY, doorZ,  1);
    }
  },

  // ====== باب واحد ======
  _single: function (parent, data, w, h, t, pivotX, y, z, hingeSign) {
    var pivot = new THREE.Group();
    pivot.position.set(pivotX, y, z);
    pivot.userData.animType = 'door';
    pivot.userData.hingeSign = hingeSign;
    pivot.userData.targetAngle = 0;
    pivot.rotation.y = 0;

    var meshOffset = -hingeSign * w / 2;

    // === اللوح ===
    if (data.doorMaterial === 'glass-framed') {
      var grp = this._makeGlassFramedDoor(data, w, h, t);
      grp.position.x = meshOffset;
      pivot.add(grp);
    } else {
      var mat = (data.doorMaterial === 'glass')
        ? Materials.glass()
        : Materials.mdf(data.colorMdf);
      var door = BuildHelp.box(w, h, t, mat, meshOffset, 0, 0);
      pivot.add(door);
    }

    // === المقبض داخل الباب (يتحرك معه) ===
    if (data.hasHandles && data.handleType !== 'none') {
      var offset = BuildHelp.cm(data.handleOffset || 4);
      // الحافة الحرة = الطرف البعيد عن المفصلة
      // في الإحداثيات المحلية للـ pivot: من -w (يسار) إلى +w/2... 
      // الحافة الحرة تقع عند meshOffset + (-hingeSign) * w/2
      var freeEdgeX = meshOffset * 2;   // = -hingeSign * w
      var handleX = freeEdgeX + hingeSign * offset;
      var handleZ = t / 2 + 0.02;
      this._mkHandle(pivot, data, handleX, 0, handleZ);
    }

    parent.add(pivot);
  },

  _makeGlassFramedDoor: function (data, w, h, t) {
    var grp = new THREE.Group();
    var fT = BuildHelp.cm(data.glassDoorFrameThickness || 4);
    var matMdf = Materials.mdf(data.colorMdf);
    var matGlass = Materials.glass();

    grp.add(BuildHelp.box(w, fT, t, matMdf, 0, (h - fT) / 2, 0));
    grp.add(BuildHelp.box(w, fT, t, matMdf, 0, -(h - fT) / 2, 0));
    grp.add(BuildHelp.box(fT, h - fT * 2, t, matMdf, -(w - fT) / 2, 0, 0));
    grp.add(BuildHelp.box(fT, h - fT * 2, t, matMdf, (w - fT) / 2, 0, 0));

    var glassInner = new THREE.Mesh(
      new THREE.BoxGeometry(w - fT * 2, h - fT * 2, t * 0.6), matGlass
    );
    grp.add(glassInner);
    return grp;
  },

  // ====== أبواب طويل ======
  _buildTall: function (parent, data, dims, supportH) {
    var W = dims.W, D = dims.D;
    var GAP = CONFIG.DOOR_GAP;
    var doorT = 0.02;
    var doorZ = D / 2 + doorT / 2;

    var count = data.tallDoorCount || 1;
    var heights = data.tallDoorHeights || [60, 60, 60, 60];
    var elevs   = data.tallDoorElevations || [0, 60, 120, 180];

    for (var i = 0; i < count; i++) {
      var h = BuildHelp.cm(heights[i] != null ? heights[i] : 60) - GAP;
      var el = BuildHelp.cm(elevs[i] != null ? elevs[i] : i * 60);
      var y = supportH + el + h / 2;
      var hingeSign = (i % 2 === 0) ? -1 : 1;
      var pivotX = hingeSign * (W / 2 - 0.01);

      this._single(parent, data, W - GAP, h, doorT, pivotX, y, doorZ, hingeSign);
    }
  },

  // ====== المقبض ======
  _mkHandle: function (parent, data, x, y, z) {
    var mat = Materials.metal(data.colorHandles);
    var type = data.handleType || 'bar';

    if (type === 'knob') {
      var knob = new THREE.Mesh(
        new THREE.SphereGeometry(0.015, 12, 10), mat
      );
      knob.position.set(x, y, z);
      knob.castShadow = true;
      parent.add(knob);
    } else if (type === 'edge') {
      var len = BuildHelp.cm(data.handleLength || 12);
      var edge = BuildHelp.box(0.012, len, 0.01, mat, x, y, z);
      parent.add(edge);
    } else {
      var len2 = BuildHelp.cm(data.handleLength || 12);
      var cyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, len2, 10), mat
      );
      cyl.position.set(x, y, z);
      cyl.castShadow = true;
      parent.add(cyl);
    }
  },

  // ====== لا تُستخدم بعد الآن — نُبقي للتوافق ======
  buildHandles: function () {}
};
