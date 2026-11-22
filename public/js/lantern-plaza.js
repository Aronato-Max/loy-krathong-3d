import * as THREE from 'three';

// ============================================================================
// SKY LANTERN RELEASE PLAZA & "ลอยกระทง 2569" CHECK-IN PHOTO ARCH
// ============================================================================

export const LANTERN_PLAZA_CONFIG = {
  x: 21.5,
  z: -6.0,
  radius: 7.2,
  interactRadius: 4.5,
  lifetimeMs: 90000
};

export const LANTERN_COLORS = {
  gold: {
    name: 'โคมทองมงคล',
    emoji: '🌕',
    body: 0xffb703,
    emissive: 0xf59e0b
  },
  pink: {
    name: 'โคมชมพูความรัก',
    emoji: '🌸',
    body: 0xf9a8d4,
    emissive: 0xec4899
  },
  white: {
    name: 'โคมขาวบริสุทธิ์',
    emoji: '🤍',
    body: 0xfff7ed,
    emissive: 0xfde68a
  }
};

function createGlowSpriteTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255, 245, 200, 0.95)');
  grad.addColorStop(0.4, 'rgba(251, 191, 36, 0.42)');
  grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let sharedGlowTex = null;
function getSharedGlowTex() {
  if (!sharedGlowTex) {
    sharedGlowTex = createGlowSpriteTexture();
  }
  return sharedGlowTex;
}

function createCheckinBannerTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Deep royal twilight gradient background
  const bg = ctx.createLinearGradient(0, 0, 1024, 256);
  bg.addColorStop(0, '#1e1b4b');
  bg.addColorStop(0.5, '#3b0764');
  bg.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 256);

  // Double gold Thai-inspired frame
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 10;
  ctx.strokeRect(12, 12, 1000, 232);
  ctx.strokeStyle = '#fb923c';
  ctx.lineWidth = 3;
  ctx.strokeRect(26, 26, 972, 204);

  // Corner lotus/star ornaments
  ctx.fillStyle = '#fde047';
  ctx.font = '46px "Noto Sans Thai", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🏮', 82, 128);
  ctx.fillText('🏮', 942, 128);

  // Main headline
  ctx.shadowColor = 'rgba(250, 204, 21, 0.75)';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 82px "Noto Sans Thai", sans-serif';
  ctx.fillText('ลอยกระทง 2569', 512, 108);

  // Subtitle
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#fdba74';
  ctx.font = '600 34px "Noto Sans Thai", sans-serif';
  ctx.fillText('✨ ลานปล่อยโคมลอย & จุดถ่ายรูปเช็คอิน ✨', 512, 186);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createReleasedLanternMesh(colorKey = 'gold') {
  const cfg = LANTERN_COLORS[colorKey] || LANTERN_COLORS.gold;
  const group = new THREE.Group();

  // Tapered Yi Peng sky lantern paper body
  const bodyMat = new THREE.MeshStandardMaterial({
    color: cfg.body,
    emissive: cfg.emissive,
    emissiveIntensity: 0.95,
    roughness: 0.55,
    transparent: true,
    opacity: 0.94,
    side: THREE.DoubleSide
  });
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.28, 0.96, 12, 1, false),
    bodyMat
  );
  body.position.y = 0.52;
  group.add(body);

  // Top dome cap
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.4),
    bodyMat
  );
  cap.position.y = 0.86;
  cap.scale.y = 0.42;
  group.add(cap);

  // Bamboo bottom rim ring
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.018, 6, 16),
    new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.85 })
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.05;
  group.add(rim);

  // Warm inner burner flame
  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xfff3b0 })
  );
  flame.scale.set(0.85, 1.35, 0.85);
  flame.position.y = 0.16;
  group.add(flame);

  // Soft warm glow halo
  const glowTex = getSharedGlowTex();
  if (glowTex) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        color: cfg.emissive,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    sprite.scale.set(2.1, 2.1, 1);
    sprite.position.y = 0.42;
    group.add(sprite);
  }

  group.userData.bodyMat = bodyMat;
  group.userData.flame = flame;
  return group;
}

