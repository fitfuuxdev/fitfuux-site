import * as THREE from 'three';

const canvas = document.getElementById('salon-canvas');
const stage = document.getElementById('salon-stage');
if (canvas && stage) init();

function init() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 720px)').matches;
  const memory = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  const saveData = navigator.connection && navigator.connection.saveData;

  if (reduced || isMobile || memory <= 2 || cores <= 2 || saveData) {
    stage.classList.add('is-fallback');
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
  } catch (error) {
    stage.classList.add('is-fallback');
    return;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.4 : 1.8));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
  camera.position.set(0, 0.15, 7.4);
  camera.lookAt(0, 0, 0);

  const root = new THREE.Group();
  root.rotation.order = 'YXZ';
  scene.add(root);

  const object = new THREE.Group();
  object.position.y = 0.12;
  root.add(object);

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x1a1410);
  const planeGeo = new THREE.PlaneGeometry(1, 1);
  const panel = (color, position, scale, rotation) => {
    const mesh = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({
      color: new THREE.Color(color[0], color[1], color[2]),
      side: THREE.DoubleSide
    }));
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    mesh.rotation.set(...rotation);
    envScene.add(mesh);
  };
  panel([6.2, 4.7, 3.1], [-3.8, 2.2, 1.6], [1.2, 6.8, 1], [0, Math.PI / 2, 0]);
  panel([1.3, 1.8, 2.4], [4.2, 0.4, 2], [1, 6.2, 1], [0, -Math.PI / 2, 0]);
  panel([2.6, 1.7, 0.9], [0, 4.8, -1], [6, 1.2, 1], [Math.PI / 2, 0, 0]);
  panel([0.35, 0.23, 0.14], [0, -4.4, 0], [6, 5, 1], [-Math.PI / 2, 0, 0]);
  panel([4.8, 4.2, 3.4], [0, 0.8, 4], [4.5, 4.5, 1], [0, 0, 0]);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(envScene, 0.02, 0.1, 100);
  scene.environment = envRT.texture;
  envScene.traverse((item) => {
    if (item.isMesh) {
      item.geometry.dispose();
      item.material.dispose();
    }
  });
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xfff0da, 0x241a12, 0.85));

  const key = new THREE.DirectionalLight(0xffe4c6, 2.8);
  key.position.set(4.4, 5.4, 4.2);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xbcd2e4, 2.2);
  rim.position.set(-4.2, 2.2, -3.4);
  scene.add(rim);

  const warm = new THREE.PointLight(0xd8a870, 24, 10, 2);
  warm.position.set(0.8, -1.4, 3.2);
  scene.add(warm);

  const gold = new THREE.MeshStandardMaterial({
    color: 0xb08a55,
    metalness: 1,
    roughness: 0.24,
    envMapIntensity: 1.5
  });
  const goldDark = new THREE.MeshStandardMaterial({
    color: 0x6f5432,
    metalness: 0.9,
    roughness: 0.35,
    envMapIntensity: 1.2
  });
  const mirrorMat = new THREE.MeshStandardMaterial({
    color: 0xf2e9da,
    metalness: 1,
    roughness: 0.06,
    envMapIntensity: 2.1
  });

  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.24, 0.065, 24, 128), gold);
  ring.position.set(0, 0.38, 0);
  object.add(ring);

  const glowRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.09, 0.022, 12, 96),
    new THREE.MeshStandardMaterial({
      color: 0xfff3d9,
      emissive: 0xffd9a0,
      emissiveIntensity: 2.6,
      roughness: 0.3
    })
  );
  glowRing.position.set(0, 0.38, 0.02);
  object.add(glowRing);

  const mirror = new THREE.Mesh(new THREE.CircleGeometry(1.07, 72), mirrorMat);
  mirror.position.set(0, 0.38, -0.015);
  object.add(mirror);

  const back = new THREE.Mesh(
    new THREE.CylinderGeometry(1.23, 1.23, 0.12, 72),
    new THREE.MeshStandardMaterial({ color: 0x2a211a, metalness: 0.4, roughness: 0.6 })
  );
  back.rotation.x = Math.PI / 2;
  back.position.set(0, 0.38, -0.09);
  object.add(back);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 1.05, 24), goldDark);
  stem.position.set(0, -0.85, -0.03);
  object.add(stem);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 0.08, 64), goldDark);
  base.position.set(0, -1.4, -0.03);
  object.add(base);

  const baseRing = new THREE.Mesh(new THREE.TorusGeometry(0.63, 0.015, 8, 64), gold);
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.set(0, -1.35, -0.03);
  object.add(baseRing);

  const dustCount = isMobile ? 18 : 36;
  const positions = new Float32Array(dustCount * 3);
  let seed = 7;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < dustCount; i += 1) {
    const radius = 1.4 + rand() * 1.8;
    const angle = rand() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (rand() - 0.5) * 3.4;
    positions[i * 3 + 2] = Math.sin(angle) * radius * 0.5;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xe6c48f,
    size: 0.018,
    transparent: true,
    opacity: 0.55,
    depthWrite: false
  }));
  root.add(dust);

  let visible = true;
  let ready = false;
  let dragging = false;
  let lastX = 0;
  let dragYaw = 0;
  let dragPitch = 0;
  let targetScroll = 0;
  let scrollEase = 0;
  let lastTime = performance.now();

  const resize = () => {
    const rect = stage.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 640 ? 36 : 31;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
    object.scale.setScalar(w < 640 ? 0.78 : 1);
    if (ready) render(performance.now());
  };

  const render = (time) => {
    object.rotation.y = -0.16 + Math.sin(time * 0.00035) * 0.09 + dragYaw + scrollEase * 0.18;
    object.rotation.x = -0.02 + Math.sin(time * 0.00027) * 0.02 + dragPitch;
    object.position.y = 0.12 + (reduced ? 0 : Math.sin(time * 0.0007) * 0.035) - scrollEase * 0.16;
    dust.rotation.y = time * 0.00002;
    renderer.render(scene, camera);
  };

  const animate = (time) => {
    if (!visible) return;
    const dt = Math.min(60, time - lastTime) / 1000;
    lastTime = time;
    scrollEase += (targetScroll - scrollEase) * Math.min(1, dt * 4);
    if (!dragging && !reduced) {
      dragYaw *= 0.996;
      dragPitch *= 0.996;
    }
    render(time);
    requestAnimationFrame(animate);
  };

  const onScroll = () => {
    const rect = stage.getBoundingClientRect();
    targetScroll = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height, 420)));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
  else window.addEventListener('resize', resize, { passive: true });
  resize();

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) {
        lastTime = performance.now();
        if (ready && !reduced) requestAnimationFrame(animate);
      }
    }, { rootMargin: '100px' });
    io.observe(stage);
  }

  canvas.addEventListener('pointerdown', (event) => {
    if (reduced) return;
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = 'grabbing';
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    dragYaw += (event.clientX - lastX) * 0.005;
    dragPitch = Math.max(-0.25, Math.min(0.25, dragPitch + (event.clientY - lastY) * 0.0025));
    lastX = event.clientX;
    lastY = event.clientY;
  });
  const stop = () => {
    dragging = false;
    canvas.style.cursor = 'grab';
  };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);
  canvas.addEventListener('lostpointercapture', stop);

  ready = true;
  canvas.classList.add('is-ready');
  render(performance.now());
  window.__salonCaptureHQ = () => {
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
}
