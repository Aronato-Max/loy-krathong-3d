import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ============================================================================
// FRONT 4-LANE THAI HIGHWAY & LIVE TRAFFIC (SEDANS, PICKUPS, MOTORCYCLES)
// ============================================================================

export const FRONT_ROAD_CONFIG = {
  minX: -105,
  maxX: 125,
  curbZ: 60.5,
  roadMinZ: 60.5,
  roadMaxZ: 74.9,
  centerZ: 67.7,
  width: 14.4,
  length: 230
};

function createHeadlightPoolTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 18, 4, 64, 68, 62);
  grad.addColorStop(0, 'rgba(255, 252, 225, 0.72)');
  grad.addColorStop(0.45, 'rgba(255, 244, 196, 0.26)');
  grad.addColorStop(1, 'rgba(255, 244, 196, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createLampGlowTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255, 210, 120, 0.48)');
  grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.16)');
  grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Shared lightweight materials for vehicles
function createVehicleSharedAssets() {
  const headlightTex = createHeadlightPoolTexture();
  return {
    glassMat: new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.65, roughness: 0.2 }),
    tireMat: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.88 }),
    rimMat: new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.6, roughness: 0.35 }),
    bedMat: new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 }),
    headlightMat: new THREE.MeshBasicMaterial({ color: 0xfffde7 }),
    taillightMat: new THREE.MeshBasicMaterial({ color: 0xef4444 }),
    beamMat: new THREE.MeshBasicMaterial({
      map: headlightTex,
      color: 0xfff8d6,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }),
    wheelGeo: new THREE.CylinderGeometry(0.32, 0.32, 0.22, 10),
    pickupWheelGeo: new THREE.CylinderGeometry(0.37, 0.37, 0.25, 10),
    motoWheelGeo: new THREE.CylinderGeometry(0.27, 0.27, 0.12, 10)
  };
}

function batchVehicleGroup(group, excludeMesh) {
  group.updateMatrixWorld(true);
  const invGroup = new THREE.Matrix4().copy(group.matrixWorld).invert();
  const relMat = new THREE.Matrix4();
  const buckets = new Map();
  const toRemove = [];

  group.traverse((obj) => {
    if (!obj.isMesh || !obj.geometry || obj === excludeMesh) return;
    const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
    if (!mat) return;

    const geo = obj.geometry.index ? obj.geometry.toNonIndexed() : obj.geometry.clone();
    for (const attrName of Object.keys(geo.attributes)) {
      if (attrName !== 'position' && attrName !== 'normal' && attrName !== 'uv') {
        geo.deleteAttribute(attrName);
      }
    }
    if (!geo.attributes.normal) geo.computeVertexNormals();
    if (!geo.attributes.uv) {
      geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
    }
    relMat.multiplyMatrices(invGroup, obj.matrixWorld);
    geo.applyMatrix4(relMat);

    if (!buckets.has(mat)) buckets.set(mat, []);
    buckets.get(mat).push(geo);
    toRemove.push(obj);
  });

  if (buckets.size === 0) return;
  for (const obj of toRemove) {
    if (obj.parent) obj.parent.remove(obj);
  }
  for (const [mat, geos] of buckets) {
    const merged = mergeGeometries(geos, false);
    geos.forEach((g) => g.dispose());
    if (merged) {
      group.add(new THREE.Mesh(merged, mat));
    }
  }
}

