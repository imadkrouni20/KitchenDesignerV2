// ============================================
// storage/save.js — حفظ/تحميل JSON
// ============================================
var SaveLoad = {
  KEY: 'kd_project_v3',

  // يحفظ المشروع كامل في localStorage
  saveLocal: function () {
    try {
      var data = this.serialize();
      localStorage.setItem(this.KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      alert('فشل الحفظ: ' + e.message);
      return false;
    }
  },

  // يحمّل من localStorage
  loadLocal: function () {
    try {
      var raw = localStorage.getItem(this.KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      this.deserialize(data);
      return true;
    } catch (e) {
      alert('فشل التحميل: ' + e.message);
      return false;
    }
  },

  // يُرجع JSON
  serialize: function () {
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
    return {
      version: 3,
      timestamp: Date.now(),
      boxes: boxes,
      devices: devices,
      openings: openings
    };
  },

  deserialize: function (data) {
    if (!data || data.version !== 3) {
      alert('ملف غير متوافق — متوقع نسخة 3');
      return;
    }

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
    for (var wallId in Room.walls) {
      if (Room.walls[wallId]) Room.rebuildWall(wallId, []);
    }

    // أعد
    for (var i = 0; i < data.boxes.length; i++) {
      var rec = Objects.addBox(data.boxes[i]);
      var p = data.boxes[i].position;
      if (p) rec.mesh.position.set(p.x, p.y, p.z);
    }
    for (var j = 0; j < data.devices.length; j++) {
      var dvRec = Objects.addDevice(data.devices[j]);
      var pd = data.devices[j].position;
      if (pd) dvRec.mesh.position.set(pd.x, pd.y, pd.z);
    }
    for (var k = 0; k < data.openings.length; k++) {
      Openings.add(data.openings[k]);
    }

    Selection.deselect();
    History.record();
  },

  // ============ ملف ============
  exportFile: function () {
    var data = this.serialize();
    var json = JSON.stringify(data, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'kitchen_' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  },

  importFile: function () {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    var self = this;
    input.onchange = function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (evt) {
        try {
          var data = JSON.parse(evt.target.result);
          self.deserialize(data);
        } catch (err) {
          alert('ملف غير صالح: ' + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
};
