import * as THREE from 'three';

// ============================================================================
// REAL-TIME MULTIPLAYER 3D FIREWORKS STATION (จุดพลุเฉลิมฉลอง สุดถนนเมนด้านเหนือ)
// Positioned at (0, 0, -55.6) facing the open northern night sky between Stage & Ubosot
// ============================================================================

export const FIREWORKS_CONFIG = {
  x: 0,
  z: -55.6,
  interactRadius: 4.2
};

export const FIREWORK_STYLES = {
  gold: {
    name: 'พลุทองมงคล',
    emoji: '🌕',
    shots: [
      { delay: 0, dx: 0, dz: -11.0, targetY: 12.8, colors: [0xfef08a, 0xfacc15, 0xf59e0b, 0xffffff], shape: 'willow', count: 120 }
    ]
  },
  rainbow: {
    name: 'พลุสายรุ้ง',
    emoji: '🌈',
    shots: [
      { delay: 0, dx: -3.6, dz: -11.0, targetY: 12.2, colors: [0xef4444, 0xfacc15, 0x22d3ee, 0x4ade80, 0xf472b6, 0xa855f7], shape: 'sphere', count: 115 },
      { delay: 420, dx: 3.6, dz: -12.0, targetY: 14.5, colors: [0x38bdf8, 0xf43f5e, 0xfde047, 0xc084fc, 0x34d399], shape: 'sphere', count: 115 }
    ]
  },
  heart: {
    name: 'พลุสีชมพู-หัวใจ',
    emoji: '💖',
    shots: [
      { delay: 0, dx: 0, dz: -11.5, targetY: 13.0, colors: [0xf43f5e, 0xf472b6, 0xfbcfe8, 0xffffff], shape: 'heart', count: 105 }
    ]
  },
  finale: {
    name: 'พลุชุดใหญ่ 5 นัด',
    emoji: '🎆',
    shots: [
      { delay: 0, dx: -6.5, dz: -10.5, targetY: 11.2, colors: [0xfacc15, 0xfef08a, 0xffffff], shape: 'sphere', count: 90 },
      { delay: 360, dx: 6.5, dz: -10.5, targetY: 12.0, colors: [0x22d3ee, 0x38bdf8, 0xffffff], shape: 'sphere', count: 90 },
      { delay: 720, dx: -3.4, dz: -12.0, targetY: 13.8, colors: [0xf43f5e, 0xf472b6, 0xfde047], shape: 'heart', count: 100 },
      { delay: 1120, dx: 3.4, dz: -12.0, targetY: 14.4, colors: [0x4ade80, 0xfacc15, 0xc084fc, 0x22d3ee], shape: 'willow', count: 105 },
      { delay: 1580, dx: 0, dz: -13.2, targetY: 15.8, colors: [0xfef08a, 0xf43f5e, 0x22d3ee, 0xf472b6, 0x4ade80, 0xffffff], shape: 'willow', count: 145 }
    ]
  }
};

function createSparkleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.28, 'rgba(255,255,255,0.88)');
  g.addColorStop(0.65, 'rgba(255,255,255,0.22)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createFireworksSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  const g = ctx.createLinearGradient(0, 0, 0, 160);
  g.addColorStop(0, '#312e81');
  g.addColorStop(1, '#0f172a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 160);

  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 144);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 44px "Noto Sans Thai", sans-serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('🎆 ลานจุดพลุเฉลิมฉลอง', 256, 62);
  ctx.font = '600 24px "Noto Sans Thai", sans-serif';
  ctx.fillStyle = '#67e8f9';
  ctx.fillText('กด E เพื่อเลือกชุดพลุยิงขึ้นฟ้าพร้อมกัน!', 256, 118);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ----------------------------------------------------------------------------
// Build 3D Fireworks Launch Station at North End of Main Road (0, 0, -55.6)
// ----------------------------------------------------------------------------

export function buildFireworksStation(scene, addCollisionBox) {
  const root = new THREE.Group();
  root.name = 'FireworksLaunchStation';
  root.position.set(FIREWORKS_CONFIG.x, 0, FIREWORKS_CONFIG.z);

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85, emissive: 0x261004, emissiveIntensity: 0.25 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.4 });
  const coneOrangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.45, emissive: 0x6b2804, emissiveIntensity: 0.35 });
  const coneWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45, emissive: 0x334155, emissiveIntensity: 0.3 });

  // Wooden launch base rack (2.6m x 0.32m x 0.72m)
  const baseRack = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.32, 0.72), woodMat);
  baseRack.position.set(0, 0.16, -0.4);
  root.add(baseRack);

  const frameRail = new THREE.Mesh(new THREE.BoxGeometry(2.68, 0.08, 0.78), steelMat);
  frameRail.position.set(0, 0.58, -0.4);
  root.add(frameRail);

  // 7 colorful mortar launch tubes angled slightly skyward
  const tubeColors = [0xef4444, 0xfacc15, 0x22d3ee, 0xec4899, 0x4ade80, 0xf97316, 0xa855f7];
  const tubeGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.78, 10);
  for (let i = 0; i < 7; i++) {
    const tx = -0.96 + i * 0.32;
    const mat = new THREE.MeshStandardMaterial({
      color: tubeColors[i],
      roughness: 0.45,
      emissive: tubeColors[i],
      emissiveIntensity: 0.28
    });
    const tube = new THREE.Mesh(tubeGeo, mat);
    tube.position.set(tx, 0.54, -0.4);
    tube.rotation.z = (i - 3) * 0.06;
    root.add(tube);
  }

  // 4 Safety Traffic Cones flanking the launch rack
  const conePositions = [
    [-1.65, 0.35],
    [1.65, 0.35],
    [-1.65, -1.05],
    [1.65, -1.05]
  ];
  for (const [cx, cz] of conePositions) {
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.05, 0.32), coneOrangeMat);
    base.position.set(cx, 0.025, cz);
    root.add(base);
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.46, 10), coneOrangeMat);
    body.position.set(cx, 0.27, cz);
    root.add(body);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.085, 0.1, 10), coneWhiteMat);
    band.position.set(cx, 0.3, cz);
    root.add(band);
  }

  // Festive Illuminated Signboard standing cleanly behind the mortar rack
  const signTex = createFireworksSignTexture();
  const signBoard = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 0.82),
    new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
  );
  signBoard.position.set(0, 1.52, -0.92);
  root.add(signBoard);
  for (const px of [-1.15, 1.15]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8), steelMat);
    pole.position.set(px, 0.9, -0.94);
    root.add(pole);
  }

  scene.add(root);

  if (typeof addCollisionBox === 'function') {
    addCollisionBox(
      FIREWORKS_CONFIG.x - 1.45,
      FIREWORKS_CONFIG.x + 1.45,
      FIREWORKS_CONFIG.z - 1.05,
      FIREWORKS_CONFIG.z + 0.05,
      'fireworks-rack'
    );
  }

  return {
    root,
    sparkleTex: createSparkleTexture(),
    rockets: [],
    bursts: []
  };
}

// ----------------------------------------------------------------------------
// Procedural Fireworks Audio (Launch Whoosh + Festive Burst Boom & Crackle)
// ----------------------------------------------------------------------------

function playLaunchSound(audioCtx, enabled) {
  if (!enabled || !audioCtx || audioCtx.state !== 'running') return;
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(1180, now + 0.55);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.07, now + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.62);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.65);
  } catch {}
}

function playBurstSound(audioCtx, enabled) {
  if (!enabled || !audioCtx || audioCtx.state !== 'running') return;
  try {
    const now = audioCtx.currentTime;
    // Deep warm boom thump
    const boom = audioCtx.createOscillator();
    const bg = audioCtx.createGain();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(125, now);
    boom.frequency.exponentialRampToValueAtTime(34, now + 0.34);
    bg.gain.setValueAtTime(0.28, now);
    bg.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    boom.connect(bg).connect(audioCtx.destination);
    boom.start(now);
    boom.stop(now + 0.45);

    // Filtered noise crackle sparkle
    const dur = 0.55;
    const len = Math.floor(audioCtx.sampleRate * dur);
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.pow(1 - i / len, 1.8);
      data[i] = (Math.random() * 2 - 1) * env * (Math.random() > 0.72 ? 1.0 : 0.35);
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buf;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1850, now);
    filter.Q.value = 0.8;
    const ng = audioCtx.createGain();
    ng.gain.setValueAtTime(0.22, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(filter).connect(ng).connect(audioCtx.destination);
    noise.start(now);
  } catch {}
}

// ----------------------------------------------------------------------------
// Spawn Rocket & Particle Burst (1 THREE.Points Draw Call per Active Burst!)
// ----------------------------------------------------------------------------

