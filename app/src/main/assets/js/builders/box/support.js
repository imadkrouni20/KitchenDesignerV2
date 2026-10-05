// ============================================
// builders/box/support.js — أرجل + رخام أمامي + toe kick
// ============================================
var BoxSupport = {

  // يحسب ارتفاع الدعامة قبل البناء
  calcHeight: function (data) {
    if (data.supportType === 'legs')   return BuildHelp.cm(data.legHeight);
    if (data.supportType === 'marble') return BuildHelp.cm(data.frontMarbleHeight);
    return 0;
  },

  // يبني الأرجل أو الرخام الأمامي
  build: function (parent, data, dims, supportH) {
    var W = dims.W, D = dims.D, T = dims.T;

    if (data.supportType === 'legs' && supportH > 0) {
      this._buildLegs(parent, data, dims, supportH);
    } else if (data.supportType === 'marble' && supportH > 0) {
      this._buildFrontMarble(parent, data, dims, supportH);
    }

    // toe kick (قاعدة سفلية)
    if (data.hasToeKick) {
      this._buildToeKick(parent, data, dims);
    }
  },

  _buildLegs: function (parent, data, dims, supportH) {
    var W = dims.W, D = dims.D;
    var matMetal = Materials.metal(data.colorMetal);
    var isRound = (data.legType === 'round');
    var size = 0.04;
    var offX = W / 2 - 0.05;
    var offZ = D / 2 - 0.05;
    var positions = [
      [-offX, -offZ], [offX, -offZ],
      [-offX,  offZ], [offX,  offZ]
    ];

    for (var i = 0; i < positions.length; i++) {
      var leg;
      if (isRound) {
        leg = new THREE.Mesh(
          new THREE.CylinderGeometry(size / 2, size / 2, supportH, 12),
          matMetal
        );
      } else {
        leg = new THREE.Mesh(
          new THREE.BoxGeometry(size, supportH, size),
          matMetal
        );
      }
      leg.position.set(positions[i][0], supportH / 2, positions[i][1]);
      leg.castShadow = leg.receiveShadow = true;
      parent.add(leg);
    }
  },

  _buildFrontMarble: function (parent, data, dims, supportH) {
    var W = dims.W, D = dims.D;
    var matMarble = Materials.marble(data.colorMarble);
    var fmT = 0.02;

    // ✅ نطابق بروز الرخام العلوي على الجانبين
    var overS = BuildHelp.cm(data.marbleOverhangSides != null ? data.marbleOverhangSides : 1);
    var fmW = W + overS * 2;

    // ✅ نطابق بروز الأمامي مع العلوي
    var overF = BuildHelp.cm(data.marbleOverhangFront != null ? data.marbleOverhangFront : 2);
    var fmZ = D / 2 + overF - fmT / 2;

    var fm = BuildHelp.box(fmW, supportH, fmT, matMarble,
      0, supportH / 2, fmZ);
    parent.add(fm);
  },

  _buildToeKick: function (parent, data, dims) {
    var W = dims.W, D = dims.D;
    var mat = Materials.mdf(data.colorToeKick || data.colorMdf);
    var th = BuildHelp.cm(data.toeKickHeight || 10);
    var td = BuildHelp.cm(data.toeKickDepth || 5);

    // فقط الوجه الأمامي (يُثبَّت داخل الهيكل)
    var front = BuildHelp.box(W - 0.02, th, td, mat, 0, th / 2, D / 2 - td / 2);
    parent.add(front);
  }
};
