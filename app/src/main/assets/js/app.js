// ============================================
// app.js — نقطة البداية
// ============================================
function animate() {
  requestAnimationFrame(animate);
  var dt = Math.min(Scene.clock.getDelta(), 0.1);
  if (Scene.orbit) Scene.orbit.update();
  if (typeof OpenClose !== 'undefined') OpenClose.update(dt);
  Scene.render();
}

function initApp() {
  Scene.init();
  Room.init();
  Library.init();
  Objects.init();
  Selection.init();
  Drag.init();
  LibraryUI.init();
  UI.init();
  Fabs.init();
  Measure.init();
  History.init();

  animate();
  console.log('✅ Ready');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
