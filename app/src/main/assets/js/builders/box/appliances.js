// ============================================
// builders/box/appliances.js — فرن + ميكروويف مدمج
// ============================================
var BoxAppliances = {

  build: function (parent, data, dims, supportH) {
    if (data.category !== 'tall') return;
    if (!data.hasOven && !data.hasMicrowave) return;

    var W = dims.W, D = dims.D, T = dims.T;
    var matMetal = Materials.metal(data.colorMetal);
    var matApp = Materials.applianceBody();
    var matGlass = Materials.applianceGlass();

    if (data.hasOven) {
      this._buildOven(parent, data, W, D, T, supportH, matApp, matGlass, matMetal);
    }
    if (data.hasMicrowave) {
      this._buildMicrowave(parent, data, W, D, T, supportH, matApp, matGlass, matMetal);
    }

    // رفوف تلقائية حول الأجهزة
    this._buildAutoShelves(parent, data, dims, supportH);
  },

  _buildOven: function (parent, data, W, D, T, supportH, matApp, matGlass, matMetal) {
    var aW = BuildHelp.cm(data.ovenWidth || 60);
    var aH = BuildHelp.cm(data.ovenHeight || 45);
    var aD = Math.min(BuildHelp.cm(data.ovenDepth || 55), D - T);
    var aEl = BuildHelp.cm(data.ovenElevation || 60);

    // الجسم
    var body = BuildHelp.box(aW, aH, aD, matApp,
      0, supportH + aEl + aH / 2, D / 2 - aD / 2 + 0.005);
    parent.add(body);

    // نافذة
    var win = new THREE.Mesh(
      new THREE.PlaneGeometry(aW * 0.82, aH * 0.62), matGlass
    );
    win.position.set(0, supportH + aEl + aH * 0.42, D / 2 + 0.012);
    parent.add(win);

    // مقبض أفقي
    var h = BuildHelp.box(aW * 0.9, 0.02, 0.03, matMetal,
      0, supportH + aEl + aH - 0.05, D / 2 + 0.025);
    parent.add(h);
  },

  _buildMicrowave: function (parent, data, W, D, T, supportH, matApp, matGlass, matMetal) {
    var aW = BuildHelp.cm(data.mwWidth || 50);
    var aH = BuildHelp.cm(data.mwHeight || 30);
    var aD = Math.min(BuildHelp.cm(data.mwDepth || 35), D - T);
    var aEl = BuildHelp.cm(data.mwElevation || 100);

    var body = BuildHelp.box(aW, aH, aD, matApp,
      0, supportH + aEl + aH / 2, D / 2 - aD / 2 + 0.005);
    parent.add(body);

    // نافذة يسار + لوحة يمين
    var win = new THREE.Mesh(
      new THREE.PlaneGeometry(aW * 0.55, aH * 0.6), matGlass
    );
    win.position.set(-aW * 0.15, supportH + aEl + aH / 2, D / 2 + 0.012);
    parent.add(win);

    var panel = new THREE.Mesh(
      new THREE.PlaneGeometry(aW * 0.25, aH * 0.7), matMetal
    );
    panel.position.set(aW * 0.32, supportH + aEl + aH / 2, D / 2 + 0.012);
    parent.add(panel);
  },

  _buildAutoShelves: function (parent, data, dims, supportH) {
    var W = dims.W, D = dims.D, T = dims.T;
    var matShelves = Materials.mdf(data.colorShelves);
    var ys = [];

    if (data.hasOven) {
      var ovEl = BuildHelp.cm(data.ovenElevation || 60);
      var ovH  = BuildHelp.cm(data.ovenHeight || 45);
      ys.push(supportH + ovEl);
      ys.push(supportH + ovEl + ovH);
    }
    if (data.hasMicrowave) {
      var mwEl = BuildHelp.cm(data.mwElevation || 100);
      var mwH  = BuildHelp.cm(data.mwHeight || 30);
      ys.push(supportH + mwEl);
      ys.push(supportH + mwEl + mwH);
    }

    // دمج المتقاربة
    var uniq = [];
    for (var i = 0; i < ys.length; i++) {
      var dup = false;
      for (var j = 0; j < uniq.length; j++) {
        if (Math.abs(uniq[j] - ys[i]) < 0.005) { dup = true; break; }
      }
      if (!dup) uniq.push(ys[i]);
    }

    for (var k = 0; k < uniq.length; k++) {
      parent.add(BuildHelp.box(W - T * 2, T, D - T, matShelves, 0, uniq[k], 0));
    }
  },

  // رفوف مخصصة (مستقلة عن الأجهزة)
  buildCustomShelves: function (parent, data, dims, supportH) {
    if (!data.useCustomShelves) return;

    var W = dims.W, D = dims.D, T = dims.T;
    var matShelves = Materials.mdf(data.colorShelves);
    var count = data.customShelfCount || 0;
    var elevs = data.customShelfElevations || [];

    for (var i = 0; i < count; i++) {
      var el = BuildHelp.cm(elevs[i] != null ? elevs[i] : (i + 1) * 60);
      parent.add(BuildHelp.box(W - T * 2, T, D - T, matShelves,
        0, supportH + el, 0));
    }
  }
};
