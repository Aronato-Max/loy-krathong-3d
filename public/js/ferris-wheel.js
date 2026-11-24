import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ============================================================================
// GIANT 3D TEMPLE FAIR FERRIS WHEEL (ชิงช้าสวรรค์ไฟนีออน วัดทุ่งท่าช้าง)
// Placed in Garden B (West lawn behind vendor market: X = -23.5, Z = 19.5)
// 8 Cabins x 2 Seats = Up to 16 Concurrent Riders, Deterministically Synced!
// ============================================================================

export const FERRIS_WHEEL_CONFIG = {
  x: -23.5,
  z: 19.5,
  rotY: 0.22,
  hubY: 10.2,
  radius: 6.8,
  cabinCount: 8,
  seatsPerCabin: 2,
  omega: 0.165, // rad/sec (~38.1s per full scenic revolution)
  interactX: -22.8,
  interactZ: 22.6,
  interactRadius: 4.8,
  exitX: -22.2,
  exitZ: 24.0
};

export function getFerrisWheelAngle(syncedNowMs) {
  return ((syncedNowMs * 0.001 * FERRIS_WHEEL_CONFIG.omega) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
}

function createFerrisSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 160);
  grad.addColorStop(0, '#4c1d95');
  grad.addColorStop(0.5, '#be185d');
  grad.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 160);

  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 9;
  ctx.strokeRect(8, 8, 496, 144);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 44px "Noto Sans Thai", sans-serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('🎡 ชิงช้าสวรรค์ท่าช้าง', 256, 58);

  ctx.font = '700 24px "Noto Sans Thai", sans-serif';
  ctx.fillStyle = '#fbcfe8';
  ctx.fillText('ค่าตั๋ว 5 เหรียญ • นั่งคู่เพื่อนชมวิวมุมสูง 360°!', 256, 116);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildGondolaCabin(colorHex) {
  const cabin = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.35,
    metalness: 0.15,
    emissive: colorHex,
    emissiveIntensity: 0.28
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    roughness: 0.3,
    metalness: 0.5,
    emissive: 0xb45309,
    emissiveIntensity: 0.35
  });
  const seatMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.8
  });
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.55,
    roughness: 0.35
  });

  // High, airy carnival canopy roof (1.71m clear interior headroom so NO avatar head ever clips!)
  const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.24, 6), steelMat);
  hanger.position.y = -0.11;
  cabin.add(hanger);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.04, 0.24, 6), bodyMat);
  roof.position.y = -0.22;
  roof.rotation.y = Math.PI / 6;
  cabin.add(roof);

  // 4 thin corner support struts from high roof (-0.34) down to floor (-2.05) for open 360° view!
  for (const [sx, sz] of [[-0.66, -0.48], [0.66, -0.48], [-0.66, 0.48], [0.66, 0.48]]) {
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.72, 5), steelMat);
    strut.position.set(sx, -1.19, sz);
    cabin.add(strut);
  }

  // Cabin floor & waist-high safety tub walls
  const floor = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.1, 1.08), seatMat);
  floor.position.y = -2.05;
  cabin.add(floor);

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.48, 0.07), bodyMat);
  backWall.position.set(0, -1.78, -0.51);
  cabin.add(backWall);

  const frontWall = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.36, 0.06), bodyMat);
  frontWall.position.set(0, -1.84, 0.51);
  cabin.add(frontWall);

  // Gold safety handrail right in front of the rider (visible in 1st-person view!)
  const goldBelt = new THREE.Mesh(new THREE.BoxGeometry(1.46, 0.055, 1.12), trimMat);
  goldBelt.position.set(0, -1.62, 0);
  cabin.add(goldBelt);

  for (const sx of [-0.68, 0.68]) {
    const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.44, 1.02), bodyMat);
    sideWall.position.set(sx, -1.8, 0);
    cabin.add(sideWall);
  }

  // 2-seater wooden bench inside gondola (Seat 0 = left -0.34, Seat 1 = right +0.34)
  const bench = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.12, 0.44), seatMat);
  bench.position.set(0, -1.8, -0.18);
  cabin.add(bench);

  // Warm glowing overhead lantern bulb tucked cleanly under the high canopy
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 7, 6),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  );
  bulb.position.set(0, -0.38, 0);
  cabin.add(bulb);

  return cabin;
}

