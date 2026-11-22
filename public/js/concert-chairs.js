import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ============================================================================
// CONCERT SEATING — Classic Thai White Plastic Monobloc Chairs (เก้าอี้พลาสติกขาวงานวัด)
// Placed in neat rows inside the front-of-stage lawn (X: -30..-7, Z: -32.4..-21.9)
// facing North (-Z) directly toward the Concert Stage, rendered via 1 InstancedMesh!
// ============================================================================

export const CONCERT_CHAIRS_CONFIG = {
  // 2 symmetrical blocks (West & East) with a wide 2.8m center aisle leading to the stage
  blocks: [
    { startX: -29.8, cols: 10 },
    { startX: -16.6, cols: 10 }
  ],
  colSpacing: 0.94,
  rows: 7,
  startZ: -32.4, // Front row just south of the cross-road (Z=-35)
  rowSpacing: 1.75 // Walkable rows ending at Z=-21.9 (clear of U-stalls!)
};

function buildSingleWhiteChairGeometry() {
  const parts = [];

  const pushPart = (geo, tx = 0, ty = 0, tz = 0, rx = 0, ry = 0, rz = 0, rgb = [0.96, 0.97, 0.99]) => {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    geo.dispose();
    const mat = new THREE.Matrix4().compose(
      new THREE.Vector3(tx, ty, tz),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
      new THREE.Vector3(1, 1, 1)
    );
    g.applyMatrix4(mat);
    for (const key of Object.keys(g.attributes)) {
      if (key !== 'position' && key !== 'normal') {
        g.deleteAttribute(key);
      }
    }
    const count = g.attributes.position.count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      colors[i * 3] = rgb[0];
      colors[i * 3 + 1] = rgb[1];
      colors[i * 3 + 2] = rgb[2];
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    parts.push(g);
  };

  // Seat dimensions: 0.44m wide x 0.43m deep at y = 0.44m (chair faces local -Z)
  const seatY = 0.44;
  const seatW = 0.44;
  const seatD = 0.43;
  const whiteTop = [0.97, 0.98, 1.0];
  const whiteRim = [0.91, 0.93, 0.96];
  const whiteLeg = [0.87, 0.89, 0.93];
  const slotDark = [0.22, 0.26, 0.33];

  // 1. Moulded Seat Pan + Waterfall Apron Rim
  pushPart(new THREE.BoxGeometry(seatW, 0.044, seatD), 0, seatY, 0, 0, 0, 0, whiteTop);
  pushPart(new THREE.BoxGeometry(seatW, 0.055, 0.03), 0, seatY - 0.025, -seatD * 0.5 + 0.012, 0, 0, 0, whiteRim);
  pushPart(new THREE.BoxGeometry(seatW, 0.05, 0.03), 0, seatY - 0.022, seatD * 0.5 - 0.012, 0, 0, 0, whiteRim);
  pushPart(new THREE.BoxGeometry(0.03, 0.05, seatD), -seatW * 0.5 + 0.012, seatY - 0.022, 0, 0, 0, 0, whiteRim);
  pushPart(new THREE.BoxGeometry(0.03, 0.05, seatD), seatW * 0.5 - 0.012, seatY - 0.022, 0, 0, 0, 0, whiteRim);

  // Classic 2x3 dark drainage/ventilation slots recessed neatly on top of the seat
  for (const sz of [-0.045, 0.035]) {
    for (const sx of [-0.085, 0, 0.085]) {
      pushPart(new THREE.BoxGeometry(0.044, 0.005, 0.014), sx, seatY + 0.023, sz, 0, 0, 0, slotDark);
    }
  }

  // 2. Four Tapered & Slightly Flared Monobloc Plastic Legs
  const legGeoFactory = () => new THREE.CylinderGeometry(0.028, 0.017, seatY, 6);
  const legX = seatW * 0.5 - 0.036;
  const legZ = seatD * 0.5 - 0.036;
  pushPart(legGeoFactory(), -legX, seatY * 0.5, -legZ, -0.06, 0, 0.06, whiteLeg);
  pushPart(legGeoFactory(), legX, seatY * 0.5, -legZ, -0.06, 0, -0.06, whiteLeg);
  pushPart(legGeoFactory(), -legX, seatY * 0.5, legZ, 0.08, 0, 0.06, whiteLeg);
  pushPart(legGeoFactory(), legX, seatY * 0.5, legZ, 0.08, 0, -0.06, whiteLeg);

  // 3. Reclined Backrest Frame with Dual Tall Side Cutouts, Center Spine & Top Handle Slot
  const backTilt = 0.16;
  const backZ = seatD * 0.5 - 0.015;
  const backH = 0.42;

  // Left & right outer vertical rails
  pushPart(
    new THREE.BoxGeometry(0.048, backH, 0.028),
    -seatW * 0.5 + 0.026,
    seatY + backH * 0.5,
    backZ + 0.032,
    backTilt,
    0,
    -0.04,
    whiteTop
  );
  pushPart(
    new THREE.BoxGeometry(0.048, backH, 0.028),
    seatW * 0.5 - 0.026,
    seatY + backH * 0.5,
    backZ + 0.032,
    backTilt,
    0,
    0.04,
    whiteTop
  );

  // Tapered central vertical spine (leaves 2 tall open cutouts on left & right!)
  pushPart(
    new THREE.BoxGeometry(0.095, backH - 0.06, 0.026),
    0,
    seatY + (backH - 0.06) * 0.5,
    backZ + 0.028,
    backTilt,
    0,
    0,
    whiteTop
  );

  // Upper backrest shoulder bar + top crown arch above the handle cutout
  pushPart(
    new THREE.BoxGeometry(seatW - 0.04, 0.065, 0.028),
    0,
    seatY + backH - 0.075,
    backZ + 0.056,
    backTilt,
    0,
    0,
    whiteTop
  );
  pushPart(
    new THREE.BoxGeometry(seatW - 0.07, 0.032, 0.028),
    0,
    seatY + backH + 0.012,
    backZ + 0.069,
    backTilt,
    0,
    0,
    whiteTop
  );
  pushPart(
    new THREE.BoxGeometry(0.09, 0.06, 0.028),
    -0.13,
    seatY + backH - 0.025,
    backZ + 0.064,
    backTilt,
    0,
    0,
    whiteTop
  );
  pushPart(
    new THREE.BoxGeometry(0.09, 0.06, 0.028),
    0.13,
    seatY + backH - 0.025,
    backZ + 0.064,
    backTilt,
    0,
    0,
    whiteTop
  );

  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  return merged;
}

