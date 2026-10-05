// ============================================
// model/defaults.js — القيم الافتراضية
// ============================================
var Defaults = {

  // صندوق جديد حسب الفئة
  box: function (category) {
    category = category || 'lower';
    var C = CONFIG.DEFAULT_COLORS;

    var base = {
      // هوية
      name: 'صندوق جديد',
      category: category,
      notes: '',

      // موضع في المشهد (null = يُرتَّب تلقائياً على الحائط)
      position: null,
      rotation: 0,
      locked: true,

      // أبعاد أساسية (سم)
      width: 60,
      height: 72,
      depth: 55,
      mdfThickness: 1.8,
      elevation: 0,

      // هيكل
      hasTop: true,
      hasBack: true,
      shelfCount: 1,
      glassShelves: false,

      // دعامة (أرجل/رخام/معلّق)
      supportType: 'legs',           // legs | marble | none
      legType: 'square',             // square | round
      legHeight: 10,
      frontMarbleHeight: 10,

      // رخام علوي
      hasCountertop: true,
      marbleType: 'granite',         // granite | quartz | marble
      marbleThickness: 3,
      marbleOverhangFront: 2,
      marbleOverhangSides: 1,

      // حوض
      hasSink: false,
      sinkType: 'single',            // single | double | undermount
      sinkWidth: 50,
      sinkDepth: 40,
      sinkOffset: 0,

      // موقد
      hasStove: false,
      stoveType: 'gas',              // gas | electric | induction
      stoveWidth: 60,
      stoveDepth: 50,
      stoveOffset: 0,

      // أدراج
      drawerCount: 0,
      drawerPosition: 'top',         // top | middle | bottom
      drawerHeight: 15,
      drawerSplitMode: 'stack',      // stack | split
      drawerFillMode: 'none',        // none | door | glassDoor | shelves
      fillDoorHeight: 0,
      fillDoorElevation: 0,

      // أبواب عادية
      doorCount: 1,
      doorDirection: 'right',        // right | left
      doorMaterial: 'mdf',           // mdf | glass | glass-framed
      glassDoorFrameThickness: 4,
      doorOpenAngle: 0,              // للعرض

      // طويل
      tallDoorCount: 3,
      tallDoorHeights: [60, 60, 60, 60],
      tallDoorElevations: [0, 60, 120, 180],

      hasOven: false,
      ovenWidth: 60, ovenHeight: 45, ovenDepth: 55, ovenElevation: 60,
      hasMicrowave: false,
      mwWidth: 50, mwHeight: 30, mwDepth: 35, mwElevation: 100,

      useCustomShelves: false,
      customShelfCount: 2,
      customShelfElevations: [60, 120, 180, 200, 210, 220],

      // مقابض
      handleType: 'bar',             // bar | knob | edge | none
      handleLength: 12,              // سم (للشريط)
      handleOffset: 4,               // بعد عن الحافة
      hasHandles: true,              // (توافق مع القديم)

      // قاعدة سفلية (toe kick)
      hasToeKick: false,
      toeKickHeight: 10,
      toeKickDepth: 5,

      // إضاءة (للعلوي)
      hasLightStrip: false,
      lightColor: '#ffd88a',

      // ألوان
      colorMdf: C.mdf,
      colorMdfInner: C.mdfInner,
      colorShelves: C.shelves,
      colorMarble: C.marble,
      colorMetal: C.metal,
      colorHandles: C.handles,
      colorToeKick: C.toeKick
    };

    // تعديلات حسب الفئة
    if (category === 'upper') {
      base.height = 60;
      base.depth = 35;
      base.supportType = 'none';
      base.hasCountertop = false;
      base.hasSink = false;
      base.hasStove = false;
      base.hasLegs = false;
      base.shelfCount = 2;
      base.elevation = 140;
      base.hasToeKick = false;
      base.hasLightStrip = true;
    } else if (category === 'tall') {
      base.height = 220;
      base.depth = 60;
      base.hasCountertop = false;
      base.hasSink = false;
      base.hasStove = false;
      base.shelfCount = 0;
      base.doorCount = 0;
      base.hasToeKick = true;
    } else if (category === 'drawers') {
      base.drawerCount = 3;
      base.drawerHeight = 20;
      base.doorCount = 0;
      base.shelfCount = 0;
      base.hasToeKick = true;
    } else if (category === 'lower') {
      base.hasToeKick = true;
    }

    return base;
  },

  // جهاز جديد
  device: function (type) {
    var def = null;
    for (var i = 0; i < DeviceCatalog.list.length; i++) {
      if (DeviceCatalog.list[i].id === type) { def = DeviceCatalog.list[i]; break; }
    }
    if (!def) def = DeviceCatalog.list[0];

    return {
      type: type || 'fridge',
      name: def.label.replace(/^[^\s]+\s/, ''),

      position: null,
      rotation: 0,
      locked: true,

      width: def.w,
      height: def.h,
      depth: def.d,
      elevation: 0,

      colorBody: '#e0e4e8',
      colorMetal: '#c0c0c0',
      colorGlass: '#88b8d0',

      // خصائص خاصة
      doorCount: 2,
      doorOpens: false,
      internalShelves: 3,
      hasFreezer: (type === 'fridge'),
      hasWindow: (type === 'microwave'),
      hasDisplay: (type === 'dishwasher'),
      power: 800,
      slots: 2,

      // رخام علوي (للغسالة)
      hasCountertop: (type === 'dishwasher'),
      marbleThickness: 3,
      marbleOverhangFront: 2,
      marbleOverhangSides: 1,
      colorMarble: '#e8e5df'
    };
  },

  // باب/نافذة جديدة
  opening: function (kind) {
    kind = kind || 'door';
    return {
      kind: kind,
      name: (kind === 'door') ? 'باب' : 'نافذة',
      wall: 'back',

      position: { x: 0, y: 0, z: 0 },
      rotation: 0,
      locked: false,

      width: (kind === 'door') ? 90 : 120,
      height: (kind === 'door') ? 210 : 120,
      thickness: 8,

      elevation: 0,
      offset: 0,

      frameColor: '#4a4a4a',
      glassColor: '#a8d0e0',
      glassOpacity: 0.35,
      hasHandle: true,
      doorOpenAngle: 0
    };
  }
};
