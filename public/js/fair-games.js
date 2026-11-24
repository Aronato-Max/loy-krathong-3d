import * as THREE from 'three';

// ============================================================================
// TEMPLE FAIR MINI-GAME BOOTHS & WEARABLE HEAD PRIZES
// 1) 🎈 ซุ้มปาโป่งชิงรางวัล (West of Main Road: X = -8.2, Z = 20.5)
// 2) ⭐ ซุ้มสอยดาวพาโชค (East of Main Road: X = 8.4, Z = 20.5)
// 3) 🐰 หูกระต่ายไฟกะพริบ / 👑 มงกุฎดอกไม้เรืองแสง (3D Wearable Head Accessories)
// ============================================================================

export const BALLOON_BOOTH_CONFIG = {
  x: -8.2,
  z: 20.5,
  interactX: -5.6,
  interactZ: 20.5,
  interactRadius: 3.6
};

export const CONTEST_ENTRIES = [
  {
    id: 'banana',
    num: 1,
    emoji: '🌿',
    name: 'กระทงใบตองวิจิตร',
    desc: 'พับกลีบใบตองประณีตสไตล์วัดทุ่งท่าช้าง ประดับดาวเรืองทอง'
  },
  {
    id: 'lotus',
    num: 2,
    emoji: '🌸',
    name: 'กระทงบัวสวรรค์',
    desc: 'กลีบบัวชมพูซ้อนอ่อนช้อย หอมละมุนแสงเทียนกลางคืนเพ็ญ'
  },
  {
    id: 'bread',
    num: 3,
    emoji: '🍞',
    name: 'กระทงขนมปังรักโลก',
    desc: 'กระทงขนมปังสีสันสดใส เป็นมิตรกับธรรมชาติและปลาในสระ'
  }
];

function createGameSignTexture(title, subtitle, bgTop, bgBot, borderCol, titleCol) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, 160);
  grad.addColorStop(0, bgTop);
  grad.addColorStop(1, bgBot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 160);

  ctx.strokeStyle = borderCol;
  ctx.lineWidth = 9;
  ctx.strokeRect(8, 8, 496, 144);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 44px "Noto Sans Thai", sans-serif';
  ctx.fillStyle = titleCol;
  ctx.fillText(title, 256, 62);

  ctx.font = '600 24px "Noto Sans Thai", sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(subtitle, 256, 118);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildFairGames(scene, addCollisionBox) {
  const root = new THREE.Group();
  root.name = 'TempleFairMiniGames';
  const hangingStars = [];
  const boothBalloons = [];

  // --------------------------------------------------------------------------
  // 1) 🎈 ซุ้มปาโป่งชิงรางวัล (X = -8.2, Z = 20.5, facing East +X toward road)
  // --------------------------------------------------------------------------
  const balloonBooth = new THREE.Group();
  balloonBooth.position.set(BALLOON_BOOTH_CONFIG.x, 0, BALLOON_BOOTH_CONFIG.z);
  balloonBooth.rotation.y = Math.PI / 2; // local +Z faces East toward main road

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.85 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.65, emissive: 0x4c0519, emissiveIntensity: 0.25 });
  const trimGoldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4, metalness: 0.4, emissive: 0x854d0e, emissiveIntensity: 0.3 });
  const boardMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });

  // Counter & back pegboard wall
  const counter = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.92, 0.72), woodMat);
  counter.position.set(0, 0.46, 0.85);
  balloonBooth.add(counter);

  const counterTop = new THREE.Mesh(new THREE.BoxGeometry(3.75, 0.08, 0.84), trimGoldMat);
  counterTop.position.set(0, 0.95, 0.85);
  balloonBooth.add(counterTop);

  const backBoard = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.35, 0.16), boardMat);
  backBoard.position.set(0, 1.35, -0.95);
  balloonBooth.add(backBoard);

  // 4 corner poles & sloped red carnival canopy
  for (const [px, pz] of [[-1.75, -0.95], [1.75, -0.95], [-1.75, 1.05], [1.75, 1.05]]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.7, 7), woodMat);
    pole.position.set(px, 1.35, pz);
    balloonBooth.add(pole);
  }
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.2, 2.5), roofMat);
  canopy.position.set(0, 2.75, 0.05);
  canopy.rotation.x = 0.08;
  balloonBooth.add(canopy);

  // 15 bright 3D balloons mounted in a 5x3 grid on the back pegboard
  const bColors = [0xef4444, 0xfacc15, 0x22d3ee, 0xec4899, 0x4ade80, 0xa855f7, 0xf97316];
  const balloonGeo = new THREE.SphereGeometry(0.18, 10, 8);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const c = bColors[(row * 5 + col) % bColors.length];
      const bMat = new THREE.MeshStandardMaterial({
        color: c,
        roughness: 0.25,
        emissive: c,
        emissiveIntensity: 0.32
      });
      const b = new THREE.Mesh(balloonGeo, bMat);
      b.scale.set(0.92, 1.15, 0.92);
      b.position.set(-1.2 + col * 0.6, 1.15 + row * 0.52, -0.78);
      balloonBooth.add(b);
      boothBalloons.push({ mesh: b, baseY: b.position.y, phase: row * 1.4 + col * 0.7 });
    }
  }

  // Cute display plush teddy bear sitting on the counter as top prize preview
  const prizeBear = createTeddyBearMesh();
  prizeBear.scale.setScalar(1.35);
  prizeBear.position.set(1.25, 1.25, 0.85);
  balloonBooth.add(prizeBear);

  // Illuminated Booth Signboard
  const balloonSign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 0.98),
    new THREE.MeshBasicMaterial({
      map: createGameSignTexture(
        '🎈 ซุ้มปาโป่งชิงรางวัล',
        'รอบละ 5 เหรียญ • แตก 7 ลูก รับ +15 เหรียญ & ตุ๊กตาหมี!',
        '#9f1239',
        '#4c0519',
        '#facc15',
        '#fef08a'
      ),
      side: THREE.DoubleSide
    })
  );
  balloonSign.position.set(0, 3.22, 1.18);
  balloonBooth.add(balloonSign);

  root.add(balloonBooth);
  if (typeof addCollisionBox === 'function') {
    addCollisionBox(
      BALLOON_BOOTH_CONFIG.x - 1.3,
      BALLOON_BOOTH_CONFIG.x + 1.45,
      BALLOON_BOOTH_CONFIG.z - 2.05,
      BALLOON_BOOTH_CONFIG.z + 2.05,
      'balloon-dart-booth'
    );
  }

  scene.add(root);
  return { root, hangingStars, boothBalloons };
}