function spawnFireworkBurst(scene, fwState, origin, shot, lowGraphics) {
  const count = lowGraphics ? Math.max(48, Math.round(shot.count * 0.65)) : shot.count;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const tmpCol = new THREE.Color();

  for (let i = 0; i < count; i++) {
    positions[i * 3] = origin.x;
    positions[i * 3 + 1] = origin.y;
    positions[i * 3 + 2] = origin.z;

    let vx = 0;
    let vy = 0;
    let vz = 0;

    if (shot.shape === 'heart') {
      // Parametric 3D heart shape facing South (+Z) so the whole temple fair sees the heart clearly!
      const t = (i / count) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      const scale = 0.48 + (Math.random() - 0.5) * 0.08;
      vx = hx * scale;
      vy = hy * scale;
      vz = (Math.random() - 0.5) * 1.6;
    } else {
      // Spherical peony / golden willow burst
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const speed = (shot.shape === 'willow' ? 6.5 : 8.2) * (0.55 + Math.random() * 0.55);
      vx = Math.sin(phi) * Math.cos(theta) * speed;
      vy = Math.cos(phi) * speed;
      vz = Math.sin(phi) * Math.sin(theta) * speed;
    }

    velocities[i * 3] = vx;
    velocities[i * 3 + 1] = vy;
    velocities[i * 3 + 2] = vz;

    const hex = shot.colors[i % shot.colors.length];
    tmpCol.setHex(hex);
    colors[i * 3] = tmpCol.r;
    colors[i * 3 + 1] = tmpCol.g;
    colors[i * 3 + 2] = tmpCol.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: shot.shape === 'willow' ? 1.55 : 1.4,
    map: fwState.sparkleTex,
    vertexColors: true,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  fwState.bursts.push({
    points,
    geo,
    mat,
    velocities,
    age: 0,
    life: shot.shape === 'willow' ? 2.6 : 2.1,
    gravity: shot.shape === 'willow' ? 3.8 : 2.8,
    drag: shot.shape === 'willow' ? 0.965 : 0.955
  });
}

export function launchFireworkShow(scene, fwState, styleKey, audioCtx, soundEnabled, lowGraphics) {
  if (!fwState) return;
  const style = FIREWORK_STYLES[styleKey] || FIREWORK_STYLES.gold;
  const baseX = FIREWORKS_CONFIG.x;
  const baseZ = FIREWORKS_CONFIG.z - 0.4;

  style.shots.forEach((shot) => {
    setTimeout(() => {
      if (!fwState) return;
      playLaunchSound(audioCtx, soundEnabled);

      const rocketMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 6, 6),
        new THREE.MeshBasicMaterial({ color: shot.colors[0] || 0xfef08a })
      );
      const startX = baseX + (shot.dx || 0) * 0.14;
      const startZ = baseZ;
      rocketMesh.position.set(startX, 1.0, startZ);
      scene.add(rocketMesh);

      fwState.rockets.push({
        mesh: rocketMesh,
        startPos: new THREE.Vector3(startX, 1.0, startZ),
        targetPos: new THREE.Vector3(baseX + (shot.dx || 0), shot.targetY || 24, baseZ + (shot.dz || -2)),
        age: 0,
        duration: 0.72 + Math.random() * 0.18,
        shot,
        audioCtx,
        soundEnabled,
        lowGraphics
      });
    }, shot.delay || 0);
  });
}

export function updateFireworks(scene, fwState, dt) {
  if (!fwState) return;

  // 1. Rising firework rockets
  for (let i = fwState.rockets.length - 1; i >= 0; i--) {
    const r = fwState.rockets[i];
    r.age += dt;
    const t = Math.min(1, r.age / r.duration);
    const ease = 1 - Math.pow(1 - t, 2);
    r.mesh.position.lerpVectors(r.startPos, r.targetPos, ease);
    r.mesh.position.x += Math.sin(t * 18) * 0.12;

    if (t >= 1) {
      scene.remove(r.mesh);
      r.mesh.geometry.dispose();
      r.mesh.material.dispose();
      playBurstSound(r.audioCtx, r.soundEnabled);
      spawnFireworkBurst(scene, fwState, r.targetPos, r.shot, r.lowGraphics);
      fwState.rockets.splice(i, 1);
    }
  }

  // 2. Expanding glittering firework bursts
  for (let i = fwState.bursts.length - 1; i >= 0; i--) {
    const b = fwState.bursts[i];
    b.age += dt;
    if (b.age >= b.life) {
      scene.remove(b.points);
      b.geo.dispose();
      b.mat.dispose();
      fwState.bursts.splice(i, 1);
      continue;
    }

    const posAttr = b.geo.attributes.position;
    const arr = posAttr.array;
    const vel = b.velocities;
    const dragFactor = Math.pow(b.drag, dt * 60);
    const gravStep = b.gravity * dt;

    for (let p = 0; p < arr.length; p += 3) {
      vel[p] *= dragFactor;
      vel[p + 1] = vel[p + 1] * dragFactor - gravStep;
      vel[p + 2] *= dragFactor;

      arr[p] += vel[p] * dt;
      arr[p + 1] += vel[p + 1] * dt;
      arr[p + 2] += vel[p + 2] * dt;
    }
    posAttr.needsUpdate = true;

    const progress = b.age / b.life;
    const twinkle = 0.85 + Math.sin(b.age * 28 + i) * 0.15;
    b.mat.opacity = Math.max(0, (1 - progress * progress) * twinkle);
  }
}

export function drawFireworksMinimap(ctx, mapX, mapY) {
  ctx.fillStyle = '#f43f5e';
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(mapX(FIREWORKS_CONFIG.x), mapY(FIREWORKS_CONFIG.z), 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}