function mergeSafe(geos) {
  return mergeGeometries(geos.map((g) => (g.index ? g.toNonIndexed() : g)));
}

export function buildFerrisWheel(scene, addCollisionBox) {
  const root = new THREE.Group();
  root.name = 'TempleFairFerrisWheel';
  root.position.set(FERRIS_WHEEL_CONFIG.x, 0, FERRIS_WHEEL_CONFIG.z);
  root.rotation.y = FERRIS_WHEEL_CONFIG.rotY;

  const { hubY, radius, cabinCount } = FERRIS_WHEEL_CONFIG;

  // --------------------------------------------------------------------------
  // 1) Boarding Platform, Stairs & Heavy A-Frame Support Towers
  // --------------------------------------------------------------------------
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.85 });
  const towerMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.45,
    roughness: 0.4,
    emissive: 0x1e293b,
    emissiveIntensity: 0.25
  });
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.5,
    roughness: 0.3,
    emissive: 0x92400e,
    emissiveIntensity: 0.4
  });

  const deckGeos = [];
  const baseDeck = new THREE.BoxGeometry(7.6, 0.42, 4.6);
  baseDeck.translate(0, 0.21, 0);
  deckGeos.push(baseDeck);

  // 3 front steps on local +Z (2.3 -> 3.35)
  for (let s = 0; s < 3; s++) {
    const stepH = (3 - s) * 0.13;
    const step = new THREE.BoxGeometry(3.2, stepH, 0.38);
    step.translate(0, stepH * 0.5, 2.48 + s * 0.36);
    deckGeos.push(step);
  }
  const mergedDeck = new THREE.Mesh(mergeSafe(deckGeos), deckMat);
  root.add(mergedDeck);

  // A-frame steel support legs (front z=+1.32 & back z=-1.32) + hub axle
  const towerGeos = [];
  const legLen = Math.hypot(3.2, hubY - 0.3);
  const legAngle = Math.atan2(3.2, hubY - 0.3);
  for (const zSide of [-1.32, 1.32]) {
    for (const xSign of [-1, 1]) {
      const leg = new THREE.CylinderGeometry(0.14, 0.2, legLen, 8);
      leg.rotateZ(xSign * legAngle);
      leg.translate(xSign * 1.6, 0.3 + (hubY - 0.3) * 0.5, zSide);
      towerGeos.push(leg);
    }
    const crossBar = new THREE.BoxGeometry(3.8, 0.14, 0.14);
    crossBar.translate(0, 4.2, zSide);
    towerGeos.push(crossBar);
  }
  const axle = new THREE.CylinderGeometry(0.28, 0.28, 3.1, 12);
  axle.rotateX(Math.PI / 2);
  axle.translate(0, hubY, 0);
  towerGeos.push(axle);

  // Safety railings on left, right, and back of boarding deck
  for (const rx of [-3.65, 3.65]) {
    const sRail = new THREE.BoxGeometry(0.08, 0.85, 4.4);
    sRail.translate(rx, 0.84, 0);
    towerGeos.push(sRail);
  }
  const bRail = new THREE.BoxGeometry(7.3, 0.85, 0.08);
  bRail.translate(0, 0.84, -2.2);
  towerGeos.push(bRail);

  // Entrance sign posts
  for (const px of [-1.75, 1.75]) {
    const sp = new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8);
    sp.translate(px, 1.6, 2.35);
    towerGeos.push(sp);
  }
  const mergedTowers = new THREE.Mesh(mergeSafe(towerGeos), towerMat);
  root.add(mergedTowers);

  // Glowing Entrance Arch Signboard
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3.9, 1.15),
    new THREE.MeshBasicMaterial({ map: createFerrisSignTexture(), side: THREE.DoubleSide })
  );
  signMesh.position.set(0, 3.35, 2.38);
  root.add(signMesh);

  // --------------------------------------------------------------------------
  // 2) Rotating Neon Wheel Rotor (Merged into just 3 Draw Calls!)
  // --------------------------------------------------------------------------
  const wheelRotor = new THREE.Group();
  wheelRotor.position.set(0, hubY, 0);
  root.add(wheelRotor);

  const rimGeos = [];
  for (const rz of [-0.68, 0.68]) {
    const outerRim = new THREE.TorusGeometry(radius, 0.11, 8, 40);
    outerRim.translate(0, 0, rz);
    rimGeos.push(outerRim);

    const innerRim = new THREE.TorusGeometry(radius * 0.56, 0.07, 6, 32);
    innerRim.translate(0, 0, rz);
    rimGeos.push(innerRim);

    // 16 radial steel spokes per side
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const spoke = new THREE.CylinderGeometry(0.04, 0.04, radius * 2, 5);
      spoke.rotateZ(a);
      spoke.translate(0, 0, rz);
      rimGeos.push(spoke);
    }
  }
  // 8 horizontal crossbars where the 8 cabins hang!
  for (let c = 0; c < cabinCount; c++) {
    const a = (c / cabinCount) * Math.PI * 2 - Math.PI / 2;
    const bar = new THREE.CylinderGeometry(0.05, 0.05, 1.42, 6);
    bar.rotateX(Math.PI / 2);
    bar.translate(Math.cos(a) * radius, Math.sin(a) * radius, 0);
    rimGeos.push(bar);
  }
  const wheelFrameMesh = new THREE.Mesh(mergeSafe(rimGeos), goldTrimMat);
  wheelRotor.add(wheelFrameMesh);

  // Glowing Neon Tubes & Starburst Bulbs around the Wheel (color-cycling!)
  const neonGeos = [];
  for (const rz of [-0.74, 0.74]) {
    const neonRing = new THREE.TorusGeometry(radius * 0.98, 0.055, 6, 40);
    neonRing.translate(0, 0, rz);
    neonGeos.push(neonRing);
    const innerNeon = new THREE.TorusGeometry(radius * 0.56, 0.045, 6, 32);
    innerNeon.translate(0, 0, rz);
    neonGeos.push(innerNeon);
  }
  const hubStar = new THREE.OctahedronGeometry(0.72, 0);
  neonGeos.push(hubStar);

  const neonMat = new THREE.MeshBasicMaterial({ color: 0xf472b6 });
  const neonMesh = new THREE.Mesh(mergeSafe(neonGeos), neonMat);
  wheelRotor.add(neonMesh);

  // 24 bright warm/cyan bulbs dotting the outer rim
  const bulbGeos = [];
  for (let b = 0; b < 24; b++) {
    const a = (b / 24) * Math.PI * 2;
    for (const rz of [-0.76, 0.76]) {
      const sp = new THREE.SphereGeometry(0.11, 6, 5);
      sp.translate(Math.cos(a) * radius, Math.sin(a) * radius, rz);
      bulbGeos.push(sp);
    }
  }
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  wheelRotor.add(new THREE.Mesh(mergeSafe(bulbGeos), bulbMat));

  // --------------------------------------------------------------------------
  // 3) 8 Counter-Rotating Colorful Gondola Cabins (Always Stay Upright!)
  // --------------------------------------------------------------------------
  const cabinColors = [
    0xf43f5e, // Rose pink
    0x38bdf8, // Sky cyan
    0xfacc15, // Golden yellow
    0xa855f7, // Vivid purple
    0x4ade80, // Emerald green
    0xf97316, // Warm orange
    0xec4899, // Hot magenta
    0x22d3ee  // Electric aqua
  ];
  const cabins = [];
  for (let c = 0; c < cabinCount; c++) {
    const baseAngle = (c / cabinCount) * Math.PI * 2 - Math.PI / 2;
    const pivot = new THREE.Group();
    pivot.position.set(Math.cos(baseAngle) * radius, Math.sin(baseAngle) * radius, 0);
    const cabinMesh = buildGondolaCabin(cabinColors[c % cabinColors.length]);
    pivot.add(cabinMesh);
    wheelRotor.add(pivot);
    cabins.push({ index: c, baseAngle, pivot, cabinMesh });
  }

  scene.add(root);

  // Collide cleanly with the heavy base deck so walking around feels solid
  if (typeof addCollisionBox === 'function') {
    addCollisionBox(
      FERRIS_WHEEL_CONFIG.x - 3.6,
      FERRIS_WHEEL_CONFIG.x + 3.6,
      FERRIS_WHEEL_CONFIG.z - 2.3,
      FERRIS_WHEEL_CONFIG.z + 2.3,
      'ferris-wheel-base'
    );
  }

  return {
    root,
    wheelRotor,
    neonMat,
    cabins,
    currentAngle: 0
  };
}

