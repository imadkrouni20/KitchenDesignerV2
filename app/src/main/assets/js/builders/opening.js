// ============================================
// builders/opening.js — بناء وإدارة الأبواب والنوافذ
// ============================================
var Openings = {
  items: [],   // { mesh, data }

  add: function (data) {
    var mesh = this._build(data);
    this._place(mesh, data);
    var rec = { mesh: mesh, data: data, kind: 'opening' };
    this.items.push(rec);
    this._rebuildWall(data.wall);
    return rec;
  },

  remove: function (rec) {
    var wall = rec.data.wall;
    if (rec.mesh.parent) rec.mesh.parent.remove(rec.mesh);
    var idx = this.items.indexOf(rec);
    if (idx >= 0) this.items.splice(idx, 1);
    this._rebuildWall(wall);
  },

  replace: function (rec, newData) {
    var oldWall = rec.data.wall;
    if (rec.mesh.parent) rec.mesh.parent.remove(rec.mesh);
    var mesh = this._build(newData);
    this._place(mesh, newData);
    rec.mesh = mesh;
    rec.data = newData;
    this._rebuildWall(oldWall);
    if (newData.wall !== oldWall) this._rebuildWall(newData.wall);
  },

  _rebuildWall: function (wallId) {
    var openings = [];
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].data.wall === wallId) openings.push(this.items[i].data);
    }
    Room.rebuildWall(wallId, openings);
  },

  _place: function (mesh, data) {
    var wall = Room.walls[data.wall];
    if (!wall) return;
    var off = -(data.offset || 0) / 100;
    var el = (data.elevation || 0) / 100;
    wall.group.add(mesh);
    mesh.position.set(off, el, 0);
  },

  _build: function (data) {
    var g = new THREE.Group();
    var W = BuildHelp.cm(data.width);
    var H = BuildHelp.cm(data.height);
    var T = BuildHelp.cm(data.thickness);
    var sideW = 0.04;

    var matFrame = new THREE.MeshStandardMaterial({
      color: data.frameColor, roughness: 0.4, metalness: 0.7
    });
    var matGlass = new THREE.MeshStandardMaterial({
      color: data.glassColor, roughness: 0.05, metalness: 0.1,
      transparent: true, opacity: data.glassOpacity, side: THREE.DoubleSide
    });

    g.add(BuildHelp.box(sideW, H, T, matFrame, -W/2 + sideW/2, H/2, 0));
    g.add(BuildHelp.box(sideW, H, T, matFrame,  W/2 - sideW/2, H/2, 0));
    g.add(BuildHelp.box(W - sideW*2, sideW, T, matFrame, 0, H - sideW/2, 0));
    g.add(BuildHelp.box(W - sideW*2, sideW, T, matFrame, 0, sideW/2, 0));

    var glass = new THREE.Mesh(
      new THREE.PlaneGeometry(W - sideW*2, H - sideW*2), matGlass
    );
    glass.position.set(0, H / 2, 0);
    g.add(glass);

    if (data.hasHandle && data.kind === 'door') {
      var h = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.12, 8),
        new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.9 })
      );
      h.rotation.z = Math.PI / 2;
      h.position.set(W/2 - sideW - 0.08, H * 0.5, T/2 + 0.02);
      g.add(h);
    }
    return g;
  },

  allMeshes: function () {
    var arr = [];
    for (var i = 0; i < this.items.length; i++) {
      this.items[i].mesh.traverse(function (o) { if (o.isMesh) arr.push(o); });
    }
    return arr;
  },

  findRecordByMesh: function (hitMesh) {
    for (var i = 0; i < this.items.length; i++) {
      var p = hitMesh;
      while (p) {
        if (p === this.items[i].mesh) return this.items[i];
        p = p.parent;
      }
    }
    return null;
  }
};