export function buildLanternPlaza(scene, addCollisionBox, lowGraphics = false) {
  const { x: cx, z: cz, radius } = LANTERN_PLAZA_CONFIG;
  const root = new THREE.Group();
  root.name = 'SkyLanternPlaza';
  root.position.set(cx, 0, cz);

  const shadowCasters = [];
  const swayingLanterns = [];

  // --------------------------------------------------------------------------
  // 1. TWO-TIER CIRCULAR STONE PLAZA & GOLDEN MEDALLION
  // --------------------------------------------------------------------------
  const outerCurb = new THREE.Mesh(
    new THREE.CylinderGeometry(radius + 0.08, radius + 0.3, 0.14, 40),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.88 })
  );
  outerCurb.position.y = 0.07;
  outerCurb.receiveShadow = true;
  root.add(outerCurb);

  const stoneDeck = new THREE.Mesh(
    new THREE.CylinderGeometry(radius - 0.35, radius - 0.25, 0.18, 40),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 })
  );
  stoneDeck.position.y = 0.09;
  stoneDeck.receiveShadow = true;
  root.add(stoneDeck);

  const goldInlayMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xb45309,
    emissiveIntensity: 0.45,
    metalness: 0.45,
    roughness: 0.4
  });

  const outerGoldRing = new THREE.Mesh(new THREE.RingGeometry(radius - 0.95, radius - 0.72, 40), goldInlayMat);
  outerGoldRing.rotation.x = -Math.PI / 2;
  outerGoldRing.position.y = 0.185;
  root.add(outerGoldRing);

  const innerGoldRing = new THREE.Mesh(new THREE.RingGeometry(2.35, 2.58, 32), goldInlayMat);
  innerGoldRing.rotation.x = -Math.PI / 2;
  innerGoldRing.position.y = 0.185;
  root.add(innerGoldRing);

  // 8 subtle radial gold pavers pointing toward the 8 perimeter Lanna posts
  const spokeGeo = new THREE.PlaneGeometry(0.16, radius - 3.3);
  for (let i = 0; i < 8; i++) {
    const ang = (i + 0.5) * (Math.PI / 4);
    const rMid = 2.58 + (radius - 3.3) * 0.5;
    const spoke = new THREE.Mesh(spokeGeo, goldInlayMat);
    spoke.rotation.x = -Math.PI / 2;
    spoke.rotation.z = -ang + Math.PI / 2;
    spoke.position.set(Math.cos(ang) * rMid, 0.184, Math.sin(ang) * rMid);
    root.add(spoke);
  }

  // --------------------------------------------------------------------------
  // 2. BAMBOO CHECK-IN PHOTO ARCH "ลอยกระทง 2569" (North side of plaza, facing South)
  // --------------------------------------------------------------------------
  const archGroup = new THREE.Group();
  const archLocalZ = -4.65;
  archGroup.position.set(0, 0.18, archLocalZ);

  const bambooMat = new THREE.MeshStandardMaterial({ color: 0xb88b4a, roughness: 0.72 });
  const bambooNodeMat = new THREE.MeshStandardMaterial({ color: 0x7c5828, roughness: 0.8 });
  const fairyBulbMat = new THREE.MeshBasicMaterial({ color: 0xffe49e });
  const lannaPalette = [0xffca3a, 0xfb7185, 0xfb923c, 0x38bdf8, 0xfef08a];

  // Twin bundled bamboo pillars at X = ±2.65
  for (const side of [-1, 1]) {
    const px = side * 2.65;
    const bundleOffsets = [
      [0, 0],
      [side * 0.16, 0.1],
      [side * 0.16, -0.1]
    ];
    for (const [ox, oz] of bundleOffsets) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.08, 3.85, 8), bambooMat);
      pole.position.set(px + ox, 1.925, oz);
      archGroup.add(pole);
      shadowCasters.push(pole);
    }

    // Horizontal bamboo bindings + warm fairy light wrap along pillar
    for (let k = 0; k < 5; k++) {
      const y = 0.55 + k * 0.72;
      const tie = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 6, 12), bambooNodeMat);
      tie.rotation.x = Math.PI / 2;
      tie.position.set(px + side * 0.08, y, 0);
      archGroup.add(tie);
    }
    for (let f = 0; f < 10; f++) {
      const u = f / 9;
      const theta = u * Math.PI * 5;
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.048, 6, 6), fairyBulbMat);
      bulb.position.set(
        px + side * 0.08 + Math.cos(theta) * 0.24,
        0.5 + u * 2.95,
        Math.sin(theta) * 0.24
      );
      archGroup.add(bulb);
    }

    // Decorative planter pot with marigold blooms beside each bamboo pillar
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.28, 0.42, 10),
      new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.85 })
    );
    pot.position.set(px + side * 0.52, 0.21, 0.22);
    const shrub = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.36, 1),
      new THREE.MeshStandardMaterial({ color: 0x1e6b3a, roughness: 0.8 })
    );
    shrub.position.set(px + side * 0.52, 0.52, 0.22);
    shrub.scale.y = 0.75;
    archGroup.add(pot, shrub);

    for (let m = 0; m < 4; m++) {
      const ma = (m / 4) * Math.PI * 2;
      const bloom = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 6, 6),
        new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: 0xd97706,
          emissiveIntensity: 0.55
        })
      );
      bloom.position.set(
        px + side * 0.52 + Math.cos(ma) * 0.2,
        0.74,
        0.22 + Math.sin(ma) * 0.2
      );
      archGroup.add(bloom);
    }

    // Collision box for each bamboo pillar cluster
    addCollisionBox(
      cx + px - 0.55,
      cx + px + 0.55,
      cz + archLocalZ - 0.45,
      cz + archLocalZ + 0.55,
      `lantern-arch-post-${side > 0 ? 'r' : 'l'}`
    );
  }

  // Upper horizontal bamboo beams
  const topBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 6.2, 8), bambooMat);
  topBeam.rotation.z = Math.PI / 2;
  topBeam.position.set(0, 3.72, 0);
  archGroup.add(topBeam);
  shadowCasters.push(topBeam);

  const subBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5.6, 8), bambooMat);
  subBeam.rotation.z = Math.PI / 2;
  subBeam.position.set(0, 3.25, 0);
  archGroup.add(subBeam);

  // Glowing Check-in Banner Sign "ลอยกระทง 2569"
  const bannerTex = createCheckinBannerTexture();
  const bannerMat = new THREE.MeshStandardMaterial({
    map: bannerTex,
    emissive: new THREE.Color(0xf59e0b),
    emissiveMap: bannerTex,
    emissiveIntensity: 0.62,
    roughness: 0.35
  });
  const bannerFrame = new THREE.Mesh(new THREE.BoxGeometry(4.65, 1.15, 0.14), bannerMat);
  bannerFrame.position.set(0, 3.48, 0.14);
  archGroup.add(bannerFrame);

  // 7 colorful hanging Lanna lanterns dangling below the check-in arch
  for (let i = 0; i < 7; i++) {
    const lx = -2.1 + i * 0.7;
    const cordLen = i % 2 === 0 ? 0.48 : 0.68;
    const lanPivot = new THREE.Group();
    lanPivot.position.set(lx, 2.9, 0.14);

    const cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, cordLen, 4),
      new THREE.MeshBasicMaterial({ color: 0x292524 })
    );
    cord.position.y = -cordLen * 0.5;
    lanPivot.add(cord);

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.11, 0.32, 8),
      new THREE.MeshBasicMaterial({ color: lannaPalette[i % lannaPalette.length] })
    );
    body.position.y = -cordLen - 0.16;
    lanPivot.add(body);

    const tassel = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.16, 5),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    tassel.position.y = -cordLen - 0.38;
    lanPivot.add(tassel);

    archGroup.add(lanPivot);
    swayingLanterns.push({ pivot: lanPivot, phase: i * 0.85, amp: 0.08 });
  }

  root.add(archGroup);

  // --------------------------------------------------------------------------
  // 3. 8 PERIMETER LANNA LANTERN POSTS (Keeping N/S/E/W Walkways Wide Open)
  // --------------------------------------------------------------------------
  const postWoodMat = new THREE.MeshStandardMaterial({ color: 0x4a2f1d, roughness: 0.85 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.8 });

  for (let i = 0; i < 8; i++) {
    const ang = (i + 0.5) * (Math.PI / 4);
    const pr = radius - 0.58;
    const px = Math.cos(ang) * pr;
    const pz = Math.sin(ang) * pr;

    const postGroup = new THREE.Group();
    postGroup.position.set(px, 0.16, pz);
    // Face inward toward the center of the plaza
    postGroup.rotation.y = Math.atan2(-px, -pz);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.09, 3.15, 8), postWoodMat);
    pole.position.y = 1.575;
    postGroup.add(pole);
    shadowCasters.push(pole);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.72), postWoodMat);
    arm.position.set(0, 3.05, 0.32);
    postGroup.add(arm);

    const lanPivot = new THREE.Group();
    lanPivot.position.set(0, 3.02, 0.62);

    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 4), capMat);
    cord.position.y = -0.18;
    lanPivot.add(cord);

    const lColor = lannaPalette[i % lannaPalette.length];
    const lanBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.15, 0.42, 8),
      new THREE.MeshBasicMaterial({ color: lColor })
    );
    lanBody.position.y = -0.56;
    lanPivot.add(lanBody);

    const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.04, 8), capMat);
    topCap.position.y = -0.35;
    const botCap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 8), capMat);
    botCap.position.y = -0.77;
    lanPivot.add(topCap, botCap);

    postGroup.add(lanPivot);
    swayingLanterns.push({ pivot: lanPivot, phase: i * 1.15 + 0.4, amp: 0.1 });
    root.add(postGroup);

    // Compact post collision
    addCollisionBox(cx + px - 0.25, cx + px + 0.25, cz + pz - 0.25, cz + pz + 0.25, `lantern-post-${i}`);
  }

  // --------------------------------------------------------------------------
  // 4. CENTRAL SKY LANTERN RELEASE STAND & WARM BRAZIER
  // --------------------------------------------------------------------------
  const standGroup = new THREE.Group();
  standGroup.position.set(0, 0.18, 0);

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.76, 0.94, 0.86, 8),
    new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.72 })
  );
  pedestal.position.y = 0.43;
  standGroup.add(pedestal);
  shadowCasters.push(pedestal);

  const rimRing = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.055, 8, 24), goldInlayMat);
  rimRing.rotation.x = Math.PI / 2;
  rimRing.position.y = 0.88;
  standGroup.add(rimRing);

  // Warm central ignition flame
  const brazierFlame = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xffd166 })
  );
  brazierFlame.scale.set(0.9, 1.5, 0.9);
  brazierFlame.position.y = 1.02;
  standGroup.add(brazierFlame);

  // 3 ready-to-release display lanterns around the pedestal top
  const sampleColors = ['gold', 'pink', 'white'];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    const mini = createReleasedLanternMesh(sampleColors[i]);
    mini.scale.setScalar(0.55);
    mini.position.set(Math.cos(a) * 0.48, 0.88, Math.sin(a) * 0.48);
    standGroup.add(mini);
  }

  // Soft golden floor aura around the release stand
  const glowTex = getSharedGlowTex();
  if (glowTex) {
    const aura = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 4.6),
      new THREE.MeshBasicMaterial({
        map: glowTex,
        color: 0xffd166,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    aura.rotation.x = -Math.PI / 2;
    aura.position.y = 0.02;
    standGroup.add(aura);
  }

  root.add(standGroup);
  addCollisionBox(cx - 0.92, cx + 0.92, cz - 0.92, cz + 0.92, 'lantern-release-stand');

  // --------------------------------------------------------------------------
  // 5. WARM PLAZA POINT LIGHT
  // --------------------------------------------------------------------------
  const plazaLight = new THREE.PointLight(0xffbe55, 38, 28, 1.3);
  plazaLight.position.set(0, 4.4, -1.0);
  root.add(plazaLight);

  scene.add(root);

  const plazaState = {
    root,
    shadowCasters,
    swayingLanterns,
    brazierFlame,
    plazaLight
  };

  setLanternPlazaGraphicsMode(plazaState, lowGraphics);
  return plazaState;
}