// Vehicle faces +X in local space
function buildSedanMesh(colorHex, shared, isTaxi = false) {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.35, roughness: 0.42 });

  // Lower chassis
  const lower = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.62, 1.78), bodyMat);
  lower.position.set(0, 0.58, 0);
  group.add(lower);

  // Cabin upper (green-yellow taxi roof accent if isTaxi)
  const roofMat = isTaxi
    ? new THREE.MeshStandardMaterial({ color: 0x16a34a, metalness: 0.3, roughness: 0.42 })
    : bodyMat;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.56, 1.54), roofMat);
  cabin.position.set(-0.18, 1.12, 0);
  group.add(cabin);

  // Windshield & rear/side glass band
  const glass = new THREE.Mesh(new THREE.BoxGeometry(2.22, 0.42, 1.58), shared.glassMat);
  glass.position.set(-0.18, 1.1, 0);
  group.add(glass);

  if (isTaxi) {
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.14, 0.55),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    sign.position.set(-0.1, 1.46, 0);
    group.add(sign);
  }

  // 4 wheels
  const wheelCoords = [
    [1.25, 0.32, 0.88],
    [1.25, 0.32, -0.88],
    [-1.25, 0.32, 0.88],
    [-1.25, 0.32, -0.88]
  ];
  for (const [wx, wy, wz] of wheelCoords) {
    const w = new THREE.Mesh(shared.wheelGeo, shared.tireMat);
    w.rotation.x = Math.PI / 2;
    w.position.set(wx, wy, wz);
    group.add(w);
  }

  // Headlights (+X front) & Taillights (-X rear)
  for (const side of [-0.62, 0.62]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.32), shared.headlightMat);
    hl.position.set(2.06, 0.66, side);
    group.add(hl);

    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.34), shared.taillightMat);
    tl.position.set(-2.06, 0.68, side);
    group.add(tl);
  }

  // Headlight light pool on asphalt ahead (+X)
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 5.2), shared.beamMat);
  beam.rotation.x = -Math.PI / 2;
  beam.rotation.z = -Math.PI / 2;
  beam.position.set(4.5, 0.045, 0);
  group.add(beam);

  batchVehicleGroup(group, beam);
  return group;
}

// Vehicle faces +X in local space
function buildPickupMesh(colorHex, shared) {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.32, roughness: 0.48 });

  // Main chassis / lower body
  const lower = new THREE.Mesh(new THREE.BoxGeometry(4.75, 0.68, 1.88), bodyMat);
  lower.position.set(0, 0.68, 0);
  group.add(lower);

  // Front cab
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.72, 1.72), bodyMat);
  cab.position.set(0.45, 1.34, 0);
  group.add(cab);

  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.48, 1.76), shared.glassMat);
  glass.position.set(0.45, 1.33, 0);
  group.add(glass);

  // Dark open cargo bed liner
  const bed = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.16, 1.6), shared.bedMat);
  bed.position.set(-1.35, 0.98, 0);
  group.add(bed);

  // 4 wheels
  const wheelCoords = [
    [1.52, 0.37, 0.94],
    [1.52, 0.37, -0.94],
    [-1.42, 0.37, 0.94],
    [-1.42, 0.37, -0.94]
  ];
  for (const [wx, wy, wz] of wheelCoords) {
    const w = new THREE.Mesh(shared.pickupWheelGeo, shared.tireMat);
    w.rotation.x = Math.PI / 2;
    w.position.set(wx, wy, wz);
    group.add(w);
  }

  // Headlights (+X) & Taillights (-X)
  for (const side of [-0.66, 0.66]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.34), shared.headlightMat);
    hl.position.set(2.39, 0.76, side);
    group.add(hl);

    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.24, 0.24), shared.taillightMat);
    tl.position.set(-2.39, 0.78, side);
    group.add(tl);
  }

  // Headlight light pool ahead (+X)
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 5.6), shared.beamMat);
  beam.rotation.x = -Math.PI / 2;
  beam.rotation.z = -Math.PI / 2;
  beam.position.set(5.0, 0.045, 0);
  group.add(beam);

  batchVehicleGroup(group, beam);
  return group;
}

// Vehicle faces +X in local space
function buildMotorcycleMesh(colorHex, helmetHex, shared) {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.45 });
  const jacketMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const helmetMat = new THREE.MeshStandardMaterial({ color: helmetHex, roughness: 0.35 });

  // Scooter/bike body
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.42, 0.38), bodyMat);
  frame.position.set(0, 0.52, 0);
  group.add(frame);

  // Front fairing & handlebars
  const front = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.62, 0.42), bodyMat);
  front.position.set(0.56, 0.74, 0);
  group.add(front);

  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.68), shared.rimMat);
  bar.position.set(0.52, 1.05, 0);
  group.add(bar);

  // Wheels
  for (const wx of [0.58, -0.54]) {
    const w = new THREE.Mesh(shared.motoWheelGeo, shared.tireMat);
    w.rotation.x = Math.PI / 2;
    w.position.set(wx, 0.27, 0);
    group.add(w);
  }

  // Stylized rider torso + helmet
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.56, 0.38), jacketMat);
  torso.position.set(-0.08, 1.08, 0);
  torso.rotation.z = -0.18;
  group.add(torso);

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), helmetMat);
  helmet.position.set(0.0, 1.48, 0);
  group.add(helmet);

  // Headlight & taillight
  const hl = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), shared.headlightMat);
  hl.position.set(0.74, 0.86, 0);
  group.add(hl);

  const tl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.16), shared.taillightMat);
  tl.position.set(-0.74, 0.66, 0);
  group.add(tl);

  // Compact headlight beam ahead (+X)
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.2), shared.beamMat);
  beam.rotation.x = -Math.PI / 2;
  beam.rotation.z = -Math.PI / 2;
  beam.position.set(2.3, 0.044, 0);
  group.add(beam);

  return group;
}

