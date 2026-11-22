import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ============================================================================
// CONCERT SEATING & LIVE SEATED AUDIENCE
// - 140 Classic Thai White Plastic Monobloc Chairs (1 InstancedMesh)
// - ~52 Animated Seated NPC Concertgoers swaying & waving lightsticks (5 InstancedMeshes)
// - ~88 Interactive Empty White Chairs that real players can sit on (Press E)!
// ============================================================================

export const CONCERT_CHAIRS_CONFIG = {
  blocks: [
    { startX: -29.8, cols: 10 },
    { startX: -16.6, cols: 10 }
  ],
  colSpacing: 0.94,
  rows: 7,
  startZ: -32.4, // Front row just south of the cross-road (Z=-35)
  rowSpacing: 1.75 // Walkable alleys between rows (ending at Z=-21.9)
};

function mergeColoredParts(specs) {
  const parts = [];
  for (const s of specs) {
    const g = s.geo.index ? s.geo.toNonIndexed() : s.geo.clone();
    s.geo.dispose();
    const mat = new THREE.Matrix4().compose(
      new THREE.Vector3(s.x || 0, s.y || 0, s.z || 0),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(s.rx || 0, s.ry || 0, s.rz || 0)),
      new THREE.Vector3(s.sx || 1, s.sy || 1, s.sz || 1)
    );
    g.applyMatrix4(mat);
    for (const k of Object.keys(g.attributes)) {
      if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
    }
    const count = g.attributes.position.count;
    const col = new THREE.Color(s.color ?? 0xffffff);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    parts.push(g);
  }
  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  return merged;
}

function buildSingleWhiteChairGeometry() {
  const seatY = 0.44;
  const seatW = 0.44;
  const seatD = 0.43;
  const whiteTop = 0xf7faff;
  const whiteRim = 0xe8edf5;
  const whiteLeg = 0xdde3ed;
  const slotDark = 0x384254;

  const specs = [
    // Moulded seat pan + waterfall apron rim
    { geo: new THREE.BoxGeometry(seatW, 0.044, seatD), y: seatY, color: whiteTop },
    { geo: new THREE.BoxGeometry(seatW, 0.055, 0.03), y: seatY - 0.025, z: -seatD * 0.5 + 0.012, color: whiteRim },
    { geo: new THREE.BoxGeometry(seatW, 0.05, 0.03), y: seatY - 0.022, z: seatD * 0.5 - 0.012, color: whiteRim },
    { geo: new THREE.BoxGeometry(0.03, 0.05, seatD), x: -seatW * 0.5 + 0.012, y: seatY - 0.022, color: whiteRim },
    { geo: new THREE.BoxGeometry(0.03, 0.05, seatD), x: seatW * 0.5 - 0.012, y: seatY - 0.022, color: whiteRim }
  ];

  // Classic 2x3 dark drainage/ventilation slots on top of seat
  for (const sz of [-0.045, 0.035]) {
    for (const sx of [-0.085, 0, 0.085]) {
      specs.push({ geo: new THREE.BoxGeometry(0.044, 0.005, 0.014), x: sx, y: seatY + 0.023, z: sz, color: slotDark });
    }
  }

  // 4 Tapered & Flared Legs
  const legX = seatW * 0.5 - 0.036;
  const legZ = seatD * 0.5 - 0.036;
  specs.push(
    { geo: new THREE.CylinderGeometry(0.028, 0.017, seatY, 6), x: -legX, y: seatY * 0.5, z: -legZ, rx: -0.06, rz: 0.06, color: whiteLeg },
    { geo: new THREE.CylinderGeometry(0.028, 0.017, seatY, 6), x: legX, y: seatY * 0.5, z: -legZ, rx: -0.06, rz: -0.06, color: whiteLeg },
    { geo: new THREE.CylinderGeometry(0.028, 0.017, seatY, 6), x: -legX, y: seatY * 0.5, z: legZ, rx: 0.08, rz: 0.06, color: whiteLeg },
    { geo: new THREE.CylinderGeometry(0.028, 0.017, seatY, 6), x: legX, y: seatY * 0.5, z: legZ, rx: 0.08, rz: -0.06, color: whiteLeg }
  );

  // Reclined Backrest with Dual Side Cutouts, Center Spine & Top Handle Slot
  const backTilt = 0.16;
  const backZ = seatD * 0.5 - 0.015;
  const backH = 0.42;
  specs.push(
    { geo: new THREE.BoxGeometry(0.048, backH, 0.028), x: -seatW * 0.5 + 0.026, y: seatY + backH * 0.5, z: backZ + 0.032, rx: backTilt, rz: -0.04, color: whiteTop },
    { geo: new THREE.BoxGeometry(0.048, backH, 0.028), x: seatW * 0.5 - 0.026, y: seatY + backH * 0.5, z: backZ + 0.032, rx: backTilt, rz: 0.04, color: whiteTop },
    { geo: new THREE.BoxGeometry(0.095, backH - 0.06, 0.026), y: seatY + (backH - 0.06) * 0.5, z: backZ + 0.028, rx: backTilt, color: whiteTop },
    { geo: new THREE.BoxGeometry(seatW - 0.04, 0.065, 0.028), y: seatY + backH - 0.075, z: backZ + 0.056, rx: backTilt, color: whiteTop },
    { geo: new THREE.BoxGeometry(seatW - 0.07, 0.032, 0.028), y: seatY + backH + 0.012, z: backZ + 0.069, rx: backTilt, color: whiteTop },
    { geo: new THREE.BoxGeometry(0.09, 0.06, 0.028), x: -0.13, y: seatY + backH - 0.025, z: backZ + 0.064, rx: backTilt, color: whiteTop },
    { geo: new THREE.BoxGeometry(0.09, 0.06, 0.028), x: 0.13, y: seatY + backH - 0.025, z: backZ + 0.064, rx: backTilt, color: whiteTop }
  );

  return mergeColoredParts(specs);
}