export function updateFairGames(fairState, elapsed) {
  if (!fairState) return;
  for (const s of fairState.hangingStars) {
    s.mesh.rotation.y = elapsed * 2.2 + s.phase;
    s.mesh.position.y = s.baseY + Math.sin(elapsed * 2.6 + s.phase) * 0.07;
  }
  for (const b of fairState.boothBalloons) {
    b.mesh.position.y = b.baseY + Math.sin(elapsed * 2.1 + b.phase) * 0.035;
  }
}

// ----------------------------------------------------------------------------
// 3D Wearable Head Accessories (Bunny LED Ears & Glowing Thai Flower Crown)
// ----------------------------------------------------------------------------

export function createHeadAccessoryMesh(type) {
  if (!type) return null;
  const g = new THREE.Group();
  g.name = `HeadAccessory_${type}`;

  if (type === 'bunny') {
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      emissive: 0xec4899,
      emissiveIntensity: 0.75,
      roughness: 0.3
    });
    const innerGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    const band = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.022, 8, 18, Math.PI), bandMat);
    band.position.y = -0.02;
    g.add(band);

    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.036, 0.19, 6, 8), bandMat);
      ear.position.set(side * 0.08, 0.16, 0);
      ear.rotation.z = side * -0.18;
      g.add(ear);

      const inner = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.13, 4, 6), innerGlowMat);
      inner.position.set(side * 0.08, 0.16, 0.022);
      inner.rotation.z = side * -0.18;
      g.add(inner);
    }
    return g;
  }

  if (type === 'crown') {
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.65,
      roughness: 0.22,
      emissive: 0xb45309,
      emissiveIntensity: 0.72
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.024, 8, 20), goldMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.04;
    g.add(ring);

    const flowerCols = [0xfef08a, 0xf472b6, 0x38bdf8, 0xfde047, 0xfb7185, 0xa78bfa];
    const petalGeo = new THREE.SphereGeometry(0.034, 8, 6);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const blossom = new THREE.Mesh(petalGeo, new THREE.MeshBasicMaterial({ color: flowerCols[i] }));
      blossom.position.set(Math.cos(a) * 0.16, 0.085, Math.sin(a) * 0.16);
      g.add(blossom);
    }
    const peak = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.13, 6), goldMat);
    peak.position.set(0, 0.13, 0.13);
    g.add(peak);
    return g;
  }

  return null;
}

// ----------------------------------------------------------------------------
// Cute 3D Plush Teddy Bear Prize (held in hand after winning Balloon Dart!)
// ----------------------------------------------------------------------------

export function createTeddyBearMesh() {
  const g = new THREE.Group();
  const furMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 });
  const snoutMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.8 });
  const bowMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x991b1b, emissiveIntensity: 0.35 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), furMat);
  body.scale.set(0.95, 1.1, 0.85);
  body.position.y = 0.08;
  g.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.095, 10, 8), furMat);
  head.position.y = 0.25;
  g.add(head);

  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), snoutMat);
  snout.position.set(0, 0.23, 0.08);
  g.add(snout);

  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 6), furMat);
    ear.position.set(sx * 0.075, 0.33, 0);
    g.add(ear);

    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 6), eyeMat);
    eye.position.set(sx * 0.034, 0.27, 0.082);
    g.add(eye);

    const arm = new THREE.Mesh(new THREE.SphereGeometry(0.042, 7, 6), furMat);
    arm.position.set(sx * 0.11, 0.12, 0.03);
    g.add(arm);
  }

  const bow = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.03), bowMat);
  bow.position.set(0, 0.17, 0.085);
  g.add(bow);

  return g;
}

// ----------------------------------------------------------------------------
// Mini-game Sound Effects (Balloon Pop & Star Draw Sparkle Fanfare)
// ----------------------------------------------------------------------------

export function playDartPopSound(audioCtx, enabled) {
  if (!enabled || !audioCtx || audioCtx.state !== 'running') return;
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(640, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.075);
    g.gain.setValueAtTime(0.24, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    osc.connect(g).connect(audioCtx._sfxGain || audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  } catch {}
}

export function playStarWinSound(audioCtx, enabled, isJackpot = false) {
  if (!enabled || !audioCtx || audioCtx.state !== 'running') return;
  try {
    const now = audioCtx.currentTime;
    const notes = isJackpot
      ? [523.25, 659.25, 783.99, 1046.5, 1318.5]
      : [587.33, 739.99, 880.0];
    notes.forEach((f, i) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.08);
      g.gain.setValueAtTime(0.14, now + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.28);
      osc.connect(g).connect(audioCtx._sfxGain || audioCtx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.3);
    });
  } catch {}
}