export function buildFrontRoad(scene, lowGraphics = false) {
  const { minX, maxX, curbZ, centerZ, width, length } = FRONT_ROAD_CONFIG;
  const midX = (minX + maxX) * 0.5;
  const root = new THREE.Group();
  root.name = 'FrontFourLaneHighway';
  const dummy = new THREE.Object3D();

  // --------------------------------------------------------------------------
  // 1. SIDEWALK & CURB IN FRONT OF TEMPLE WALL (Z: 56.0..60.5)
  // --------------------------------------------------------------------------
  const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.92 });
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });

  // Left & right sidewalk slabs outside temple wall (leaving X: -3.1..+3.1 open for main road T-junction)
  const leftWalk = new THREE.Mesh(new THREE.PlaneGeometry(40.9, 4.5), sidewalkMat);
  leftWalk.rotation.x = -Math.PI / 2;
  leftWalk.position.set(-23.55, 0.018, 58.25);
  leftWalk.receiveShadow = true;
  root.add(leftWalk);

  const rightWalk = new THREE.Mesh(new THREE.PlaneGeometry(55.9, 4.5), sidewalkMat);
  rightWalk.rotation.x = -Math.PI / 2;
  rightWalk.position.set(31.05, 0.018, 58.25);
  rightWalk.receiveShadow = true;
  root.add(rightWalk);

  // Raised concrete curbs along Z = 60.45 flanking the temple entrance road
  const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(101.9, 0.14, 0.28), curbMat);
  leftCurb.position.set(-54.05, 0.07, curbZ - 0.12);
  root.add(leftCurb);

  const rightCurb = new THREE.Mesh(new THREE.BoxGeometry(121.9, 0.14, 0.28), curbMat);
  rightCurb.position.set(64.05, 0.07, curbZ - 0.12);
  root.add(rightCurb);

  // --------------------------------------------------------------------------
  // 2. 4-LANE ASPHALT HIGHWAY & ROAD MARKINGS (Z: 60.5..74.9)
  // --------------------------------------------------------------------------
  const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x222c3a, roughness: 0.88 });
  const asphalt = new THREE.Mesh(new THREE.PlaneGeometry(length, width), asphaltMat);
  asphalt.rotation.x = -Math.PI / 2;
  asphalt.position.set(midX, 0.016, centerZ);
  asphalt.receiveShadow = true;
  root.add(asphalt);

  // Double yellow solid center lines (Z = 67.7 ± 0.15)
  const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  for (const dz of [-0.15, 0.15]) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(length, 0.13), yellowLineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(midX, 0.024, centerZ + dz);
    root.add(line);
  }

  // White solid shoulder lines
  const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
  for (const edgeZ of [60.82, 74.58]) {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(length, 0.14), whiteLineMat);
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(midX, 0.024, edgeZ);
    root.add(edge);
  }

  // White dashed lane dividers (Z = 64.1 and Z = 71.3) via single InstancedMesh
  const dashStep = 5.0;
  const dashesPerLine = Math.floor(length / dashStep);
  const laneDashes = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(2.4, 0.14),
    whiteLineMat,
    dashesPerLine * 2
  );
  let dIdx = 0;
  for (const laneLineZ of [64.1, 71.3]) {
    for (let i = 0; i < dashesPerLine; i++) {
      dummy.position.set(minX + 2.5 + i * dashStep, 0.024, laneLineZ);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      laneDashes.setMatrixAt(dIdx++, dummy.matrix);
    }
  }
  laneDashes.instanceMatrix.needsUpdate = true;
  root.add(laneDashes);

  // --------------------------------------------------------------------------
  // 3. LIGHTWEIGHT STREETLIGHTS ALONG SIDEWALK (InstancedMesh, 0 PointLights)
  // --------------------------------------------------------------------------
  const lampXs = [];
  for (let x = -80; x <= 98; x += 18) {
    if (Math.abs(x) < 7.5) continue; // keep temple gate entrance unobstructed
    lampXs.push(x);
  }
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.45, roughness: 0.55 });
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffd580 });
  const lampGlowTex = createLampGlowTexture();
  const lampGlowMat = new THREE.MeshBasicMaterial({
    map: lampGlowTex,
    color: 0xffc864,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const lampPoles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07, 0.11, 6.2, 6), poleMat, lampXs.length);
  const lampArms = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.08, 1.8), poleMat, lampXs.length);
  const lampHeads = new THREE.InstancedMesh(new THREE.BoxGeometry(0.32, 0.12, 0.55), bulbMat, lampXs.length);
  const lampPools = new THREE.InstancedMesh(new THREE.PlaneGeometry(7.2, 7.2), lampGlowMat, lampXs.length);

  lampXs.forEach((lx, i) => {
    dummy.position.set(lx, 3.1, 59.8);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    lampPoles.setMatrixAt(i, dummy.matrix);

    dummy.position.set(lx, 6.1, 60.65);
    dummy.updateMatrix();
    lampArms.setMatrixAt(i, dummy.matrix);

    dummy.position.set(lx, 6.0, 61.45);
    dummy.updateMatrix();
    lampHeads.setMatrixAt(i, dummy.matrix);

    dummy.position.set(lx, 0.03, 62.6);
    dummy.rotation.set(-Math.PI / 2, 0, 0);
    dummy.updateMatrix();
    lampPools.setMatrixAt(i, dummy.matrix);
  });
  lampPoles.instanceMatrix.needsUpdate = true;
  lampArms.instanceMatrix.needsUpdate = true;
  lampHeads.instanceMatrix.needsUpdate = true;
  lampPools.instanceMatrix.needsUpdate = true;
  root.add(lampPoles, lampArms, lampHeads, lampPools);

  // --------------------------------------------------------------------------
  // 4. TRAFFIC VEHICLES (Thai Left-Hand Traffic across 4 Lanes)
  // --------------------------------------------------------------------------
  const shared = createVehicleSharedAssets();

  // North half (Z=62.3, 65.9) goes East (+X); South half (Z=69.5, 73.1) goes West (-X)
  const laneDefs = [
    {
      z: 62.3,
      dir: 1,
      speed: 10.4,
      slots: [
        { type: 'moto', color: 0xef4444, helmet: 0xf8fafc, offset: 0.05 },
        { type: 'pickup', color: 0xd97706, offset: 0.30 },
        { type: 'moto', color: 0x2563eb, helmet: 0xfacc15, offset: 0.56 },
        { type: 'moto', color: 0x10b981, helmet: 0x1e293b, offset: 0.81 }
      ]
    },
    {
      z: 65.9,
      dir: 1,
      speed: 15.2,
      slots: [
        { type: 'sedan', color: 0xf8fafc, offset: 0.12 },
        { type: 'pickup', color: 0x334155, offset: 0.38 },
        { type: 'taxi', color: 0xfacc15, offset: 0.64 },
        { type: 'sedan', color: 0xdc2626, offset: 0.89 }
      ]
    },
    {
      z: 69.5,
      dir: -1,
      speed: 14.6,
      slots: [
        { type: 'sedan', color: 0x94a3b8, offset: 0.08 },
        { type: 'pickup', color: 0xf1f5f9, offset: 0.33 },
        { type: 'sedan', color: 0x1d4ed8, offset: 0.59 },
        { type: 'taxi', color: 0xfacc15, offset: 0.85 }
      ]
    },
    {
      z: 73.1,
      dir: -1,
      speed: 9.9,
      slots: [
        { type: 'moto', color: 0xf97316, helmet: 0xe2e8f0, offset: 0.16 },
        { type: 'moto', color: 0xec4899, helmet: 0x111827, offset: 0.42 },
        { type: 'pickup', color: 0x1e3a8a, offset: 0.68 },
        { type: 'moto', color: 0x38bdf8, helmet: 0xfef08a, offset: 0.93 }
      ]
    }
  ];

  const vehicles = [];
  let vIdx = 0;

  for (const lane of laneDefs) {
    for (const slot of lane.slots) {
      let mesh;
      if (slot.type === 'sedan') {
        mesh = buildSedanMesh(slot.color, shared, false);
      } else if (slot.type === 'taxi') {
        mesh = buildSedanMesh(slot.color, shared, true);
      } else if (slot.type === 'pickup') {
        mesh = buildPickupMesh(slot.color, shared);
      } else {
        mesh = buildMotorcycleMesh(slot.color, slot.helmet || 0xf8fafc, shared);
      }

      const startX = minX + slot.offset * length;
      mesh.position.set(startX, 0.02, lane.z);
      mesh.rotation.y = lane.dir > 0 ? 0 : Math.PI;
      root.add(mesh);

      vehicles.push({
        mesh,
        type: slot.type,
        x: startX,
        z: lane.z,
        dir: lane.dir,
        speed: lane.speed,
        index: vIdx++
      });
    }
  }

  scene.add(root);

  const roadState = {
    root,
    vehicles,
    shared,
    minX,
    maxX,
    length
  };

  setFrontRoadGraphicsMode(roadState, lowGraphics);
  return roadState;
}