const _neonHsl = { h: 0, s: 0.92, l: 0.62 };

export function updateFerrisWheel(ferrisState, syncedNowMs, elapsed) {
  if (!ferrisState) return;
  const angle = getFerrisWheelAngle(syncedNowMs);
  ferrisState.currentAngle = angle;
  ferrisState.wheelRotor.rotation.z = angle;

  // Counter-rotate each gondola + subtle gentle breeze sway so cabins stay level with the ground!
  const sway = Math.sin(elapsed * 1.4) * 0.03;
  for (let i = 0; i < ferrisState.cabins.length; i++) {
    ferrisState.cabins[i].pivot.rotation.z = -angle + sway;
  }

  // Smooth festive rainbow neon color cycle on the giant wheel rim!
  _neonHsl.h = (elapsed * 0.08) % 1;
  ferrisState.neonMat.color.setHSL(_neonHsl.h, _neonHsl.s, _neonHsl.l);
}

// Compute exact world-space seat position & facing yaw for any rider (Cabin 0..7, Seat 0..1)
export function getFerrisSeatWorldPos(ferrisState, cabinIdx, seatIdx, outPos) {
  const cfg = FERRIS_WHEEL_CONFIG;
  const angle = ferrisState ? ferrisState.currentAngle : 0;
  const c = ((cabinIdx % cfg.cabinCount) + cfg.cabinCount) % cfg.cabinCount;
  const theta = angle + (c / cfg.cabinCount) * Math.PI * 2 - Math.PI / 2;

  // Local coordinates relative to Ferris Wheel root (before rotY)
  const localPivotX = Math.cos(theta) * cfg.radius;
  const localPivotY = cfg.hubY + Math.sin(theta) * cfg.radius;

  const seatOffsetX = seatIdx === 1 ? 0.34 : -0.34;
  const lx = localPivotX + seatOffsetX;
  const ly = localPivotY - 1.98; // Feet rest on cabin floor (-2.05); >0.45m headroom below roof!
  const lz = -0.06;

  const cosY = Math.cos(cfg.rotY);
  const sinY = Math.sin(cfg.rotY);
  outPos.set(
    cfg.x + lx * cosY + lz * sinY,
    ly,
    cfg.z - lx * sinY + lz * cosY
  );
  return cfg.rotY; // Riders face outward (+Z of Ferris Wheel) overlooking the festival!
}

export function drawFerrisWheelMinimap(ctx, mapX, mapY) {
  const cx = mapX(FERRIS_WHEEL_CONFIG.x);
  const cy = mapY(FERRIS_WHEEL_CONFIG.z);
  ctx.save();
  ctx.strokeStyle = '#f472b6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(cx, cy, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
