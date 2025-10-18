// Three.js Interactive 3D Model Setup
let scene, camera, renderer, model, mixer, clock;
let mousePos = { x: 0, y: 0 };
let targetRotation = { x: 0, y: 0 };
let currentRotation = { x: 0, y: 0 };

function initThreeJS() {
  const container = document.getElementById('three-container');
  if (!container) return;

  // Scene setup
  scene = new THREE.Scene();

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;
  camera.position.y = 0;

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
  directionalLight2.position.set(0, 1, -1);
  scene.add(directionalLight2);

  // Clock for animations
  clock = new THREE.Clock();

  // Load the GLB model
  const loader = new THREE.GLTFLoader();
  loader.load(
    './assets/images/Blue_Eyed_Pup_Head_1018194002_texture.glb',
    function (gltf) {
      model = gltf.scene;

      // Center and scale the model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Scale model to fit view
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2.5 / maxDim;
      model.scale.set(scale, scale, scale);

      // Center the model
      model.position.x = -center.x * scale;
      model.position.y = -center.y * scale;
      model.position.z = -center.z * scale;

      scene.add(model);

      // Setup animation mixer if animations exist
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });
      }
    },
    undefined,
    function (error) {
      console.error('Error loading GLB model:', error);
    }
  );

  // Mouse move tracking
  container.addEventListener('mousemove', onMouseMove);
  container.addEventListener('touchmove', onTouchMove, { passive: true });

  // Handle window resize
  window.addEventListener('resize', onWindowResize);

  // Start animation loop
  animate();
}

function onMouseMove(event) {
  const container = document.getElementById('three-container');
  const rect = container.getBoundingClientRect();

  // Normalize mouse position to -1 to 1 range
  mousePos.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mousePos.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Convert to rotation angles (in radians)
  targetRotation.y = mousePos.x * 0.5; // Horizontal rotation
  targetRotation.x = mousePos.y * 0.3; // Vertical rotation
}

function onTouchMove(event) {
  if (event.touches.length > 0) {
    const container = document.getElementById('three-container');
    const rect = container.getBoundingClientRect();
    const touch = event.touches[0];

    mousePos.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    mousePos.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

    targetRotation.y = mousePos.x * 0.5;
    targetRotation.x = mousePos.y * 0.3;
  }
}

function onWindowResize() {
  const container = document.getElementById('three-container');
  if (!container) return;

  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
  requestAnimationFrame(animate);

  if (model) {
    // Smooth lerp towards target rotation
    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.05;
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.05;

    // Apply rotation to model
    model.rotation.y = currentRotation.y;
    model.rotation.x = currentRotation.x;

    // Add subtle floating animation
    model.position.y += Math.sin(Date.now() * 0.001) * 0.001;
  }

  // Update animation mixer
  if (mixer) {
    mixer.update(clock.getDelta());
  }

  renderer.render(scene, camera);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThreeJS);
} else {
  initThreeJS();
}