// ----------------------------------------------------------------------------
// Seated NPC Concertgoer Geometries (Facing local -Z = North toward stage!)
// ----------------------------------------------------------------------------

function buildSeatedNpcBodyGeo() {
  // Hips seated neatly at y=0.50, thighs forward (-Z), shins down to shoes, torso leaning slightly back
  return mergeColoredParts([
    // Shoes resting on grass in front of chair
    { geo: new THREE.BoxGeometry(0.1, 0.065, 0.16), x: -0.095, y: 0.035, z: -0.32, color: 0x1e293b },
    { geo: new THREE.BoxGeometry(0.1, 0.065, 0.16), x: 0.095, y: 0.035, z: -0.32, color: 0x1e293b },
    // Lower legs (shins vertical)
    { geo: new THREE.CylinderGeometry(0.058, 0.048, 0.42, 7), x: -0.095, y: 0.25, z: -0.28, color: 0x334155 },
    { geo: new THREE.CylinderGeometry(0.058, 0.048, 0.42, 7), x: 0.095, y: 0.25, z: -0.28, color: 0x334155 },
    // Thighs horizontal on white chair seat
    { geo: new THREE.CylinderGeometry(0.068, 0.06, 0.34, 7), x: -0.095, y: 0.49, z: -0.11, rx: Math.PI / 2, color: 0x334155 },
    { geo: new THREE.CylinderGeometry(0.068, 0.06, 0.34, 7), x: 0.095, y: 0.49, z: -0.11, rx: Math.PI / 2, color: 0x334155 },
    // Seated pelvis
    { geo: new THREE.BoxGeometry(0.32, 0.13, 0.22), y: 0.51, z: 0.04, color: 0x334155 },
    // Shirt torso (white -> tinted per NPC via setColorAt!)
    { geo: new THREE.BoxGeometry(0.34, 0.44, 0.2), y: 0.77, z: 0.07, rx: 0.1, color: 0xffffff },
    // Left arm resting casually on left thigh
    { geo: new THREE.CylinderGeometry(0.05, 0.044, 0.18, 7), x: -0.21, y: 0.86, z: 0.05, rz: 0.16, color: 0xffffff },
    { geo: new THREE.CylinderGeometry(0.042, 0.036, 0.25, 7), x: -0.22, y: 0.68, z: -0.04, rx: 0.65, color: 0xf1c29b },
    { geo: new THREE.SphereGeometry(0.042, 6, 5), x: -0.2, y: 0.57, z: -0.14, color: 0xf1c29b }
  ]);
}

