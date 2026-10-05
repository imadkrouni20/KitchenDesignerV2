// ============================================
// core/room.js — الأرضية + 3 حوائط + قطع الثقوب
// ============================================
var Room = {
  group: null,
  floor: null, ground: null,
  walls: {},

  init: function () {
    this.group = new THREE.Group();
    this.group.name = 'room';
    Scene.scene.add(this.group);

    var R = CONFIG.ROOM;
    var W = R.width, D = R.depth, T = R.wallThickness;

    // أرضية خارجية
    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0x6b8f5a, roughness: 1.0 })
    );
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = -0.02;
    this.ground.receiveShadow = true;
    this.group.add(this.ground);

    // أرضية الغرفة
    this.floor = new THREE.Mesh(
      new THREE.PlaneGeometry(W, D),
      new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.85 })
    );
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = 0.001;
    this.floor.receiveShadow = true;
    this.group.add(this.floor);

    // شبكة إرشادية
    var grid = new THREE.GridHelper(W, Math.round(W * 4), 0x999999, 0xcccccc);
    grid.position.y = 0.003;
    grid.scale.z = D / W;
    grid.material.opacity = 0.45;
    grid.material.transparent = true;
    this.group.add(grid);

    // الحوائط الثلاثة
    this._buildWall('back',  0, 0, -D / 2 - T / 2,  0);
    this._buildWall('left', -W / 2 - T / 2, 0, 0,  Math.PI / 2);
    this._buildWall('right', W / 2 + T / 2, 0, 0, -Math.PI / 2);
  },

  _buildWall: function (id, x, y, z, ry) {
    var group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = ry;

    var mesh = this._makeWallMesh(id, []);
    group.add(mesh);
    this.group.add(group);

    this.walls[id] = { group: group, mesh: mesh };
  },

  _makeWallMesh: function (wallId, openings) {
    var R = CONFIG.ROOM;
    var T = R.wallThickness;
    var W = (wallId === 'back') ? R.width : R.depth;
    var H = R.height;

    var shape = new THREE.Shape();
    shape.moveTo(-W/2, 0);
    shape.lineTo( W/2, 0);
    shape.lineTo( W/2, H);
    shape.lineTo(-W/2, H);
    shape.lineTo(-W/2, 0);

    for (var i = 0; i < openings.length; i++) {
      var op = openings[i];
      var oW = op.width / 100;
      var oH = op.height / 100;
      var oEl = (op.elevation || 0) / 100;
      var oX = -(op.offset || 0) / 100;

      var hole = new THREE.Path();
      hole.moveTo(oX - oW/2, oEl);
      hole.lineTo(oX + oW/2, oEl);
      hole.lineTo(oX + oW/2, oEl + oH);
      hole.lineTo(oX - oW/2, oEl + oH);
      hole.lineTo(oX - oW/2, oEl);
      shape.holes.push(hole);
    }

    var geo = new THREE.ExtrudeGeometry(shape, {
      depth: T, bevelEnabled: false, curveSegments: 4
    });
    geo.translate(0, 0, -T/2);

    var mat = new THREE.MeshStandardMaterial({
      color: 0xf5f0e6, roughness: 0.95, side: THREE.DoubleSide
    });

    var mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  },

  rebuildWall: function (wallId, openings) {
    var wall = this.walls[wallId];
    if (!wall) return;
    wall.group.remove(wall.mesh);
    if (wall.mesh.geometry) wall.mesh.geometry.dispose();
    var newMesh = this._makeWallMesh(wallId, openings);
    wall.group.add(newMesh);
    wall.mesh = newMesh;
  }
};