// ============================================================================
// UPGRADE ROAD MOTORCYCLES WITH REAL GLB BIKES & POSED AVATARS (+ PASSENGERS)
// ============================================================================

const ROAD_MOTO_PRESETS = [
  {
    motoName: 'Moto01_GrandFilano_Blue',
    driver: { id: 'Avatar_BoyCargo', suffix: 'BoyCargo', scale: 1.0 },
    passenger: { id: 'Avatar_GirlPink', suffix: 'GirlPink', scale: 0.95 }
  },
  {
    motoName: 'Moto02_Wave125i_BlueRed',
    driver: { id: 'Avatar_BoySport', suffix: 'BoySport', scale: 1.0 },
    passenger: null
  },
  {
    motoName: 'Moto03_SuperCub_Orange',
    driver: { id: 'Avatar_ManShirt', suffix: 'ManShirt', scale: 0.93 },
    passenger: { id: 'Avatar_GirlBeret', suffix: 'GirlBeret', scale: 0.96 }
  },
  {
    motoName: 'Moto05_Scoopy_Club12_Red',
    driver: { id: 'Avatar_BoySport', suffix: 'BoySport', scale: 1.0 },
    passenger: { id: 'Avatar_WomanBoots', suffix: 'WomanBoots', scale: 0.92 }
  },
  {
    motoName: 'Moto04_Fazzio_Khaki',
    driver: { id: 'Avatar_GirlBeret', suffix: 'GirlBeret', scale: 0.98 },
    passenger: null
  },
  {
    motoName: 'Moto01_GrandFilano_Blue',
    driver: { id: 'Avatar_WomanBoots', suffix: 'WomanBoots', scale: 0.93 },
    passenger: null
  }
];