function buildSeatedNpcHeadGeo() {
  // Facing local -Z (North toward stage!)
  return mergeColoredParts([
    { geo: new THREE.CylinderGeometry(0.05, 0.056, 0.08, 7), y: 0.03, color: 0xe6b48c },
    { geo: new THREE.SphereGeometry(0.138, 10, 8), y: 0.17, sy: 1.05, color: 0xf5c8a2 },
    { geo: new THREE.SphereGeometry(0.015, 5, 5), x: -0.048, y: 0.185, z: -0.125, color: 0x111827 },
    { geo: new THREE.SphereGeometry(0.015, 5, 5), x: 0.048, y: 0.185, z: -0.125, color: 0x111827 },
    { geo: new THREE.BoxGeometry(0.046, 0.013, 0.012), y: 0.132, z: -0.128, color: 0xb91c1c }
  ]);
}

function buildSeatedNpcCapGeo() {
  return mergeColoredParts([
    { geo: new THREE.SphereGeometry(0.144, 9, 7), y: 0.19, z: 0.02, color: 0x1f1916 },
    { geo: new THREE.SphereGeometry(0.148, 9, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), y: 0.21, color: 0xffffff },
    { geo: new THREE.BoxGeometry(0.18, 0.02, 0.12), y: 0.22, z: -0.14, rx: -0.14, color: 0xffffff }
  ]);
}

function buildSeatedNpcHairGeo() {
  return mergeColoredParts([
    { geo: new THREE.SphereGeometry(0.148, 9, 7), y: 0.195, z: 0.015, color: 0x1c1512 },
    { geo: new THREE.SphereGeometry(0.072, 7, 6), y: 0.24, z: 0.155, color: 0x1c1512 },
    { geo: new THREE.TorusGeometry(0.056, 0.015, 5, 10), y: 0.24, z: 0.135, color: 0xffffff }
  ]);
}

function buildSeatedNpcRightArmGeo() {
  // Pivot at right shoulder (+0.21, 0.94, 0.06) extending upward/forward when waving!
  return mergeColoredParts([
    { geo: new THREE.CylinderGeometry(0.05, 0.042, 0.18, 6), y: -0.08, color: 0xffffff },
    { geo: new THREE.CylinderGeometry(0.04, 0.034, 0.26, 6), y: -0.25, z: -0.05, rx: 0.35, color: 0xf1c29b },
    { geo: new THREE.SphereGeometry(0.042, 6, 5), y: -0.38, z: -0.11, color: 0xf1c29b }
  ]);
}