export function buildConcertChairs(scene, addCollisionBox) {
  const root = new THREE.Group();
  root.name = 'ConcertWhitePlasticChairs';

  const chairGeo = buildSingleWhiteChairGeometry();

  // Glossy off-white plastic with subtle self-illumination so chairs stay crisp at night
  const chairMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.38,
    metalness: 0.04,
    emissive: new THREE.Color(0x2c3545),
    emissiveIntensity: 0.42
  });

  // 2 blocks x 7 rows x 10 cols = 140 white plastic chairs in 1 single draw call!
  const totalChairs =
    CONCERT_CHAIRS_CONFIG.blocks.reduce((sum, b) => sum + b.cols, 0) * CONCERT_CHAIRS_CONFIG.rows;
  const inst = new THREE.InstancedMesh(chairGeo, chairMat, totalChairs);
  inst.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const tmpColor = new THREE.Color();
  let idx = 0;

  for (let bIdx = 0; bIdx < CONCERT_CHAIRS_CONFIG.blocks.length; bIdx++) {
    const blk = CONCERT_CHAIRS_CONFIG.blocks[bIdx];
    const minX = blk.startX - 0.25;
    const maxX = blk.startX + (blk.cols - 1) * CONCERT_CHAIRS_CONFIG.colSpacing + 0.25;

    for (let r = 0; r < CONCERT_CHAIRS_CONFIG.rows; r++) {
      const rowZ = CONCERT_CHAIRS_CONFIG.startZ + r * CONCERT_CHAIRS_CONFIG.rowSpacing;

      // Slim per-row collision box: players can walk smoothly through the center aisle AND every row!
      if (typeof addCollisionBox === 'function') {
        addCollisionBox(minX, maxX, rowZ - 0.22, rowZ + 0.22, 'concert-chair-row');
      }

      for (let c = 0; c < blk.cols; c++) {
        const seed = bIdx * 131 + r * 37 + c * 17;
        const jx = (Math.sin(seed * 12.9898) * 0.5) * 0.05;
        const jz = (Math.cos(seed * 78.233) * 0.5) * 0.05;
        const jRot = (Math.sin(seed * 43.12) * 0.5) * 0.09;

        const cx = blk.startX + c * CONCERT_CHAIRS_CONFIG.colSpacing + jx;
        const cz = rowZ + jz;

        dummy.position.set(cx, 0, cz);
        dummy.rotation.set(0, jRot, 0);
        dummy.scale.setScalar(1.0);
        dummy.updateMatrix();
        inst.setMatrixAt(idx, dummy.matrix);

        const shade = 0.94 + ((seed % 7) / 6) * 0.06;
        tmpColor.setRGB(shade, shade, Math.min(1, shade + 0.01));
        inst.setColorAt(idx, tmpColor);
        idx++;
      }
    }
  }

  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  root.add(inst);
  scene.add(root);

  return { root, inst, count: totalChairs };
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
