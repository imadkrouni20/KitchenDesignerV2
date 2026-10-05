// ============================================
// core/config.js — كل الثوابت
// ============================================
var CONFIG = {

  // أبعاد الغرفة (متر)
  ROOM: { width: 5.0, depth: 3.0, height: 2.7, wallThickness: 0.10 },

  // فراغ الأبواب (4mm)
  DOOR_GAP: 0.004,

  // الفئات
  CATEGORIES: [
    { id: 'lower',   label: 'سفلي',  icon: '⬇️' },
    { id: 'upper',   label: 'علوي',  icon: '⬆️' },
    { id: 'tall',    label: 'طويل',  icon: '📏' },
    { id: 'drawers', label: 'أدراج', icon: '🗄️' },
    { id: 'custom',  label: 'مخصص',  icon: '⚙️' }
  ],

  // الحوائط
  WALLS: [
    { id: 'back',  label: 'خلفي' },
    { id: 'left',  label: 'أيسر' },
    { id: 'right', label: 'أيمن' }
  ],

  // أنواع المقابض
  HANDLE_TYPES: [
    { id: 'bar',   label: 'شريط أفقي' },
    { id: 'knob',  label: 'زر دائري' },
    { id: 'edge',  label: 'حافة' },
    { id: 'none',  label: 'بدون' }
  ],

  // أنواع الحوض
  SINK_TYPES: [
    { id: 'single',     label: 'مغسلة واحدة' },
    { id: 'double',     label: 'مغسلتان' },
    { id: 'undermount', label: 'مغطس' }
  ],

  // أنواع الموقد
  STOVE_TYPES: [
    { id: 'gas',       label: 'غاز' },
    { id: 'electric',  label: 'كهربائي' },
    { id: 'induction', label: 'حثّي' }
  ],

  // نوع الدعامة
  SUPPORT_TYPES: [
    { id: 'legs',   label: 'أرجل' },
    { id: 'marble', label: 'رخام أمامي' },
    { id: 'none',   label: 'معلّق' }
  ],

  // أنواع الرخام
  MARBLE_TYPES: [
    { id: 'granite', label: 'جرانيت' },
    { id: 'quartz',  label: 'كوارتز' },
    { id: 'marble',  label: 'رخام طبيعي' }
  ],

  // مواد الأبواب
  DOOR_MATERIALS: [
    { id: 'mdf',          label: 'MDF' },
    { id: 'glass',        label: 'زجاج كامل' },
    { id: 'glass-framed', label: 'زجاج بإطار MDF' }
  ],

  // وضع ملء الفراغ
  DRAWER_FILL: [
    { id: 'none',      label: 'فراغ' },
    { id: 'door',      label: 'باب MDF' },
    { id: 'glassDoor', label: 'باب زجاجي' },
    { id: 'shelves',   label: 'رفوف مفتوحة' }
  ],

  // الألوان الافتراضية
  DEFAULT_COLORS: {
    mdf:        '#c9a875',
    mdfInner:   '#e5d4b8',
    shelves:    '#c9a875',
    marble:     '#e8e5df',
    metal:      '#b8b8b8',
    handles:    '#3a3a3a',
    toeKick:    '#5a5a5a',
    glass:      '#bfe4f0',
    light:      '#ffd88a'
  }
};