function buildMergedMotoGeometries(srcNode) {
  const tpl = srcNode.clone(true);
  tpl.position.set(0, 0, 0);
  tpl.rotation.set(0, 0, 0);
  tpl.scale.set(1, 1, 1);
  tpl.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(tpl);
  const offsetX = Number.isFinite(box.min.x) ? -(box.min.x + box.max.x) * 0.5 : 0;
  const offsetY = Number.isFinite(box.min.y) ? -box.min.y : 0;
  const offsetZ = Number.isFinite(box.min.z) ? -(box.min.z + box.max.z) * 0.5 : 0;

  const centerMat = new THREE.Matrix4().makeTranslation(offsetX, offsetY, offsetZ);
  const invRootMat = new THREE.Matrix4().copy(tpl.matrixWorld).invert();
  const relMat = new THREE.Matrix4();

  const buckets = new Map();
  tpl.traverse((obj) => {
    if (!obj.isMesh || !obj.geometry) return;
    const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
    if (!mat) return;

    const geo = obj.geometry.index ? obj.geometry.toNonIndexed() : obj.geometry.clone();
    for (const attrName of Object.keys(geo.attributes)) {
      if (attrName !== 'position' && attrName !== 'normal' && attrName !== 'uv') {
        geo.deleteAttribute(attrName);
      }
    }
    if (!geo.attributes.normal) geo.computeVertexNormals();
    if (!geo.attributes.uv) {
      geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
    }

    relMat.multiplyMatrices(invRootMat, obj.matrixWorld);
    relMat.premultiply(centerMat);
    geo.applyMatrix4(relMat);

    if (!buckets.has(mat)) buckets.set(mat, []);
    buckets.get(mat).push(geo);
  });

  const mergedParts = [];
  for (const [mat, geos] of buckets) {
    const merged = mergeGeometries(geos, false);
    geos.forEach((g) => g.dispose());
    if (merged) {
      mergedParts.push({ geometry: merged, material: mat });
    }
  }
  return mergedParts;
}

