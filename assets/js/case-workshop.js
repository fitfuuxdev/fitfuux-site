import * as THREE from 'three';

const canvas = document.getElementById('workshop-canvas');
const stage = document.getElementById('workshop-stage');
if (canvas && stage) init();

function woodTexture(base, dark, light) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 256);

  let seed = 9;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 0; i < 70; i += 1) {
    const y = rand() * 256;
    const amp = 2 + rand() * 7;
    const freq = 0.01 + rand() * 0.03;
    ctx.beginPath();
    ctx.strokeStyle = rand() > 0.5 ? dark : light;
    ctx.globalAlpha = 0.06 + rand() * 0.16;
    ctx.lineWidth = 0.8 + rand() * 2.4;
    for (let x = 0; x <= 512; x += 6) {
      const yy = y + Math.sin(x * freq + i) * amp + Math.sin(x * freq * 2.7) * amp * 0.25;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  for (let k = 0; k < 3; k += 1) {
    const x = 80 + rand() * 350;
    const y = 50 + rand() * 150;
    ctx.strokeStyle = dark;
    ctx.globalAlpha = 0.28;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y, 10 + rand() * 14, 4 + rand() * 5, rand() * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.ellipse(x, y, 5, 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.6, 1);
  return texture;
}

function roundedRect(shape, x, y, w, h, r) {
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

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
  renderer.toneMappingExposure = 1.02;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.4 : 1.8));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 1.55, 6.3);
  camera.lookAt(0, 0.1, 0);

  const root = new THREE.Group();
  root.rotation.order = 'YXZ';
  scene.add(root);

  const object = new THREE.Group();
  object.rotation.set(0.12, -0.48, -0.03);
  object.scale.setScalar(1.12);
  root.add(object);

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x17120d);
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
  panel([5.4, 3.4, 1.7], [-4, 2, 1.4], [1.3, 6.4, 1], [0, Math.PI / 2, 0]);
  panel([1.4, 1.7, 2.1], [4.2, 0.6, 1.8], [1, 6, 1], [0, -Math.PI / 2, 0]);
  panel([2.8, 2.2, 1.4], [0, 5, -1], [6.4, 1.4, 1], [Math.PI / 2, 0, 0]);
  panel([0.32, 0.2, 0.12], [0, -4.4, 0], [6, 5, 1], [-Math.PI / 2, 0, 0]);

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

  scene.add(new THREE.HemisphereLight(0xffe8cc, 0x1c150f, 0.9));

  const key = new THREE.DirectionalLight(0xffe4c4, 2.8);
  key.position.set(4.6, 5.8, 4.6);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xb9cfe0, 2.3);
  rim.position.set(-4.5, 2.4, -3.5);
  scene.add(rim);

  const warm = new THREE.PointLight(0xa87a50, 15, 12, 2);
  warm.position.set(1.2, -1.4, 3.4);
  scene.add(warm);

  const woodMap = woodTexture('#5c402b', '#332318', '#7e5b3b');
  const wood = new THREE.MeshStandardMaterial({
    map: woodMap,
    color: 0xffffff,
    roughness: 0.6,
    metalness: 0.04,
    envMapIntensity: 0.65
  });
  const woodDark = new THREE.MeshStandardMaterial({
    map: woodMap,
    color: 0x33251a,
    roughness: 0.48,
    metalness: 0.05,
    envMapIntensity: 0.8
  });
  const metal = new THREE.MeshStandardMaterial({
    color: 0xc9c3b6,
    metalness: 1,
    roughness: 0.24,
    envMapIntensity: 1.5
  });
  const metalDark = new THREE.MeshStandardMaterial({
    color: 0x3b3833,
    metalness: 0.85,
    roughness: 0.38,
    envMapIntensity: 1.1
  });
  const brass = new THREE.MeshStandardMaterial({
    color: 0xb08a55,
    metalness: 1,
    roughness: 0.28,
    envMapIntensity: 1.4
  });
  const shaving = new THREE.MeshStandardMaterial({
    color: 0xe5d0ae,
    roughness: 0.8,
    metalness: 0.02
  });

  const benchMaterial = new THREE.MeshStandardMaterial({
    map: woodMap,
    color: 0x3a2a1d,
    roughness: 0.82,
    metalness: 0.02,
    envMapIntensity: 0.5
  });
  const workbench = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.055, 1.35), benchMaterial);
  workbench.position.set(0, -0.35, 0.08);
  workbench.rotation.y = 0.04;
  object.add(workbench);

  const shape = roundedRect(new THREE.Shape(), -1.15, -0.18, 2.3, 0.36, 0.1);
  const bodyGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.72,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
    curveSegments: 10
  });
  bodyGeo.translate(0, 0, -0.36);
  const body = new THREE.Mesh(bodyGeo, wood);
  object.add(body);

  const sole = new THREE.Mesh(new THREE.BoxGeometry(2.36, 0.055, 0.75), metalDark);
  sole.position.set(0, -0.205, 0);
  object.add(sole);

  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.012, 0.52), new THREE.MeshBasicMaterial({ color: 0x0d0b09 }));
  mouth.position.set(0.46, 0.185, 0);
  object.add(mouth);

  const knobStem = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.1, 0.17, 24), woodDark);
  knobStem.position.set(0.74, 0.27, 0);
  object.add(knobStem);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.095, 24, 16), woodDark);
  knob.scale.y = 0.92;
  knob.position.set(0.74, 0.375, 0);
  object.add(knob);
  const knobRing = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.012, 8, 32), brass);
  knobRing.rotation.x = Math.PI / 2;
  knobRing.position.set(0.74, 0.2, 0);
  object.add(knobRing);

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.245, 0.062, 12, 32, Math.PI), woodDark);
  handle.position.set(-0.72, 0.19, 0);
  handle.scale.set(1.05, 1.15, 1.25);
  object.add(handle);
  const handleFootA = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.075, 0.1, 16), woodDark);
  handleFootA.position.set(-0.96, 0.17, 0);
  object.add(handleFootA);
  const handleFootB = handleFootA.clone();
  handleFootB.position.x = -0.48;
  object.add(handleFootB);

  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.022, 0.64), metal);
  blade.rotation.z = -0.33;
  blade.position.set(0.28, 0.265, 0);
  object.add(blade);

  const chipBreaker = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.045, 0.55), metalDark);
  chipBreaker.rotation.z = -0.33;
  chipBreaker.position.set(0.16, 0.315, 0);
  object.add(chipBreaker);

  const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.045, 0.035, 20), brass);
  screw.position.set(0.3, 0.37, 0);
  object.add(screw);

  for (let i = 0; i < 4; i += 1) {
    const curl = new THREE.Mesh(
      new THREE.TorusGeometry(0.11 + i * 0.014, 0.009, 6, 28, Math.PI * 1.55),
      shaving
    );
    curl.position.set(0.48 + (i % 2) * 0.13, 0.205 + i * 0.012, -0.16 + i * 0.1);
    curl.rotation.set(1.2 + i * 0.3, 0.2 * i, 0.4 * i);
    object.add(curl);
  }

  const dustCount = isMobile ? 18 : 34;
  const positions = new Float32Array(dustCount * 3);
  let seed = 21;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < dustCount; i += 1) {
    positions[i * 3] = (rand() - 0.5) * 3.4;
    positions[i * 3 + 1] = (rand() - 0.4) * 2.2;
    positions[i * 3 + 2] = (rand() - 0.5) * 1.6;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xd8b98d,
    size: 0.014,
    transparent: true,
    opacity: 0.45,
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
    camera.fov = w < 640 ? 36 : 32;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0.1, 0);
    object.scale.setScalar(w < 640 ? 0.84 : 1.12);
    if (ready) render(performance.now());
  };

  const render = (time) => {
    object.rotation.y = -0.48 + (reduced ? 0 : Math.sin(time * 0.00028) * 0.1) + dragYaw + scrollEase * 0.14;
    object.rotation.x = 0.12 + (reduced ? 0 : Math.sin(time * 0.00023) * 0.025) + dragPitch;
    object.position.y = (reduced ? 0 : Math.sin(time * 0.0006) * 0.03) - scrollEase * 0.1;
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
    dragPitch = Math.max(-0.22, Math.min(0.22, dragPitch + (event.clientY - lastY) * 0.0025));
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
  window.__workshopCaptureHQ = () => {
    const w = 1000;
    const h = 900;
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
