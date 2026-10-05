// ============================================
// builders/device.js — بناء الأجهزة
// ============================================
function buildDevice(data) {
  var g = new THREE.Group();
  g.name = data.name || 'device';

  var W = BuildHelp.cm(data.width);
  var H = BuildHelp.cm(data.height);
  var D = BuildHelp.cm(data.depth);

  var matBody = new THREE.MeshStandardMaterial({
    color: data.colorBody, roughness: 0.35, metalness: 0.35
  });
  var matMetal = new THREE.MeshStandardMaterial({
    color: data.colorMetal, roughness: 0.25, metalness: 0.85
  });
  var matGlass = new THREE.MeshStandardMaterial({
    color: data.colorGlass || 0x88b8d0,
    roughness: 0.05, metalness: 0.1,
    transparent: true, opacity: 0.55, side: THREE.DoubleSide
  });

  var type = data.type;
  if      (type === 'fridge')     buildDevice._fridge(g, data, W, H, D, matBody, matMetal, matGlass);
  else if (type === 'microwave')  buildDevice._microwave(g, data, W, H, D, matBody, matMetal, matGlass);
  else if (type === 'dishwasher') buildDevice._dishwasher(g, data, W, H, D, matBody, matMetal, matGlass);
  else if (type === 'hood')       buildDevice._hood(g, data, W, H, D, matBody, matMetal, matGlass);
  else if (type === 'coffee')     buildDevice._coffee(g, data, W, H, D, matBody, matMetal, matGlass);
  else if (type === 'toaster')    buildDevice._toaster(g, data, W, H, D, matBody, matMetal, matGlass);
  else g.add(BuildHelp.box(W, H, D, matBody, 0, H / 2, 0));

  g.userData = { type: 'device', data: data };
  return g;
}

// — ثلاجة
buildDevice._fridge = function (g, data, W, H, D, matBody, matMetal, matGlass) {
  var t = 0.025;
  g.add(BuildHelp.box(W, H, D, matBody, 0, H / 2, 0));

  var splitH = data.hasFreezer ? H * 0.6 : H;
  if (data.hasFreezer) {
    g.add(BuildHelp.box(W + 0.001, 0.015, D + 0.001, matMetal, 0, splitH, 0));
  }

  var doorT = 0.03;
  var doorZ = D / 2 + doorT / 2;

  if (data.doorCount === 2 && data.hasFreezer) {
    var fH = H - splitH - 0.005;
    var fY = splitH + fH / 2 + 0.003;
    g.add(BuildHelp.box(W / 2 - 0.005, fH, doorT, matBody, -W / 4 + 0.002, fY, doorZ));
    g.add(BuildHelp.box(W / 2 - 0.005, fH, doorT, matBody,  W / 4 - 0.002, fY, doorZ));

    var hGeo = new THREE.CylinderGeometry(0.012, 0.012, fH * 0.5, 10);
    var hL = new THREE.Mesh(hGeo, matMetal);
    hL.position.set(-0.03, fY, doorZ + 0.03);
    g.add(hL);
    var hR = new THREE.Mesh(hGeo.clone(), matMetal);
    hR.position.set(0.03, fY, doorZ + 0.03);
    g.add(hR);

    var bH = splitH - 0.008;
    var bY = bH / 2 + 0.004;
    g.add(BuildHelp.box(W - 0.005, bH, doorT, matBody, 0, bY, doorZ));
    g.add(BuildHelp.box(W * 0.4, 0.02, 0.02, matMetal, 0, bH * 0.75, doorZ + 0.025));
  } else {
    g.add(BuildHelp.box(W - 0.005, H - 0.01, doorT, matBody, 0, H / 2, doorZ));
    var h = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, H * 0.4, 10), matMetal);
    h.position.set(W / 2 - 0.05, H / 2, doorZ + 0.03);
    g.add(h);
  }

  // أرفف داخلية
  if (data.internalShelves > 0) {
    var topH = data.hasFreezer ? H * 0.6 : H;
    var step = topH / (data.internalShelves + 1);
    for (var i = 1; i <= data.internalShelves; i++) {
      g.add(BuildHelp.box(W - t * 4, 0.008, D - t * 2, matGlass, 0, i * step, -t));
    }
  }
};

// — ميكروويف
buildDevice._microwave = function (g, data, W, H, D, matBody, matMetal, matGlass) {
  g.add(BuildHelp.box(W, H, D, matBody, 0, H / 2, 0));

  var winW = W * 0.65;
  var winH = H * 0.65;
  var win = new THREE.Mesh(
    new THREE.PlaneGeometry(winW, winH),
    new THREE.MeshStandardMaterial({
      color: 0x101418, roughness: 0.05, metalness: 0.2,
      emissive: 0x0a0c10, emissiveIntensity: 0.4
    })
  );
  win.position.set(-W / 2 + winW / 2 + 0.04, H / 2, D / 2 + 0.001);
  g.add(win);

  var frame = BuildHelp.box(winW + 0.02, winH + 0.02, 0.005, matMetal,
    -W / 2 + winW / 2 + 0.04, H / 2, D / 2 - 0.002);
  g.add(frame);

  var panelW = W - winW - 0.06;
  g.add(BuildHelp.box(panelW, H * 0.8, 0.008, matMetal,
    W / 2 - panelW / 2 - 0.03, H / 2, D / 2 + 0.002));

  var scr = new THREE.Mesh(
    new THREE.PlaneGeometry(panelW * 0.7, H * 0.15),
    new THREE.MeshBasicMaterial({ color: 0x2a4a2a })
  );
  scr.position.set(W / 2 - panelW / 2 - 0.03, H * 0.75, D / 2 + 0.007);
  g.add(scr);
};