function buildPosedAvatarRider(avatarScene, spec, isPassenger) {
  if (!avatarScene || !spec) return null;
  const src = avatarScene.getObjectByName(spec.id);
  if (!src) return null;

  const holder = new THREE.Group();
  const model = src.clone(true);
  model.position.set(0, 0, 0);
  model.rotation.set(0, 0, 0);
  model.scale.setScalar(spec.scale || 1.0);
  holder.add(model);

  // Character local forward is +Z; rotate +PI/2 so rider faces +X along highway
  holder.rotation.y = Math.PI / 2;

  const p = spec.suffix;
  const hips = model.getObjectByName(`${p}_Hips`);
  const torso = model.getObjectByName(`${p}_Torso`);
  const head = model.getObjectByName(`${p}_Head`);
  const armL = model.getObjectByName(`${p}_ArmL`);
  const forearmL = model.getObjectByName(`${p}_ForearmL`);
  const armR = model.getObjectByName(`${p}_ArmR`);
  const forearmR = model.getObjectByName(`${p}_ForearmR`);
  const legL = model.getObjectByName(`${p}_LegL`);
  const shinL = model.getObjectByName(`${p}_ShinL`);
  const legR = model.getObjectByName(`${p}_LegR`);
  const shinR = model.getObjectByName(`${p}_ShinR`);

  if (hips) {
    // Seat hips right on motorcycle cushion regardless of avatar leg length
    hips.position.y = isPassenger ? 0.82 : 0.78;
  }

  if (isPassenger) {
    // Pillion passenger sitting behind driver, hands gently holding on
    holder.position.set(-0.54, 0, 0);
    if (torso) torso.rotation.x = 0.14;
    if (head) {
      head.rotation.x = -0.1;
      head.rotation.y = 0.14;
    }
    if (legL) {
      legL.rotation.x = -1.12;
      legL.rotation.z = 0.34;
    }
    if (legR) {
      legR.rotation.x = -1.12;
      legR.rotation.z = -0.34;
    }
    if (shinL) shinL.rotation.x = 1.38;
    if (shinR) shinR.rotation.x = 1.38;
    if (armL) {
      armL.rotation.x = -0.82;
      armL.rotation.z = -0.1;
    }
    if (armR) {
      armR.rotation.x = -0.82;
      armR.rotation.z = 0.1;
    }
    if (forearmL) forearmL.rotation.x = -0.42;
    if (forearmR) forearmR.rotation.x = -0.42;
  } else {
    // Driver straddling seat, knees bent to footboards, arms gripping handlebars
    holder.position.set(-0.14, 0, 0);
    if (torso) torso.rotation.x = 0.18;
    if (head) head.rotation.x = -0.15;
    if (legL) {
      legL.rotation.x = -1.2;
      legL.rotation.z = 0.28;
    }
    if (legR) {
      legR.rotation.x = -1.2;
      legR.rotation.z = -0.28;
    }
    if (shinL) shinL.rotation.x = 1.38;
    if (shinR) shinR.rotation.x = 1.38;
    if (armL) {
      armL.rotation.x = -1.14;
      armL.rotation.z = 0.22;
    }
    if (armR) {
      armR.rotation.x = -1.14;
      armR.rotation.z = -0.22;
    }
    if (forearmL) forearmL.rotation.x = -0.32;
    if (forearmR) forearmR.rotation.x = -0.32;
  }

  return holder;
}

