// Глобальні змінні
let scene, camera, renderer, controls, globe;
let countryMeshes = [];
let currentHighlightedCountry = null;
let isPaused = false;

// Ініціалізація сцени
function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);
  
  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 15;
  
  renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('globeCanvas'),
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // Освітлення
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);
  
  // Контроли
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 8;
  controls.maxDistance = 20;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  
  controls.addEventListener('start', () => {
    if(!isPaused) controls.autoRotate = false;
  });
  
  controls.addEventListener('end', () => {
    if(!isPaused) controls.autoRotate = true;
  });
  
  window.addEventListener('resize', onWindowResize);
}

// Створення глобуса
async function createGlobe() {
  const textureLoader = new THREE.TextureLoader();
  const material = new THREE.MeshPhongMaterial({
    map: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'),
    specularMap: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg'),
    bumpMap: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg'),
    bumpScale: 0.05,
    specular: new THREE.Color(0x222222),
    shininess: 15
  });
  
  const geometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
  globe = new THREE.Mesh(geometry, material);
  scene.add(globe);
}

// Обробка зміни розміру вікна
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Анімація
function animate() {
  requestAnimationFrame(animate);
  if(!isPaused) {
    controls.update();
  }
  renderer.render(scene, camera);
}