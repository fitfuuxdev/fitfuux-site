import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const canvas = document.getElementById('wolf-canvas');
const stage = document.getElementById('wolf-stage');
if (canvas && stage) init();

function init() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 720px)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false
    });
  } catch (error) {
    stage.classList.add('is-fallback');
    return;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.35 : 1.7));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.1, 9.4);
  camera.lookAt(0, 0, 0);

  const root = new THREE.Group();
  root.rotation.order = 'YXZ';
  scene.add(root);

  const pivot = new THREE.Group();
  root.add(pivot);

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x090807);
  const panelGeo = new THREE.PlaneGeometry(1, 1);
  const panel = (color, position, scale, rotation) => {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color[0], color[1], color[2]),
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(panelGeo, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    mesh.rotation.set(...rotation);
    envScene.add(mesh);
  };
  panel([5.2, 3.1, 1.5], [-4.4, 1.9, 1.4], [1.4, 7.2, 1], [0, Math.PI / 2, 0]);
  panel([1.5, 1.9, 2.4], [4.6, 0.4, 2.2], [1, 6.6, 1], [0, -Math.PI / 2, 0]);
  panel([2.6, 1.9, 1.2], [0.4, 5.6, -0.8], [6.5, 1.4, 1], [Math.PI / 2, 0, 0]);
  panel([0.5, 0.36, 0.22], [0, -4.8, 0], [6, 5, 1], [-Math.PI / 2, 0, 0]);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(envScene, 0.02, 0.1, 100);
  scene.environment = envRT.texture;
  envScene.traverse((object) => {
    if (object.isMesh) {
      object.geometry.dispose();
      object.material.dispose();
    }
  });
  pmrem.dispose();

  const key = new THREE.DirectionalLight(0xffd7b0, 3.4);
  key.position.set(-4.5, 4.5, -4.2);
  scene.add(key);

  const rim = new THREE.PointLight(0xd8b07a, 58, 18, 2);
  rim.position.set(4.2, 2.8, -3.2);
  scene.add(rim);

  const warm = new THREE.PointLight(0xc08a58, 6, 12, 2);
  warm.position.set(2.4, -1.2, 3.4);
  scene.add(warm);

  scene.add(new THREE.HemisphereLight(0xffe4c4, 0x171310, 0.38));

  const dustCount = isMobile ? 24 : 52;
  const positions = new Float32Array(dustCount * 3);
  let seed = 11;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < dustCount; i += 1) {
    const radius = 1.8 + rand() * 2.4;
    const angle = rand() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (rand() - 0.5) * 4.8;
    positions[i * 3 + 2] = Math.sin(angle) * radius * 0.55 - 0.4;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xd9b98c,
    size: 0.016,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    sizeAttenuation: true
  }));
  root.add(dust);

  let model = null;
  let ready = false;
  let visible = true;
  let targetScroll = 0;
  let scrollEase = 0;
  let autoYaw = -0.22;
  let dragYaw = 0;
  let dragPitch = 0;
  let tiltYaw = 0;
  let tiltPitch = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let lastTime = performance.now();
  let fallbackTriggered = false;

  const fallback = () => {
    if (fallbackTriggered) return;
    fallbackTriggered = true;
    stage.classList.add('is-fallback');
  };

  const configure = (gltf) => {
    model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    model.position.set(-center.x, -center.y, -center.z);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;

    const maxAniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    model.traverse((object) => {
      if (!object.isMesh) return;
      object.frustumCulled = true;
      const source = object.material;
      if (!source) return;
      const material = new THREE.MeshStandardMaterial({
        color: 0x0d0b09,
        metalness: 0.14,
        roughness: 0.82,
        envMapIntensity: 0.7
      });
      object.material = material;
    });

    const view = isMobile ? 3.6 : 4.25;
    const scale = view / maxDim;
    pivot.scale.setScalar(scale);
    pivot.position.x = isMobile ? 0 : 0.28;
    pivot.add(model);

    const yBox = new THREE.Box3().setFromObject(pivot);
    const centerY = yBox.getCenter(new THREE.Vector3()).y;
    pivot.position.y -= centerY;



    pivot.rotation.y = 0;
    ready = true;
    canvas.classList.add('is-ready');
    render(performance.now());
    window.__wolfCapture = () => {
      render(performance.now());
      return canvas.toDataURL('image/jpeg', 0.9);
    };
    window.__wolfCaptureHQ = () => {
      const w = 900;
      const h = 1000;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      render(performance.now());
      const data = canvas.toDataURL('image/png');
      resize();
      return data;
    };
    if (!reduced) animate(performance.now());
  };

  const load = () => {
    const loader = new GLTFLoader();
    const name = (isMobile || saveData) ? 'model-lite.glb' : 'model.glb';
    const url = new URL(`assets/model/${name}`, document.baseURI).href;
    loader.load(url, configure, undefined, fallback);
  };

  const resize = () => {
    const rect = stage.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 640 ? 34 : 30;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
    if (reduced && ready) render(0);
  };

  const render = (time) => {
    if (!ready) return;
    autoYaw = reduced ? -0.22 : -0.22 + Math.sin(time * 0.00016) * 0.06;
    root.rotation.y = autoYaw + dragYaw + scrollEase * 1.15 + tiltYaw;
    root.rotation.x = dragPitch + scrollEase * 0.06 + tiltPitch;
    pivot.position.y = (reduced ? 0 : Math.sin(time * 0.0006) * 0.045) - scrollEase * 2.15;
    dust.rotation.y = time * 0.00003;
    renderer.render(scene, camera);
  };

  const animate = (time) => {
    if (!visible) return;
    const dt = Math.min(60, time - lastTime) / 1000;
    lastTime = time;
    scrollEase += (targetScroll - scrollEase) * Math.min(1, dt * 4.2);
    if (!dragging && !reduced) {
      dragYaw *= 0.998;
      dragPitch *= 0.998;
    }
    render(time);
    requestAnimationFrame(animate);
  };

  const onScroll = () => {
    const rect = stage.getBoundingClientRect();
    const travel = Math.max(rect.height, 420);
    targetScroll = Math.max(0, Math.min(1, -rect.top / travel));
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(stage);
  } else {
    window.addEventListener('resize', resize, { passive: true });
  }
  resize();

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) {
        lastTime = performance.now();
        if (ready && !reduced) requestAnimationFrame(animate);
      }
    }, { rootMargin: '120px' });
    io.observe(stage);
  }

  canvas.addEventListener('pointerdown', (event) => {
    if (reduced || !ready) return;
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = 'grabbing';
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then((state) => {
        if (state === 'granted') attachTilt();
      }).catch(() => {});
    }
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!dragging || reduced) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    dragYaw += dx * 0.005;
    dragPitch = Math.max(-0.28, Math.min(0.28, dragPitch + dy * 0.0025));
  });

  const stopDrag = () => {
    dragging = false;
    canvas.style.cursor = 'grab';
  };
  canvas.addEventListener('pointerup', stopDrag);
  canvas.addEventListener('pointercancel', stopDrag);
  canvas.addEventListener('lostpointercapture', stopDrag);

  let tiltAttached = false;
  const attachTilt = () => {
    if (tiltAttached) return;
    tiltAttached = true;
    window.addEventListener('deviceorientation', (event) => {
      if (reduced) return;
      const gamma = Math.max(-18, Math.min(18, event.gamma || 0));
      const beta = Math.max(-18, Math.min(18, (event.beta || 0) - 45));
      tiltYaw = gamma * 0.006;
      tiltPitch = beta * 0.0018;
    }, { passive: true });
  };
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function') {
    attachTilt();
  }

  const start = () => load();
  if ('requestIdleCallback' in window) {
    requestIdleCallback(start, { timeout: 1200 });
  } else {
    window.setTimeout(start, 120);
  }

  if (reduced && ready) render(0);
}
