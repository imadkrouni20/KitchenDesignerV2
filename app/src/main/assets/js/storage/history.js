// ============================================
// storage/history.js — تراجع/إعادة (حتى 500)
// ============================================
var History = {
  MAX: 500,
  stack: [],
  pointer: -1,
  _suspended: false,

  init: function () {
    this.snapshot();   // حالة ابتدائية
  },

  // يلتقط الحالة الحالية
  snapshot: function () {
    if (this._suspended) return;

    var state = this._serialize();

    // إن كانت نفس الحالة السابقة، لا تُكرر
    if (this.pointer >= 0) {
      var prev = JSON.stringify(this.stack[this.pointer]);
      if (prev === JSON.stringify(state)) return;
    }

    // اقتطع المستقبل
    this.stack = this.stack.slice(0, this.pointer + 1);

    // أضف الحالة
    this.stack.push(state);

    // حدّ 500
    if (this.stack.length > this.MAX) {
      this.stack.shift();
    } else {
      this.pointer++;
    }
    this.pointer = this.stack.length - 1;
  },

  undo: function () {
    if (this.pointer <= 0) return false;
    this.pointer--;
    this._restore(this.stack[this.pointer]);
    return true;
  },

  redo: function () {
    if (this.pointer >= this.stack.length - 1) return false;
    this.pointer++;
    this._restore(this.stack[this.pointer]);
    return true;
  },

  canUndo: function () { return this.pointer > 0; },
  canRedo: function () { return this.pointer < this.stack.length - 1; },

  // ============ تسلسل ============
  _serialize: function () {
    var boxes = [];
    for (var i = 0; i < Objects.boxes.length; i++) {
      var d = JSON.parse(JSON.stringify(Objects.boxes[i].data));
      d.position = {
        x: Objects.boxes[i].mesh.position.x,
        y: Objects.boxes[i].mesh.position.y,
        z: Objects.boxes[i].mesh.position.z
      };
      boxes.push(d);
    }
    var devices = [];
    for (var j = 0; j < Objects.devices.length; j++) {
      var dd = JSON.parse(JSON.stringify(Objects.devices[j].data));
      dd.position = {
        x: Objects.devices[j].mesh.position.x,
        y: Objects.devices[j].mesh.position.y,
        z: Objects.devices[j].mesh.position.z
      };
      devices.push(dd);
    }
    var openings = [];
    for (var k = 0; k < Openings.items.length; k++) {
      openings.push(JSON.parse(JSON.stringify(Openings.items[k].data)));
    }
    return { boxes: boxes, devices: devices, openings: openings };
  },

  // ============ استرجاع ============
  _restore: function (state) {
    this._suspended = true;
    try {
      // امسح
      while (Objects.boxes.length) {
        var b = Objects.boxes.pop();
        if (b.mesh.parent) b.mesh.parent.remove(b.mesh);
      }
      while (Objects.devices.length) {
        var dv = Objects.devices.pop();
        if (dv.mesh.parent) dv.mesh.parent.remove(dv.mesh);
      }
      while (Openings.items.length) {
        var op = Openings.items.pop();
        if (op.mesh.parent) op.mesh.parent.remove(op.mesh);
      }

      // أعد بناء الأبواب
      for (var wallId in Room.walls) {
        if (Room.walls[wallId]) Room.rebuildWall(wallId, []);
      }

      // أعد الصناديق
      for (var i = 0; i < state.boxes.length; i++) {
        var data = state.boxes[i];
        var rec = Objects.addBox(data);
        if (data.position) {
          rec.mesh.position.set(data.position.x, data.position.y, data.position.z);
        }
      }

      // أعد الأجهزة
      for (var j = 0; j < state.devices.length; j++) {
        var dvData = state.devices[j];
        var dvRec = Objects.addDevice(dvData);
        if (dvData.position) {
          dvRec.mesh.position.set(dvData.position.x, dvData.position.y, dvData.position.z);
        }
      }

      // أعد الأبواب
      for (var k = 0; k < state.openings.length; k++) {
        Openings.add(state.openings[k]);
      }

      Selection.deselect();
    } finally {
      this._suspended = false;
    }
  },

  // استئناف بعد إجراء مهم (يُستدعى يدوياً)
  record: function () {
    this._suspended = false;
    this.snapshot();
  },

  clear: function () {
    this.stack = [];
    this.pointer = -1;
    this.snapshot();
  }
};
