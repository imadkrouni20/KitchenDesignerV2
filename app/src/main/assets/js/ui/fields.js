// ============================================
// ui/fields.js — حقول النموذج
// ============================================
var Fields = {

  section: function (title, content, collapsed) {
    var cls = collapsed ? 'section collapsed' : 'section';
    return '<div class="' + cls + '">' +
      '<div class="section-title" data-toggle="1">' +
        '<span>' + title + '</span>' +
        '<span class="arrow">▼</span>' +
      '</div>' +
      '<div class="section-content">' + content + '</div>' +
    '</div>';
  },

  num: function (id, label, value, min, max, step) {
    return '<div class="field">' +
      '<label>' + label + '</label>' +
      '<input type="number" id="' + id + '" value="' + value + '"' +
      ' min="' + (min != null ? min : 0) + '"' +
      ' max="' + (max != null ? max : 999) + '"' +
      ' step="' + (step != null ? step : 0.5) + '">' +
    '</div>';
  },

  text: function (id, label, value) {
    return '<div class="field">' +
      '<label>' + label + '</label>' +
      '<input type="text" id="' + id + '" value="' + (value || '') + '">' +
    '</div>';
  },

  color: function (id, label, value) {
    return '<div class="field">' +
      '<label>' + label + '</label>' +
      '<input type="color" id="' + id + '" value="' + value + '">' +
    '</div>';
  },

  check: function (id, label, checked) {
    return '<div class="field">' +
      '<label style="display:flex;align-items:center;cursor:pointer">' +
        '<input type="checkbox" id="' + id + '"' + (checked ? ' checked' : '') + '>' +
        label +
      '</label>' +
    '</div>';
  },

  select: function (id, label, value, options) {
    var html = '<div class="field">' +
      '<label>' + label + '</label>' +
      '<select id="' + id + '">';
    for (var i = 0; i < options.length; i++) {
      var o = options[i];
      html += '<option value="' + o.id + '"' +
        (o.id === value ? ' selected' : '') + '>' + o.label + '</option>';
    }
    html += '</select></div>';
    return html;
  },

  // حقل مخصص (HTML خام)
  raw: function (html) { return html; }
};