export function upgradeRoadMotorcycles(roadState, motoScene, avatarScene) {
  if (!roadState || !motoScene) return;

  // Cache merged geometry buckets per motorcycle model name
  const mergedCache = new Map();
  const getParts = (motoName) => {
    if (mergedCache.has(motoName)) return mergedCache.get(motoName);
    const node = motoScene.getObjectByName(motoName);
    if (!node) return null;
    const parts = buildMergedMotoGeometries(node);
    mergedCache.set(motoName, parts);
    return parts;
  };

  let motoOrdinal = 0;
  for (const v of roadState.vehicles) {
    if (v.type !== 'moto') continue;
    const preset = ROAD_MOTO_PRESETS[motoOrdinal % ROAD_MOTO_PRESETS.length];
    motoOrdinal++;

    const parts = getParts(preset.motoName);
    if (!parts || parts.length === 0) continue;

    const newGroup = new THREE.Group();

    // Realistic motorcycle rotated so local +Z faces +X (travel direction)
    const bikeRoot = new THREE.Group();
    bikeRoot.rotation.y = Math.PI / 2;
    for (const part of parts) {
      const m = new THREE.Mesh(part.geometry, part.material);
      bikeRoot.add(m);
    }
    newGroup.add(bikeRoot);

    // Road headlight beam + glowing red taillight (bike GLB already includes its own headlight mesh)
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.11, 0.18), roadState.shared.taillightMat);
    tl.position.set(-0.82, 0.68, 0);
    newGroup.add(tl);

    const beam = new THREE.Mesh(new THREE.PlaneGeometry(1.85, 3.6), roadState.shared.beamMat);
    beam.rotation.x = -Math.PI / 2;
    beam.rotation.z = -Math.PI / 2;
    beam.position.set(2.55, 0.044, 0);
    newGroup.add(beam);

    // Add real avatar driver (+ pillion passenger on selected bikes)
    if (avatarScene) {
      const driver = buildPosedAvatarRider(avatarScene, preset.driver, false);
      if (driver) newGroup.add(driver);

      if (preset.passenger) {
        const passenger = buildPosedAvatarRider(avatarScene, preset.passenger, true);
        if (passenger) newGroup.add(passenger);
      }
    }

    // Batch the posed bike + driver + passenger meshes by shared material (~440 -> ~65 draw calls)
    batchVehicleGroup(newGroup, beam);

    // Swap out the placeholder motorcycle group preserving live position/visibility
    const wasVisible = v.mesh.visible;
    newGroup.position.copy(v.mesh.position);
    newGroup.rotation.copy(v.mesh.rotation);
    newGroup.visible = wasVisible;

    roadState.root.remove(v.mesh);
    roadState.root.add(newGroup);
    v.mesh = newGroup;
  }
}

export function setFrontRoadGraphicsMode(roadState, lowGraphics) {
  if (!roadState) return;
  const low = Boolean(lowGraphics);
  for (const v of roadState.vehicles) {
    // In low-graphics mobile mode keep 1 vehicle per lane (4 active total) for max FPS
    v.mesh.visible = !low || v.index % 4 === 0;
  }
}

export function updateFrontRoad(roadState, dt) {
  if (!roadState || !dt) return;
  const { minX, maxX, length, vehicles } = roadState;

  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    if (!v.mesh.visible) continue;

    v.x += v.dir * v.speed * dt;
    if (v.dir > 0 && v.x > maxX) {
      v.x -= length;
    } else if (v.dir < 0 && v.x < minX) {
      v.x += length;
    }
    v.mesh.position.x = v.x;
  }
}

export function drawFrontRoadMinimap(ctx, mapX, mapY, mapW, mapH) {
  const { roadMinZ, centerZ, width } = FRONT_ROAD_CONFIG;
  ctx.save();
  // 4-lane road strip across full minimap width
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, mapY(roadMinZ), mapW(120), mapH(width));

  // Double yellow center line
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, mapY(centerZ));
  ctx.lineTo(mapW(120), mapY(centerZ));
  ctx.stroke();
  ctx.restore();
}
