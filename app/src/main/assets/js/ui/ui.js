// ============================================
// ui/ui.js — ربط كل شيء
// ============================================
var UI = {
  _rec: null,
  _edit: null,
  _isNew: false,
  _timer: null,
  _fields: null,
  _handler: null,

  // ============ تهيئة ============
  init: function () {
    Panel.init();
    Panel.onOpenMenu = function () { UI.openMainMenu(); };
    Panel.onClose = function () { UI._unbind(); };

    Panel.body.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest && t.closest('.section-title')) {
        var sec = t.closest('.section-title').parentNode;
        sec.classList.toggle('collapsed');
        return;
      }
      UI._onClick(t);
    });
  },

  _onClick: function (t) {
    var id = t.id;
    if (id === 'menu-new')  { this.openBoxMaker(); return; }
    if (id === 'menu-lib')  { this.openLibrary(); return; }
    if (id === 'menu-dev')  { this.openDevices(); return; }
    if (id === 'menu-op')   { this.openOpenings(); return; }
    if (id === 'bf-save')   { this.saveNewBox(); return; }
    if (id === 'bf-copy')   { this.copyCurrent(); return; }
    if (id === 'bf-delete') { this.deleteCurrent(); return; }
    if (id === 'op-door')   { this.newOpening('door'); return; }
    if (id === 'op-window') { this.newOpening('window'); return; }
    if (id === 'of-save')   { this.saveOpening(); return; }
    if (id === 'dev-add')   { this.addDevice(t.getAttribute('data-dev')); return; }
    if (id === 'menu-cut')  { this.openCutlist(); return; }
    if (id === 'menu-save') { this.saveProject(); return; }
    if (id === 'menu-load') { this.loadProject(); return; }
    if (id === 'cut-export'){ this._exportCutlist(); return; }
    if (id === 'menu-clear'){ this.clearScene(); return; }
  },

  // ============ القائمة الرئيسية ============
  openMainMenu: function () {
    Panel.open('القائمة',
      '<button class="btn-primary" id="menu-new" style="margin-bottom:8px">➕ صندوق جديد</button>' +
      '<button class="btn-primary" id="menu-lib" style="background:#555;margin-bottom:8px">📚 المكتبة (' + Library.count() + ')</button>' +
      '<button class="btn-primary" id="menu-dev" style="background:#666;margin-bottom:8px">🔌 الأجهزة</button>' +
      '<button class="btn-primary" id="menu-op"  style="background:#777;margin-bottom:8px">🚪 أبواب ونوافذ</button>' +
      '<button class="btn-primary" id="menu-cut" style="background:#444;margin-bottom:8px">📋 قائمة القص</button>' +
      '<button class="btn-primary" id="menu-save" style="background:#444;margin-bottom:8px">💾 حفظ المشروع</button>' +
      '<button class="btn-primary" id="menu-load" style="background:#444;margin-bottom:8px">📂 تحميل المشروع</button>' +
      '<button class="btn-primary" id="menu-clear" style="background:#c0392b">🗑️ مسح المشهد</button>');
  },

  // ============ صندوق جديد ============
  openBoxMaker: function () {
    this._rec = null;
    this._isNew = true;
    this._edit = Defaults.box('lower');
    this._render();
  },

  _render: function () {
    var d = this._edit;
    var formHtml;
    if (this._isNew) {
      formHtml = FormBox.render(d, { buttons: '' });
      Panel.open('📦 صانع الصناديق',
        formHtml + '<button class="btn-primary" id="bf-save">💾 إضافة للمشهد</button>');
    } else {
      var btns =
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">' +
          '<button class="btn-primary" id="bf-copy" style="margin:0">📋 نسخ</button>' +
          '<button class="btn-primary" id="bf-delete" style="background:#c0392b;margin:0">🗑️ حذف</button>' +
        '</div>';
      formHtml = FormBox.render(d, { buttons: '' });
      Panel.open('⚙️ ' + d.name, btns + formHtml);
    }
    this._bind();
  },

  // ============ خصائص عنصر موجود ============
  openProps: function (rec) {
    this._rec = rec;
    this._isNew = false;
    this._edit = JSON.parse(JSON.stringify(rec.data));

    var btns =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">' +
        '<button class="btn-primary" id="bf-copy" style="margin:0">📋 نسخ</button>' +
        '<button class="btn-primary" id="bf-delete" style="background:#c0392b;margin:0">🗑️ حذف</button>' +
      '</div>';

    if (rec.kind === 'device') {
      Panel.open('⚙️ ' + this._edit.name, btns + FormDevice.render(this._edit, { buttons: '' }));
      this._bindDevice();
      return;
    }
    if (rec.kind === 'opening') {
      Panel.open('⚙️ ' + this._edit.name, btns + FormOpening.render(this._edit, { buttons: '' }));
      this._bindOpeningExisting();
      return;
    }
    this._render();
  },

  closeProps: function () {
    this._rec = null;
    this._edit = null;
    this._unbind();
  },

  // ============ ربط حقول الصندوق ============
  _bind: function () {
    var self = this;
    this._unbind();
    var fields = Panel.body.querySelectorAll('input, select, textarea');
    this._fields = fields;

    this._handler = function (e) {
      var id = e.target.id || '';
      var type = e.target.type;
      var val = e.target.value;
      if (type === 'number' && (val === '' || isNaN(parseFloat(val)))) return;
      clearTimeout(self._timer);

      var RERENDER = [
        'bf-category', 'bf-supportType',
        'bf-drawerCount', 'bf-drawerPosition', 'bf-drawerSplitMode', 'bf-drawerFillMode',
        'bf-tallDoorCount', 'bf-useCustomShelves', 'bf-customShelfCount',
        'bf-doorMaterial', 'bf-handleType',
        'bf-hasCountertop', 'bf-hasSink', 'bf-hasStove',
        'bf-hasOven', 'bf-hasMicrowave'
      ];

      if (RERENDER.indexOf(id) >= 0) {
        var delay = (type === 'number') ? 500 : 120;
        self._timer = setTimeout(function () { self._rerender(); }, delay);
        return;
      }
      self._timer = setTimeout(function () { self._apply(); }, 200);
    };

    for (var i = 0; i < fields.length; i++) {
      fields[i].addEventListener('input', this._handler);
      fields[i].addEventListener('change', this._handler);
    }
  },

  _unbind: function () {
    if (this._fields && this._handler) {
      for (var i = 0; i < this._fields.length; i++) {
        this._fields[i].removeEventListener('input', this._handler);
        this._fields[i].removeEventListener('change', this._handler);
      }
    }
    this._fields = null;
    this._handler = null;
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
  },

  _rerender: function () {
    this._readForm();
    this._render();
    if (this._rec) this._apply();
  },

  _apply: function () {
    try {
      if (!this._rec) return;
      var oldPos = this._rec.mesh.position.clone();
      this._readForm();
      var data = Schema.normalizeBox(this._edit);
      var newMesh = buildBox(data);

      // طبّق الموضع الجديد من الحقول (إن تغيّر)
      newMesh.position.copy(oldPos);
      newMesh.position.y = (data.elevation || 0) / 100;
      if (data.position) {
        newMesh.position.x = data.position.x || 0;
        newMesh.position.z = data.position.z || 0;
      }

      Objects.replace(this._rec, newMesh, data);
      Selection.current = this._rec;
      Selection.refreshOutline();
      Panel.title.textContent = '⚙️ ' + data.name;
    } catch (err) {
      alert('خطأ: ' + err.message);
      console.error(err);
    }
  },

  _readForm: function () {
    var d = this._edit;
    var g  = function (id) { var el = document.getElementById(id); return el ? el.value : null; };
    var gc = function (id) { var el = document.getElementById(id); return el ? el.checked : false; };
    var has = function (id) { return document.getElementById(id) !== null; };
    var n  = function (id) { var el = document.getElementById(id); return el ? parseFloat(el.value) : null; };
    var ni = function (id) { var el = document.getElementById(id); return el ? parseInt(el.value, 10) : null; };

    if (has('bf-name')) d.name = g('bf-name');
    if (has('bf-category')) d.category = g('bf-category');
    if (has('bf-elevation')) d.elevation = n('bf-elevation') || 0;
    if (has('bf-locked')) d.locked = gc('bf-locked');
    if (has('bf-pos-x')) {
      d.position = d.position || {};
      d.position.x = n('bf-pos-x') || 0;
      d.position.y = d.position.y || 0;
    }
    if (has('bf-pos-z')) {
      d.position = d.position || {};
      d.position.z = n('bf-pos-z') || 0;
    }
    if (has('bf-width')) d.width = n('bf-width');
    if (has('bf-height')) d.height = n('bf-height');
    if (has('bf-depth')) d.depth = n('bf-depth');
    if (has('bf-mdf')) d.mdfThickness = n('bf-mdf');
    if (has('bf-hasTop')) d.hasTop = gc('bf-hasTop');
    if (has('bf-hasBack')) d.hasBack = gc('bf-hasBack');
    if (has('bf-shelfCount')) d.shelfCount = ni('bf-shelfCount');
    if (has('bf-glassShelves')) d.glassShelves = gc('bf-glassShelves');

    if (has('bf-supportType')) d.supportType = g('bf-supportType');
    if (has('bf-legType')) d.legType = g('bf-legType');
    if (has('bf-legHeight')) d.legHeight = n('bf-legHeight');
    if (has('bf-frontMarbleHeight')) d.frontMarbleHeight = n('bf-frontMarbleHeight');

    if (has('bf-hasCountertop')) d.hasCountertop = gc('bf-hasCountertop');
    if (has('bf-marbleType')) d.marbleType = g('bf-marbleType');
    if (has('bf-marbleThickness')) d.marbleThickness = n('bf-marbleThickness');
    if (has('bf-marbleOverhangFront')) d.marbleOverhangFront = n('bf-marbleOverhangFront');
    if (has('bf-marbleOverhangSides')) d.marbleOverhangSides = n('bf-marbleOverhangSides');

    if (has('bf-hasSink')) d.hasSink = gc('bf-hasSink');
    if (has('bf-sinkType')) d.sinkType = g('bf-sinkType');
    if (has('bf-sinkWidth')) d.sinkWidth = n('bf-sinkWidth');
    if (has('bf-sinkDepth')) d.sinkDepth = n('bf-sinkDepth');
    if (has('bf-sinkOffset')) d.sinkOffset = n('bf-sinkOffset');

    if (has('bf-hasStove')) d.hasStove = gc('bf-hasStove');
    if (has('bf-stoveType')) d.stoveType = g('bf-stoveType');
    if (has('bf-stoveWidth')) d.stoveWidth = n('bf-stoveWidth');
    if (has('bf-stoveDepth')) d.stoveDepth = n('bf-stoveDepth');
    if (has('bf-stoveOffset')) d.stoveOffset = n('bf-stoveOffset');

    if (has('bf-drawerCount')) d.drawerCount = ni('bf-drawerCount');
    if (has('bf-drawerPosition')) d.drawerPosition = g('bf-drawerPosition');
    if (has('bf-drawerSplitMode')) d.drawerSplitMode = g('bf-drawerSplitMode');
    if (has('bf-drawerHeight')) d.drawerHeight = n('bf-drawerHeight');
    if (has('bf-drawerFillMode')) d.drawerFillMode = g('bf-drawerFillMode');
    if (has('bf-fillDoorHeight')) d.fillDoorHeight = n('bf-fillDoorHeight') || 0;
    if (has('bf-fillDoorElevation')) d.fillDoorElevation = n('bf-fillDoorElevation') || 0;

    if (has('bf-doorCount')) d.doorCount = ni('bf-doorCount');
    if (has('bf-doorDirection')) d.doorDirection = g('bf-doorDirection');
    if (has('bf-doorMaterial')) d.doorMaterial = g('bf-doorMaterial');
    if (has('bf-glassDoorFrameThickness')) d.glassDoorFrameThickness = n('bf-glassDoorFrameThickness');

    if (has('bf-tallDoorCount')) d.tallDoorCount = ni('bf-tallDoorCount') || 3;
    var oh = d.tallDoorHeights || [60,60,60,60];
    var oe = d.tallDoorElevations || [0,60,120,180];
    var nh = [], ne = [];
    for (var i = 0; i < 4; i++) {
      var eh = document.getElementById('bf-tallDoorHeight-' + i);
      var ee = document.getElementById('bf-tallDoorElev-' + i);
      nh[i] = eh ? parseFloat(eh.value) : (oh[i] != null ? oh[i] : 60);
      ne[i] = ee ? parseFloat(ee.value) : (oe[i] != null ? oe[i] : i*60);
    }
    d.tallDoorHeights = nh;
    d.tallDoorElevations = ne;

    if (has('bf-hasOven')) d.hasOven = gc('bf-hasOven');
    if (has('bf-ovenWidth')) d.ovenWidth = n('bf-ovenWidth');
    if (has('bf-ovenHeight')) d.ovenHeight = n('bf-ovenHeight');
    if (has('bf-ovenDepth')) d.ovenDepth = n('bf-ovenDepth');
    if (has('bf-ovenElevation')) d.ovenElevation = n('bf-ovenElevation') || 0;
    if (has('bf-hasMicrowave')) d.hasMicrowave = gc('bf-hasMicrowave');
    if (has('bf-mwWidth')) d.mwWidth = n('bf-mwWidth');
    if (has('bf-mwHeight')) d.mwHeight = n('bf-mwHeight');
    if (has('bf-mwDepth')) d.mwDepth = n('bf-mwDepth');
    if (has('bf-mwElevation')) d.mwElevation = n('bf-mwElevation') || 0;

    if (has('bf-useCustomShelves')) d.useCustomShelves = gc('bf-useCustomShelves');
    if (has('bf-customShelfCount')) d.customShelfCount = ni('bf-customShelfCount') || 0;
    var oc = d.customShelfElevations || [];
    var nc = [];
    for (var k = 0; k < 6; k++) {
      var ec = document.getElementById('bf-customShelfElev-' + k);
      nc[k] = ec ? parseFloat(ec.value) : (oc[k] != null ? oc[k] : (k+1)*60);
    }
    d.customShelfElevations = nc;

    if (has('bf-handleType')) d.handleType = g('bf-handleType');
    if (has('bf-handleLength')) d.handleLength = n('bf-handleLength');
    if (has('bf-handleOffset')) d.handleOffset = n('bf-handleOffset');

    if (has('bf-hasToeKick')) d.hasToeKick = gc('bf-hasToeKick');
    if (has('bf-toeKickHeight')) d.toeKickHeight = n('bf-toeKickHeight');
    if (has('bf-toeKickDepth')) d.toeKickDepth = n('bf-toeKickDepth');

    if (has('bf-colorMdf')) d.colorMdf = g('bf-colorMdf');
    if (has('bf-colorMdfInner')) d.colorMdfInner = g('bf-colorMdfInner');
    if (has('bf-colorShelves')) d.colorShelves = g('bf-colorShelves');
    if (has('bf-colorMarble')) d.colorMarble = g('bf-colorMarble');
    if (has('bf-colorMetal')) d.colorMetal = g('bf-colorMetal');
    if (has('bf-colorHandles')) d.colorHandles = g('bf-colorHandles');
    if (has('bf-colorToeKick')) d.colorToeKick = g('bf-colorToeKick');

    this._edit = d;
  },

  // ============ جهاز — تعديل فوري ============
  _bindDevice: function () {
    var self = this;
    this._unbind();
    var fields = Panel.body.querySelectorAll('input, select, textarea');
    this._fields = fields;
    this._handler = function (e) {
      var type = e.target.type;
      var val = e.target.value;
      if (type === 'number' && (val === '' || isNaN(parseFloat(val)))) return;
      clearTimeout(self._timer);
      self._timer = setTimeout(function () { self._applyDevice(); }, 200);
    };
    for (var i = 0; i < fields.length; i++) {
      fields[i].addEventListener('input', this._handler);
      fields[i].addEventListener('change', this._handler);
    }
  },

  _applyDevice: function () {
    var d = this._edit;
    var g  = function (id) { var el = document.getElementById(id); return el ? el.value : null; };
    var has = function (id) { return document.getElementById(id) !== null; };
    var n  = function (id) { var el = document.getElementById(id); return el ? parseFloat(el.value) : null; };
    if (has('df-name')) d.name = g('df-name');
    if (has('df-width')) d.width = n('df-width');
    if (has('df-height')) d.height = n('df-height');
    if (has('df-depth')) d.depth = n('df-depth');
    if (has('df-elevation')) d.elevation = n('df-elevation') || 0;
    if (has('df-colorBody')) d.colorBody = g('df-colorBody');
    if (has('df-colorMetal')) d.colorMetal = g('df-colorMetal');
    if (has('df-locked')) d.locked = (document.getElementById('df-locked').checked);
    if (has('df-hasCountertop')) d.hasCountertop = (document.getElementById('df-hasCountertop').checked);
    if (has('df-marbleThickness')) d.marbleThickness = n('df-marbleThickness');
    if (has('df-marbleOverhangFront')) d.marbleOverhangFront = n('df-marbleOverhangFront');
    if (has('df-marbleOverhangSides')) d.marbleOverhangSides = n('df-marbleOverhangSides');
    if (has('df-colorMarble')) d.colorMarble = g('df-colorMarble');

    var newMesh = buildDevice(d);
    Objects.replace(this._rec, newMesh, d);
    Selection.current = this._rec;
    Selection.refreshOutline();
  },

  // ============ باب/نافذة — تعديل فوري ============
  _bindOpeningExisting: function () {
    var self = this;
    this._unbind();
    var fields = Panel.body.querySelectorAll('input, select, textarea');
    this._fields = fields;
    this._handler = function (e) {
      var type = e.target.type;
      var val = e.target.value;
      if (type === 'number' && (val === '' || isNaN(parseFloat(val)))) return;
      clearTimeout(self._timer);
      self._timer = setTimeout(function () { self._applyOpening(); }, 200);
    };
    for (var i = 0; i < fields.length; i++) {
      fields[i].addEventListener('input', this._handler);
      fields[i].addEventListener('change', this._handler);
    }
  },

  _applyOpening: function () {
    var d = this._edit;
    var g  = function (id) { var el = document.getElementById(id); return el ? el.value : null; };
    var gc = function (id) { var el = document.getElementById(id); return el ? el.checked : false; };
    var has = function (id) { return document.getElementById(id) !== null; };
    var n  = function (id) { var el = document.getElementById(id); return el ? parseFloat(el.value) : null; };
    if (has('of-name')) d.name = g('of-name');
    if (has('of-wall')) d.wall = g('of-wall');
    if (has('of-width')) d.width = n('of-width');
    if (has('of-height')) d.height = n('of-height');
    if (has('of-thickness')) d.thickness = n('of-thickness');
    if (has('of-elevation')) d.elevation = n('of-elevation') || 0;
    if (has('of-offset')) d.offset = n('of-offset') || 0;
    if (has('of-frameColor')) d.frameColor = g('of-frameColor');
    if (has('of-glassColor')) d.glassColor = g('of-glassColor');
    if (has('of-glassOpacity')) d.glassOpacity = n('of-glassOpacity');
    if (has('of-hasHandle')) d.hasHandle = gc('of-hasHandle');

    Openings.replace(this._rec, JSON.parse(JSON.stringify(d)));
    Selection.current = this._rec;
    Selection.refreshOutline();
  },

  // ============ أزرار ============
  saveNewBox: function () {
    this._readForm();
    var data = Schema.normalizeBox(this._edit);
    var rec = Objects.addBox(data);
    if (!rec) return;
    Library.add(data);
    Panel.close();
    Selection.select(rec);
    History.record();
  },

  copyCurrent: function () {
    if (!this._rec) return;
    var data = JSON.parse(JSON.stringify(this._rec.data));
    data.name += ' (نسخة)';
    var rec;
    if (this._rec.kind === 'device') {
      data.position = null;
      rec = Objects.addDevice(data);
    } else if (this._rec.kind === 'opening') {
      data.offset = (data.offset || 0) + 80;
      rec = Openings.add(data);
    } else {
      data.position = null;
      rec = Objects.addBox(data);
    }
    if (!rec) return;
    Panel.close();
    Selection.select(rec);
    History.record();
  },

  deleteCurrent: function () {
    if (!this._rec) return;
    if (!confirm('حذف العنصر؟')) return;
    if (this._rec.kind === 'opening') Openings.remove(this._rec);
    else Objects.remove(this._rec);
    Panel.close();
    Selection.deselect();
    History.record();
  },

  // ============ مسح المشهد ============
  clearScene: function () {
    if (!confirm('مسح كل العناصر من المشهد؟')) return;
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
    Selection.deselect();
    Panel.close();
    History.record();
    alert('✅ تم المسح');
  },

  // ============ قائمة القص ============
  openCutlist: function () {
    this._unbind();
    Panel.open('📋 قائمة القص', Cutlist.renderHTML());
  },

  _exportCutlist: function () {
    var txt = Cutlist.exportText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () {
        alert('✅ تم نسخ القائمة');
      });
    } else {
      // fallback
      var ta = document.createElement('textarea');
      ta.value = txt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      alert('✅ تم نسخ القائمة');
    }
  },

  // ============ حفظ/تحميل ============
  saveProject: function () {
    if (SaveLoad.saveLocal()) {
      alert('✅ تم حفظ المشروع محلياً\n\nيمكنك تصديره كملف JSON من زر 📷 أو مشاركته.');
    }
  },

  loadProject: function () {
    if (confirm('تحميل المشروع المحفوظ؟ سيُستبدل المشهد الحالي.')) {
      if (SaveLoad.loadLocal()) {
        alert('✅ تم التحميل');
      } else {
        alert('⚠️ لا يوجد مشروع محفوظ');
      }
    }
  },

  // ============ الأجهزة ============
  openDevices: function () {
    var html = '<div style="font-size:12px;color:#9aa3ad;margin-bottom:10px">اختر جهازاً</div>';
    for (var i = 0; i < DeviceCatalog.list.length; i++) {
      var d = DeviceCatalog.list[i];
      html += '<button data-dev="' + d.id + '" id="dev-add" ' +
        'style="background:#2c323a;color:#eaeaea;text-align:right;padding:12px;' +
        'margin-bottom:6px;display:block;width:100%;border:1px solid #3a4148;' +
        'border-radius:8px;font-size:14px;cursor:pointer">' +
        d.label + ' <span style="float:left;color:#9aa3ad;font-size:11px">' +
        d.w + '×' + d.h + '×' + d.d + '</span></button>';
    }
    Panel.open('🔌 الأجهزة', html);
  },

  addDevice: function (type) {
    try {
      var data = Defaults.device(type);
      var rec = Objects.addDevice(data);
      if (!rec) return;
      Panel.close();
      Selection.select(rec);
      History.record();
    } catch (err) {
      alert('خطأ في إضافة الجهاز: ' + err.message);
      console.error(err);
    }
  },

  // ============ الأبواب والنوافذ ============
  openOpenings: function () {
    Panel.open('🚪 أبواب ونوافذ',
      '<div style="font-size:12px;color:#9aa3ad;margin-bottom:10px">اختر النوع</div>' +
      '<button class="btn-primary" id="op-door" style="background:#2c323a;margin-bottom:8px">🚪 باب</button>' +
      '<button class="btn-primary" id="op-window" style="background:#2c323a">🪟 نافذة</button>');
  },

  newOpening: function (kind) {
    this._rec = null;
    this._isNew = true;
    this._edit = Defaults.opening(kind);
    var html = FormOpening.render(this._edit, { buttons: '' });
    Panel.open(kind === 'door' ? '🚪 باب جديد' : '🪟 نافذة جديدة',
      html + '<button class="btn-primary" id="of-save">💾 إضافة</button>');
    this._bindOpeningNew();
  },

  _bindOpeningNew: function () {
    var self = this;
    this._unbind();
    var fields = Panel.body.querySelectorAll('input, select, textarea');
    this._fields = fields;
    this._handler = function (e) {
      var id = e.target.id || '';
      var type = e.target.type;
      var val = e.target.value;
      if (type === 'number' && (val === '' || isNaN(parseFloat(val)))) return;
      clearTimeout(self._timer);
      self._timer = setTimeout(function () {
        self._readOpeningForm();
        if (id === 'of-wall' || id === 'of-hasHandle') self._renderOpeningForm();
      }, 200);
    };
    for (var i = 0; i < fields.length; i++) {
      fields[i].addEventListener('input', this._handler);
      fields[i].addEventListener('change', this._handler);
    }
  },

  _renderOpeningForm: function () {
    var html = FormOpening.render(this._edit, { buttons: '' });
    Panel.open(this._edit.kind === 'door' ? '🚪 باب جديد' : '🪟 نافذة جديدة',
      html + '<button class="btn-primary" id="of-save">💾 إضافة</button>');
    this._bindOpeningNew();
  },

  _readOpeningForm: function () {
    var d = this._edit;
    var g  = function (id) { var el = document.getElementById(id); return el ? el.value : null; };
    var gc = function (id) { var el = document.getElementById(id); return el ? el.checked : false; };
    var has = function (id) { return document.getElementById(id) !== null; };
    var n  = function (id) { var el = document.getElementById(id); return el ? parseFloat(el.value) : null; };
    if (has('of-name')) d.name = g('of-name');
    if (has('of-wall')) d.wall = g('of-wall');
    if (has('of-width')) d.width = n('of-width');
    if (has('of-height')) d.height = n('of-height');
    if (has('of-thickness')) d.thickness = n('of-thickness');
    if (has('of-elevation')) d.elevation = n('of-elevation') || 0;
    if (has('of-offset')) d.offset = n('of-offset') || 0;
    if (has('of-frameColor')) d.frameColor = g('of-frameColor');
    if (has('of-glassColor')) d.glassColor = g('of-glassColor');
    if (has('of-glassOpacity')) d.glassOpacity = n('of-glassOpacity');
    if (has('of-hasHandle')) d.hasHandle = gc('of-hasHandle');
    this._edit = d;
  },

  saveOpening: function () {
    this._readOpeningForm();
    var data = JSON.parse(JSON.stringify(this._edit));
    Openings.add(data);
    Panel.close();
    History.record();
  },

  // ============ المكتبة ============
  openLibrary: function () {
    this._unbind();
    Panel.open('📚 المكتبة', '<div id="lib-list"></div>');
    LibraryUI.render('lib-list');
  }
};
