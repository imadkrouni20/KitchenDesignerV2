// ============================================
// builders/box/parts.js — الأجزاء الهيكلية
// ============================================
var BoxParts = {

  // يبني الأجزاء الأساسية ويعيد:
  // { group, supportH, dims: {W,H,D,T} }
  build: function (data, opts) {
    opts = opts || {};
    var g = new THREE.Group();

    var W = BuildHelp.cm(data.width);
    var H = BuildHelp.cm(data.height);
    var D = BuildHelp.cm(data.depth);
    var T = BuildHelp.cm(data.mdfThickness);

    // ارتفاع الدعامة (يُحسب مسبقاً)
    var supportH = opts.supportH || 0;

    var matMdf = Materials.mdf(data.colorMdf);

    // ----- القاع -----
    g.add(BuildHelp.box(W, T, D, matMdf, 0, supportH + T / 2, 0));

    // ----- الجانبان -----
    var sideGeoY = supportH + H / 2;
    g.add(BuildHelp.box(T, H, D, matMdf, -W / 2 + T / 2, sideGeoY, 0));
    g.add(BuildHelp.box(T, H, D, matMdf,  W / 2 - T / 2, sideGeoY, 0));

    // ----- العلوي -----
    if (data.hasTop) {
      g.add(BuildHelp.box(W, T, D, matMdf, 0, supportH + H - T / 2, 0));
    }

    // ----- الظهر -----
    if (data.hasBack) {
      var backMat = Materials.mdf(data.colorMdfInner);
      g.add(BuildHelp.box(W, H, T, backMat, 0, supportH + H / 2, -D / 2 + T / 2));
    }

    // ----- الرفوف (shelfCount) -----
    var sc = data.shelfCount || 0;
    if (sc > 0) {
      var shelfMat = data.glassShelves ? Materials.glass() : Materials.mdf(data.colorShelves);
      var usable = H - T * 2;
      for (var i = 0; i < sc; i++) {
        var y = supportH + T + usable * ((i + 1) / (sc + 1));
        g.add(BuildHelp.box(W - T * 2, T, D - T, shelfMat, 0, y, 0));
      }
    }

    return {
      group: g,
      dims: { W: W, H: H, D: D, T: T },
      supportH: supportH,
      matMdf: matMdf
    };
  }
};