export function setLanternPlazaGraphicsMode(plazaState, lowGraphics) {
  if (!plazaState) return;
  const low = Boolean(lowGraphics);
  for (const mesh of plazaState.shadowCasters) {
    mesh.castShadow = !low;
    mesh.receiveShadow = true;
  }
  if (plazaState.plazaLight) {
    plazaState.plazaLight.visible = !low;
  }
}

export function updateLanternPlaza(plazaState, _dt, elapsed) {
  if (!plazaState) return;
  for (const item of plazaState.swayingLanterns) {
    item.pivot.rotation.z = Math.sin(elapsed * 1.4 + item.phase) * item.amp;
    item.pivot.rotation.x = Math.cos(elapsed * 1.1 + item.phase) * (item.amp * 0.65);
  }
  if (plazaState.brazierFlame) {
    const pulse = 1 + Math.sin(elapsed * 7.5) * 0.12;
    plazaState.brazierFlame.scale.set(0.9 * pulse, 1.5 * pulse, 0.9 * pulse);
  }
}

export function drawLanternPlazaMinimap(ctx, mapX, mapY, mapW) {
  const sx = mapX(LANTERN_PLAZA_CONFIG.x);
  const sy = mapY(LANTERN_PLAZA_CONFIG.z);
  const sr = mapW(LANTERN_PLAZA_CONFIG.radius);

  ctx.save();
  ctx.fillStyle = 'rgba(245, 158, 11, 0.34)';
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Central lantern stand dot
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(sx, sy, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
