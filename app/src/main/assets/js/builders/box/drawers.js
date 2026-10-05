// ============================================
// builders/box/drawers.js — أدراج كاملة (5 أوجه)
// ============================================
var BoxDrawers = {

  build: function (parent, data, dims, supportH) {
    var dc = data.drawerCount || 0;
    if (dc === 0) return;

    var W = dims.W, H = dims.H, D = dims.D, T = dims.T;
    var GAP = CONFIG.DOOR_GAP;
    var drH = BuildHelp.cm(data.drawerHeight || 15);
    var drT = 0.02;
    var pos = data.drawerPosition || 'top';
    var positions = [];
    var remaining = [];

    if (dc === 1) {
      if (pos === 'top') {
        positions.push({ y: supportH + H - drH, h: drH });
        remaining.push({ y: supportH, h: H - drH });
      } else if (pos === 'middle') {
        var midY = supportH + (H - drH) / 2;
        positions.push({ y: midY, h: drH });
        var aboveH = supportH + H - (midY + drH);
        if (aboveH > 0.01) remaining.push({ y: midY + drH, h: aboveH });
        var belowH = midY - supportH;
        if (belowH > 0.01) remaining.push({ y: supportH, h: belowH });
      } else {
        positions.push({ y: supportH, h: drH });
        remaining.push({ y: supportH + drH, h: H - drH });
      }
    } else if (dc === 2 && data.drawerSplitMode === 'split') {
      var halfH = H / 2;
      positions.push({ y: supportH + halfH, h: halfH });
      positions.push({ y: supportH, h: halfH });
    } else {
      var topY = supportH + H;
      for (var di = 0; di < dc; di++) {
        topY -= drH;
        positions.push({ y: topY, h: drH });
      }
      if (topY > supportH + 0.01) {
        remaining.push({ y: supportH, h: topY - supportH });
      }
    }

    // ===== ارسم كل درج =====
    var matMdf = Materials.mdf(data.colorMdf);
    var matInner = Materials.mdf(data.colorMdfInner || data.colorMdf);
    var matHandles = Materials.metal(data.colorHandles);

    for (var i = 0; i < positions.length; i++) {
      var dp = positions[i];
      this._buildDrawer(parent, data, W, D, T, drT, GAP,
        dp.y + dp.h / 2, dp.h, matMdf, matInner, matHandles);
    }

    // ===== املأ الفراغ =====
    this._fillRemaining(parent, data, dims, supportH, remaining);
  },

  // ====== درج واحد كامل ======
  _buildDrawer: function (parent, data, W, D, T, drT, GAP,
                          yCenter, h, matMdf, matInner, matHandles) {

    var drGroup = new THREE.Group();
    drGroup.position.set(0, yCenter, D / 2 + drT / 2);
    drGroup.userData.animType = 'drawer';
    drGroup.userData.closedZ = drGroup.position.z;
    drGroup.userData.openZ   = drGroup.position.z + 0.30;
    drGroup.userData.targetZ = drGroup.position.z;

    // ----- الواجهة الأمامية -----
    var frontW = W - GAP;
    var frontH = h - GAP;
    var front = BuildHelp.box(frontW, frontH, drT, matMdf, 0, 0, 0);
    drGroup.add(front);

    // ----- جسم الدرج (5 أوجه) -----
    var bodyW = frontW - 0.03;    // أضيق قليلاً من الواجهة
    var bodyH = frontH - 0.02;
    var bodyD = D - T - 0.05;     // عمق الدرج داخل الصندوق
    var sideH = bodyH * 0.65;
    var t2 = 0.012;               // سمك ألواح الدرج الداخلية

    var zFront = -drT / 2 - 0.005;
    var zBack  = zFront - bodyD;
    var zMid   = (zFront + zBack) / 2;
    var yBot   = -bodyH / 2 + t2 / 2;

    // القاع
    var bottom = BuildHelp.box(bodyW - t2 * 2, t2, bodyD, matInner,
      0, yBot, zMid);
    drGroup.add(bottom);

    // الجانب الأيسر
    var left = BuildHelp.box(t2, sideH, bodyD, matInner,
      -bodyW / 2 + t2 / 2, -bodyH / 2 + sideH / 2, zMid);
    drGroup.add(left);

    // الجانب الأيمن
    var right = BuildHelp.box(t2, sideH, bodyD, matInner,
      bodyW / 2 - t2 / 2, -bodyH / 2 + sideH / 2, zMid);
    drGroup.add(right);

    // الظهر
    var back = BuildHelp.box(bodyW - t2 * 2, sideH, t2, matInner,
      0, -bodyH / 2 + sideH / 2, zBack + t2 / 2);
    drGroup.add(back);

    // ----- المقبض على الواجهة -----
    if (data.hasHandles && data.handleType !== 'none') {
      var hl = BuildHelp.cm(data.handleLength || 12);
      var bar = BuildHelp.box(hl, 0.015, 0.015, matHandles,
        0, 0, drT / 2 + 0.02);
      drGroup.add(bar);
    }

    parent.add(drGroup);
  },

  // ====== املأ الفراغ ======
  _fillRemaining: function (parent, data, dims, supportH, remaining) {
    var mode = data.drawerFillMode || 'none';
    if (mode === 'none' || remaining.length === 0) return;

    var W = dims.W, D = dims.D, T = dims.T;
    var GAP = CONFIG.DOOR_GAP;
    var drT = 0.02;
    var matMdf = Materials.mdf(data.colorMdf);
    var matShelves = Materials.mdf(data.colorShelves);
    var matHandles = Materials.metal(data.colorHandles);

    for (var i = 0; i < remaining.length; i++) {
      var rp = remaining[i];
      var fillH = rp.h;
      if (data.fillDoorHeight > 0) {
        fillH = Math.min(BuildHelp.cm(data.fillDoorHeight), rp.h);
      }

      var fillY = rp.y + fillH / 2;
      if (data.fillDoorElevation > 0) {
        fillY = supportH + BuildHelp.cm(data.fillDoorElevation) + fillH / 2;
      }

      if (mode === 'door' || mode === 'glassDoor') {
        if (mode === 'glassDoor' && data.doorMaterial === 'glass-framed') {
          var grp = BoxDoors._makeGlassFramedDoor(data, W - GAP, fillH - GAP, drT);
          grp.position.set(0, fillY, D / 2 + drT / 2);
          parent.add(grp);
        } else {
          var mat = (mode === 'glassDoor') ? Materials.glass() : matMdf;
          var door = BuildHelp.box(W - GAP, fillH - GAP, drT, mat,
            0, fillY, D / 2 + drT / 2);
          parent.add(door);
        }

        if (data.hasHandles && data.handleType !== 'none') {
          var hl = BuildHelp.cm(data.handleLength || 12);
          var bar = BuildHelp.box(hl, 0.015, 0.015, matHandles,
            0, fillY, D / 2 + drT + 0.02);
          parent.add(bar);
        }
      } else if (mode === 'shelves') {
        var shelfCount = Math.max(1, Math.floor(fillH / 0.30));
        var step = fillH / (shelfCount + 1);
        for (var si = 1; si <= shelfCount; si++) {
          parent.add(BuildHelp.box(W - T * 2, T, D - T, matShelves,
            0, rp.y + si * step, 0));
        }
      }
    }
  }
};
