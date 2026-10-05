// ============================================
// builders/box/countertop.js — الرخام + الحوض + الموقد
// ============================================
var BoxCountertop = {

  build: function (parent, data, dims, supportH) {
    if (!data.hasCountertop) return;

    var W = dims.W, H = dims.H, D = dims.D;
    var mtH = BuildHelp.cm(data.marbleThickness);
    var overF = BuildHelp.cm(data.marbleOverhangFront);
    var overS = BuildHelp.cm(data.marbleOverhangSides);

    var matMarble = Materials.marble(data.colorMarble);

    // اللوح
    var mW = W + overS * 2;
    var mD = D + overF;
    var marble = BuildHelp.box(mW, mtH, mD, matMarble,
      0, supportH + H + mtH / 2, overF / 2);
    parent.add(marble);

    var topY = supportH + H + mtH;

    // الحوض
    if (data.hasSink) this._buildSink(parent, data, topY);

    // الموقد
    if (data.hasStove) this._buildStove(parent, data, topY);
  },

  _buildSink: function (parent, data, topY) {
    var matSteel = new THREE.MeshStandardMaterial({
      color: 0xc8c8c8, roughness: 0.25, metalness: 0.9
    });
    var matSteelDark = new THREE.MeshStandardMaterial({
      color: 0x707070, roughness: 0.3, metalness: 0.8
    });

    var type = data.sinkType || 'single';
    var sw = BuildHelp.cm(data.sinkWidth);
    var sd = BuildHelp.cm(data.sinkDepth);
    var sx = BuildHelp.cm(data.sinkOffset);

    if (type === 'double') {
      var half = sw / 2 - 0.005;
      parent.add(BuildHelp.box(half, 0.015, sd, matSteel, sx - half / 2 - 0.003, topY - 0.005, 0));
      parent.add(BuildHelp.box(half, 0.015, sd, matSteel, sx + half / 2 + 0.003, topY - 0.005, 0));
      parent.add(BuildHelp.box(half - 0.02, 0.01, sd - 0.02, matSteelDark,
        sx - half / 2 - 0.003, topY - 0.013, 0));
      parent.add(BuildHelp.box(half - 0.02, 0.01, sd - 0.02, matSteelDark,
        sx + half / 2 + 0.003, topY - 0.013, 0));
    } else if (type === 'undermount') {
      // مغطس: حواف أرقى
      parent.add(BuildHelp.box(sw, 0.008, sd, matSteel, sx, topY - 0.006, 0));
      parent.add(BuildHelp.box(sw - 0.02, 0.008, sd - 0.02, matSteelDark, sx, topY - 0.014, 0));
    } else {
      parent.add(BuildHelp.box(sw, 0.015, sd, matSteel, sx, topY - 0.005, 0));
      parent.add(BuildHelp.box(sw - 0.02, 0.01, sd - 0.02, matSteelDark, sx, topY - 0.013, 0));
    }

    // صنبور
    this._buildFaucet(parent, sx, topY, sd, matSteel);
  },

  _buildFaucet: function (parent, sx, topY, sd, mat) {
    var back = -sd / 2 - 0.03;
    var base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.02, 12), mat
    );
    base.position.set(sx, topY + 0.01, back);
    base.castShadow = true;
    parent.add(base);

    var pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.20, 12), mat
    );
    pole.position.set(sx, topY + 0.10, back);
    pole.castShadow = true;
    parent.add(pole);

    var arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.15, 12), mat
    );
    arm.rotation.z = Math.PI / 2;
    arm.position.set(sx, topY + 0.18, back + 0.06);
    arm.castShadow = true;
    parent.add(arm);
  },

  _buildStove: function (parent, data, topY) {
    var sw = BuildHelp.cm(data.stoveWidth);
    var sd = BuildHelp.cm(data.stoveDepth);
    var sx = BuildHelp.cm(data.stoveOffset);

    var matBlack = new THREE.MeshStandardMaterial({
      color: 0x101010, roughness: 0.2, metalness: 0.4
    });

    // اللوح
    var panel = BuildHelp.box(sw, 0.008, sd, matBlack, sx, topY + 0.004, 0);
    parent.add(panel);

    var type = data.stoveType || 'gas';

    if (type === 'gas') {
      // 4 شعلات (حلقات معدنية)
      var matBurner = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a, roughness: 0.5, metalness: 0.5
      });
      var r = Math.min(sw, sd) * 0.15;
      var bx = sw * 0.25;
      var bz = sd * 0.25;
      var centers = [
        [sx - bx, -bz], [sx + bx, -bz],
        [sx - bx,  bz], [sx + bx,  bz]
      ];
      for (var i = 0; i < 4; i++) {
        var ring = new THREE.Mesh(
          new THREE.CylinderGeometry(r, r, 0.008, 16), matBurner
        );
        ring.position.set(centers[i][0], topY + 0.008, centers[i][1]);
        parent.add(ring);
      }
    } else if (type === 'induction') {
      // 4 دوائر بيضاء رمزية
      var matZone = new THREE.MeshStandardMaterial({
        color: 0x333333, roughness: 0.1, metalness: 0.3,
        emissive: 0x111111
      });
      var r2 = Math.min(sw, sd) * 0.13;
      var bx2 = sw * 0.25;
      var bz2 = sd * 0.25;
      var c2 = [
        [sx - bx2, -bz2], [sx + bx2, -bz2],
        [sx - bx2,  bz2], [sx + bx2,  bz2]
      ];
      for (var j = 0; j < 4; j++) {
        var ring2 = new THREE.Mesh(
          new THREE.RingGeometry(r2 * 0.6, r2, 24), matZone
        );
        ring2.rotation.x = -Math.PI / 2;
        ring2.position.set(c2[j][0], topY + 0.009, c2[j][1]);
        parent.add(ring2);
      }
    } else {
      // كهربائي: خطوط أفقية
      var matLine = new THREE.MeshStandardMaterial({
        color: 0x222222, roughness: 0.5, metalness: 0.4
      });
      for (var k = 0; k < 3; k++) {
        var line = BuildHelp.box(sw * 0.8, 0.004, 0.01, matLine,
          sx, topY + 0.009, (k - 1) * sd * 0.25);
        parent.add(line);
      }
    }
  }
};