export function buildConcertChairs(scene, addCollisionBox) {
  const root = new THREE.Group();
  root.name = 'ConcertWhitePlasticChairs';

  const chairGeo = buildSingleWhiteChairGeometry();
  const chairMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.38,
    metalness: 0.04,
    emissive: new THREE.Color(0x2c3545),
    emissiveIntensity: 0.42
  });

  const totalChairs =
    CONCERT_CHAIRS_CONFIG.blocks.reduce((sum, b) => sum + b.cols, 0) * CONCERT_CHAIRS_CONFIG.rows;
  const inst = new THREE.InstancedMesh(chairGeo, chairMat, totalChairs);
  inst.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const tmpColor = new THREE.Color();
  const chairs = [];
  const npcList = [];
  const capNpcs = [];
  const hairNpcs = [];
  const glowNpcs = [];

  const shirtPalette = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0xec4899, 0x8b5cf6, 0x06b6d4, 0xf97316, 0xfef08a, 0xf43f5e];
  const hatPalette = [0xdc2626, 0x2563eb, 0xf59e0b, 0x059669, 0xdb2777, 0x1e293b, 0xf8fafc];
  const glowPalette = [0x22d3ee, 0xf472b6, 0xfacc15, 0x4ade80, 0xc084fc];

  let idx = 0;

  for (let bIdx = 0; bIdx < CONCERT_CHAIRS_CONFIG.blocks.length; bIdx++) {
    const blk = CONCERT_CHAIRS_CONFIG.blocks[bIdx];
    const minX = blk.startX - 0.25;
    const maxX = blk.startX + (blk.cols - 1) * CONCERT_CHAIRS_CONFIG.colSpacing + 0.25;

    for (let r = 0; r < CONCERT_CHAIRS_CONFIG.rows; r++) {
      const rowZ = CONCERT_CHAIRS_CONFIG.startZ + r * CONCERT_CHAIRS_CONFIG.rowSpacing;

      if (typeof addCollisionBox === 'function') {
        addCollisionBox(minX, maxX, rowZ - 0.22, rowZ + 0.22, 'concert-chair-row');
      }

      for (let c = 0; c < blk.cols; c++) {
        const seed = bIdx * 131 + r * 37 + c * 17;
        const jx = Math.sin(seed * 12.9898) * 0.5 * 0.05;
        const jz = Math.cos(seed * 78.233) * 0.5 * 0.05;
        const jRot = Math.sin(seed * 43.12) * 0.5 * 0.08;

        const cx = blk.startX + c * CONCERT_CHAIRS_CONFIG.colSpacing + jx;
        const cz = rowZ + jz;
        const chairId = `chair-${bIdx}-${r}-${c}`;

        dummy.position.set(cx, 0, cz);
        dummy.rotation.set(0, jRot, 0);
        dummy.scale.setScalar(1.0);
        dummy.updateMatrix();
        inst.setMatrixAt(idx, dummy.matrix);

        const shade = 0.94 + ((seed % 7) / 6) * 0.06;
        tmpColor.setRGB(shade, shade, Math.min(1, shade + 0.01));
        inst.setColorAt(idx, tmpColor);

        // Deterministic organic concert crowd (~52 seated NPCs, leaving ~88 empty seats including front-row/aisle seats for players!)
        const hash = Math.abs(Math.sin(seed * 91.37)) % 1;
        const rowWeight = r <= 2 ? 0.45 : r <= 4 ? 0.38 : 0.26;
        const isAisleFrontSeat = (bIdx === 0 && c === 9 && r <= 2) || (bIdx === 1 && c === 0 && r <= 2);
        const hasNpc = !isAisleFrontSeat && hash < rowWeight;

        const chairObj = { id: chairId, x: cx, z: cz, rotY: jRot, hasNpc };
        chairs.push(chairObj);

        if (hasNpc) {
          const isCap = npcList.length % 2 === 0;
          const hasGlow = npcList.length % 2 === 0 || r <= 2;
          const npc = {
            npcIdx: npcList.length,
            x: cx,
            z: cz,
            rotY: jRot,
            phase: seed * 0.41,
            isCap,
            hatSubIdx: isCap ? capNpcs.length : hairNpcs.length,
            hasGlow,
            glowSubIdx: hasGlow ? glowNpcs.length : -1,
            shirtColor: shirtPalette[(seed * 3) % shirtPalette.length],
            hatColor: hatPalette[(seed * 5) % hatPalette.length],
            glowColor: glowPalette[(seed * 7) % glowPalette.length]
          };
          if (isCap) capNpcs.push(npc);
          else hairNpcs.push(npc);
          if (hasGlow) glowNpcs.push(npc);
          npcList.push(npc);
        }

        idx++;
      }
    }
  }

  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  root.add(inst);

  // ---- Build Seated NPC Concertgoers (~52 fans in 5 InstancedMeshes = 5 Draw Calls!) ----
  const npcCount = npcList.length;
  const npcMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.65,
    emissive: 0x221d1a,
    emissiveIntensity: 0.34
  });
  const npcHeadMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.6,
    emissive: 0x2a1f18,
    emissiveIntensity: 0.36
  });

  const npcBodyInst = new THREE.InstancedMesh(buildSeatedNpcBodyGeo(), npcMat, Math.max(1, npcCount));
  const npcHeadInst = new THREE.InstancedMesh(buildSeatedNpcHeadGeo(), npcHeadMat, Math.max(1, npcCount));
  const npcArmInst = new THREE.InstancedMesh(buildSeatedNpcRightArmGeo(), npcMat, Math.max(1, npcCount));
  const npcCapInst = new THREE.InstancedMesh(buildSeatedNpcCapGeo(), npcMat, Math.max(1, capNpcs.length));
  const npcHairInst = new THREE.InstancedMesh(buildSeatedNpcHairGeo(), npcMat, Math.max(1, hairNpcs.length));
  const npcGlowInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.34, 6),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    Math.max(1, glowNpcs.length)
  );

  npcList.forEach((n) => {
    dummy.position.set(n.x, 0, n.z);
    dummy.rotation.set(0, n.rotY, 0);
    dummy.scale.setScalar(1.0);
    dummy.updateMatrix();
    npcBodyInst.setMatrixAt(n.npcIdx, dummy.matrix);
    npcBodyInst.setColorAt(n.npcIdx, tmpColor.setHex(n.shirtColor));

    dummy.position.set(n.x, 1.0, n.z + 0.09);
    dummy.rotation.set(0, n.rotY, 0);
    dummy.updateMatrix();
    npcHeadInst.setMatrixAt(n.npcIdx, dummy.matrix);
    if (n.isCap) {
      npcCapInst.setMatrixAt(n.hatSubIdx, dummy.matrix);
      npcCapInst.setColorAt(n.hatSubIdx, tmpColor.setHex(n.hatColor));
    } else {
      npcHairInst.setMatrixAt(n.hatSubIdx, dummy.matrix);
      npcHairInst.setColorAt(n.hatSubIdx, tmpColor.setHex(n.hatColor));
    }

    const cosR = Math.cos(n.rotY);
    const sinR = Math.sin(n.rotY);
    n.shoulderX = n.x + cosR * 0.21 + sinR * 0.06;
    n.shoulderZ = n.z - sinR * 0.21 + cosR * 0.06;

    dummy.position.set(n.shoulderX, 0.94, n.shoulderZ);
    dummy.rotation.set(2.4, n.rotY, 0);
    dummy.updateMatrix();
    npcArmInst.setMatrixAt(n.npcIdx, dummy.matrix);
    npcArmInst.setColorAt(n.npcIdx, tmpColor.setHex(n.shirtColor));

    if (n.hasGlow) {
      dummy.position.set(n.shoulderX, 1.38, n.shoulderZ - 0.12);
      dummy.rotation.set(0.2, n.rotY, 0);
      dummy.updateMatrix();
      npcGlowInst.setMatrixAt(n.glowSubIdx, dummy.matrix);
      npcGlowInst.setColorAt(n.glowSubIdx, tmpColor.setHex(n.glowColor));
    }
  });

  [npcBodyInst, npcHeadInst, npcArmInst, npcCapInst, npcHairInst, npcGlowInst].forEach((m) => {
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    root.add(m);
  });

  scene.add(root);

  const chairById = new Map(chairs.map((c) => [c.id, c]));

  return {
    root,
    inst,
    chairs,
    chairById,
    npcList,
    npcHeadInst,
    npcArmInst,
    npcCapInst,
    npcHairInst,
    npcGlowInst,
    count: totalChairs
  };
}

