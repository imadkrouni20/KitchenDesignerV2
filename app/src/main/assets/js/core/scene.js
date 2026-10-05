// ============================================
// core/scene.js — المشهد + الكاميرا + الإضاءة
// ============================================
var Scene = {
  scene: null, camera: null, renderer: null,
  orbit: null, clock: null, sun: null,

  init: function () {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x9fc4e8);
    this.scene.fog = new THREE.Fog(0x9fc4e8, 18, 45);

    var aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.05, 200);
    this.camera.position.set(3.5, 2.5, 4.0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('c'),
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this._initLights();
    this._initOrbit();

    this.clock = new THREE.Clock();
    window.addEventListener('resize', this._onResize.bind(this), false);
  },

  _initLights: function () {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8b7355, 0.40));

    var sun = new THREE.DirectionalLight(0xfff4e0, 0.9);
    sun.position.set(8, 14, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.left = -10;
    sun.shadow.camera.right = 10;
    sun.shadow.camera.top = 10;
    sun.shadow.camera.bottom = -10;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 40;
    sun.shadow.bias = -0.0005;
    this.scene.add(sun);
    this.sun = sun;
  },

  _initOrbit: function () {
    this.orbit = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.orbit.target.set(0, 0.9, 0);
    this.orbit.enableDamping = true;
    this.orbit.dampingFactor = 0.08;
    this.orbit.minDistance = 0.15;
    this.orbit.maxDistance = 10.0;
    this.orbit.maxPolarAngle = Math.PI / 2 - 0.05;
    this.orbit.minPolarAngle = 0.20;
    this.orbit.update();
  },

  _onResize: function () {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  },

  render: function () {
    this.renderer.render(this.scene, this.camera);
  }
};
