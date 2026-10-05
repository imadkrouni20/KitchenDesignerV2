// ============================================
// core/materials.js — مخزن المواد (cache)
// ============================================
var Materials = {
  _cache: {},

  mdf: function (color) {
    return this._get('mdf_' + color, function () {
      return new THREE.MeshStandardMaterial({
        color: color, roughness: 0.75, metalness: 0.0
      });
    });
  },

  metal: function (color) {
    return this._get('metal_' + color, function () {
      return new THREE.MeshStandardMaterial({
        color: color, roughness: 0.3, metalness: 0.85
      });
    });
  },

  marble: function (color) {
    return this._get('marble_' + color, function () {
      return new THREE.MeshStandardMaterial({
        color: color, roughness: 0.2, metalness: 0.1
      });
    });
  },

  glass: function (tint) {
    tint = tint || 0xbfe4f0;
    return this._get('glass_' + tint, function () {
      return new THREE.MeshStandardMaterial({
        color: tint, roughness: 0.05, metalness: 0.1,
        transparent: true, opacity: 0.35,
        side: THREE.DoubleSide
      });
    });
  },

  applianceBody: function () {
    return this._get('appliance_body', function () {
      return new THREE.MeshStandardMaterial({
        color: 0x1a1a1a, roughness: 0.5, metalness: 0.5
      });
    });
  },

  applianceGlass: function () {
    return this._get('appliance_glass', function () {
      return new THREE.MeshStandardMaterial({
        color: 0x0a0e14, roughness: 0.05, metalness: 0.4,
        emissive: 0x0a0c10, emissiveIntensity: 0.3
      });
    });
  },

  clearCache: function () { this._cache = {}; },

  _get: function (key, factory) {
    if (!this._cache[key]) this._cache[key] = factory();
    return this._cache[key];
  }
};