const _audDummy = new THREE.Object3D();

export function updateConcertAudience(chairsState, camera, elapsed) {
  if (!chairsState || !chairsState.npcList || chairsState.npcList.length === 0) return;

  // Distance-cull audience animation when camera is far from the concert lawn (center ≈ -18.5, -27)
  const dxC = camera.position.x + 18.5;
  const dzC = camera.position.z + 27.0;
  if (dxC * dxC + dzC * dzC > 38 * 38) return;

  const { npcList, npcHeadInst, npcArmInst, npcCapInst, npcHairInst, npcGlowInst } = chairsState;

  for (let i = 0; i < npcList.length; i++) {
    const n = npcList[i];
    const beat = elapsed * 4.2 + n.phase;
    const sway = Math.sin(beat * 0.5) * 0.12;
    const nod = Math.sin(beat) * 0.08;

    // Head + Cap/Hair swaying to the concert music
    _audDummy.position.set(n.x, 1.0 + Math.abs(Math.sin(beat)) * 0.015, n.z + 0.09);
    _audDummy.rotation.set(nod, n.rotY + sway, sway * 0.45);
    _audDummy.scale.setScalar(1.0);
    _audDummy.updateMatrix();
    npcHeadInst.setMatrixAt(n.npcIdx, _audDummy.matrix);
    if (n.isCap) npcCapInst.setMatrixAt(n.hatSubIdx, _audDummy.matrix);
    else npcHairInst.setMatrixAt(n.hatSubIdx, _audDummy.matrix);

    // Right arm waving glowstick or clapping along!
    if (n.hasGlow) {
      const waveZ = Math.sin(beat * 0.85) * 0.42;
      _audDummy.position.set(n.shoulderX, 0.94, n.shoulderZ);
      _audDummy.rotation.set(0, n.rotY, 0);
      _audDummy.rotateX(2.55);
      _audDummy.rotateZ(waveZ);
      _audDummy.updateMatrix();
      npcArmInst.setMatrixAt(n.npcIdx, _audDummy.matrix);

      // Glowing neon lightstick tip moving smoothly with the waving hand
      _audDummy.position.set(
        n.shoulderX + Math.sin(waveZ) * 0.36,
        1.36 + Math.cos(waveZ) * 0.06,
        n.shoulderZ - 0.14
      );
      _audDummy.rotation.set(0.22, n.rotY, -waveZ * 0.9);
      _audDummy.updateMatrix();
      npcGlowInst.setMatrixAt(n.glowSubIdx, _audDummy.matrix);
    } else {
      const clapX = 0.75 + Math.sin(beat) * 0.25;
      _audDummy.position.set(n.shoulderX, 0.94, n.shoulderZ);
      _audDummy.rotation.set(0, n.rotY, 0);
      _audDummy.rotateX(clapX);
      _audDummy.updateMatrix();
      npcArmInst.setMatrixAt(n.npcIdx, _audDummy.matrix);
    }
  }

  npcHeadInst.instanceMatrix.needsUpdate = true;
  npcArmInst.instanceMatrix.needsUpdate = true;
  npcCapInst.instanceMatrix.needsUpdate = true;
  npcHairInst.instanceMatrix.needsUpdate = true;
  npcGlowInst.instanceMatrix.needsUpdate = true;
}