// — غسالة أطباق
buildDevice._dishwasher = function (g, data, W, H, D, matBody, matMetal, matGlass) {
  g.add(BuildHelp.box(W, H, D * 0.9, matMetal, 0, H / 2, -D * 0.05));
  g.add(BuildHelp.box(W - 0.005, H - 0.005, 0.03, matBody, 0, H / 2, D / 2 - 0.015));

  var handle = BuildHelp.box(W * 0.7, 0.025, 0.03, matMetal, 0, H - 0.08, D / 2 + 0.005);
  g.add(handle);

  if (data.hasDisplay) {
    var disp = new THREE.Mesh(
      new THREE.PlaneGeometry(0.06, 0.02),
      new THREE.MeshBasicMaterial({ color: 0x1a3a1a })
    );
    disp.position.set(-W / 2 + 0.05, H - 0.06, D / 2 + 0.001);
    g.add(disp);
  }

  // رخام علوي (اختياري)
  if (data.hasCountertop) {
    var mT = BuildHelp.cm(data.marbleThickness || 3);
    var oF = BuildHelp.cm(data.marbleOverhangFront || 2);
    var oS = BuildHelp.cm(data.marbleOverhangSides || 1);
    var marbleMat = new THREE.MeshStandardMaterial({
      color: data.colorMarble || 0xe8e5df,
      roughness: 0.2, metalness: 0.1
    });
    var mW = W + oS * 2;
    var mD = D + oF;
    var marble = new THREE.Mesh(
      new THREE.BoxGeometry(mW, mT, mD), marbleMat
    );
    marble.position.set(0, H + mT / 2, oF / 2);
    marble.castShadow = marble.receiveShadow = true;
    g.add(marble);
  }
};

// — شفاط
buildDevice._hood = function (g, data, W, H, D, matBody, matMetal, matGlass) {
  var baseH = H * 0.15;
  g.add(BuildHelp.box(W, baseH, D, matMetal, 0, baseH / 2, 0));

  var chimW = W * 0.35;
  var chimH = H - baseH;
  g.add(BuildHelp.box(chimW, chimH, D * 0.5, matBody,
    0, baseH + chimH / 2, -D * 0.2));

  var grille = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 0.85, D * 0.7),
    new THREE.MeshStandardMaterial({ color: 0x202020, roughness: 0.9 })
  );
  grille.rotation.x = Math.PI / 2;
  grille.position.set(0, -0.001, 0);
  g.add(grille);
};

// — ماكينة قهوة
buildDevice._coffee = function (g, data, W, H, D, matBody, matMetal, matGlass) {
  g.add(BuildHelp.box(W, H * 0.75, D, matBody, 0, H * 0.625, 0));
  g.add(BuildHelp.box(W, H * 0.05, D, matMetal, 0, H * 0.025, 0));
  g.add(BuildHelp.box(W * 0.7, H * 0.20, D * 0.7,
    new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.9 }),
    0, H * 0.15, 0));
  g.add(BuildHelp.box(W * 0.85, H * 0.55, 0.005, matMetal, 0, H * 0.62, D / 2 + 0.003));

  var led = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 0.5, H * 0.08),
    new THREE.MeshBasicMaterial({ color: 0x33ff88 })
  );
  led.position.set(0, H * 0.72, D / 2 + 0.007);
  g.add(led);

  if (data.hasTank) {
    g.add(BuildHelp.box(W * 0.25, H * 0.55, D * 0.85, matGlass, -W * 0.42, H * 0.55, 0));
  }
};

// — محمصة
buildDevice._toaster = function (g, data, W, H, D, matBody, matMetal, matGlass) {
  g.add(BuildHelp.box(W, H, D, matBody, 0, H / 2, 0));

  var slots = data.slots || 2;
  var slotW = (W * 0.8) / slots * 0.7;
  var gap = (W * 0.8) / slots;
  var startX = -W * 0.4 + gap / 2;
  for (var i = 0; i < slots; i++) {
    g.add(BuildHelp.box(slotW, 0.01, D * 0.7,
      new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 1.0 }),
      startX + i * gap, H + 0.001, 0));
  }
  g.add(BuildHelp.box(0.008, 0.04, 0.03, matMetal, W / 2 + 0.005, H * 0.6, 0));
};