export function findNearestEmptyChair(chairsState, playerPos, occupiedChairIds, maxRadius = 1.65) {
  if (!chairsState || !playerPos) return null;
  let best = null;
  let bestDistSq = maxRadius * maxRadius;
  const list = chairsState.chairs;
  for (let i = 0; i < list.length; i++) {
    const ch = list[i];
    if (ch.hasNpc) continue;
    if (occupiedChairIds && occupiedChairIds.has(ch.id)) continue;
    const dx = playerPos.x - ch.x;
    const dz = playerPos.z - ch.z;
    const dSq = dx * dx + dz * dz;
    if (dSq < bestDistSq) {
      bestDistSq = dSq;
      best = ch;
    }
  }
  return best;
}

export function drawConcertChairsMinimap(ctx, mapX, mapY, mapW, mapH) {
  ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
  for (const blk of CONCERT_CHAIRS_CONFIG.blocks) {
    const x0 = mapX(blk.startX - 0.25);
    const w = mapW((blk.cols - 1) * CONCERT_CHAIRS_CONFIG.colSpacing + 0.5);
    for (let r = 0; r < CONCERT_CHAIRS_CONFIG.rows; r++) {
      const z = CONCERT_CHAIRS_CONFIG.startZ + r * CONCERT_CHAIRS_CONFIG.rowSpacing;
      ctx.fillRect(x0, mapY(z - 0.25), w, Math.max(1.2, mapH(0.5)));
    }
  }
}
