import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ============================================================================
// DRIVABLE TEMPLE FAIR MOTORCYCLES (เช่าขี่มอเตอร์ไซค์เที่ยวงานวัด 5 💰)
// Reuses loaded /models/motorcycles.glb (5 Thai scooters) + Headlight + Horn
// ============================================================================

export const MOTO_CATALOG = [
  { nodeName: 'Moto01_GrandFilano_Blue', label: 'Grand Filano สีน้ำเงิน' },
  { nodeName: 'Moto02_Wave125i_BlueRed', label: 'Wave 125i น้ำเงิน-แดง' },
  { nodeName: 'Moto03_SuperCub_Orange', label: 'Super Cub สีส้ม' },
  { nodeName: 'Moto04_Fazzio_Khaki', label: 'Fazzio สีกากี' },
  { nodeName: 'Moto05_Scoopy_Club12_Red', label: 'Scoopy สีแดง' }
];

// No-drive restricted zones: Pond, Ubosot Kampheng Kaeo, Concert Stage & Back Stairs
export const MOTO_RESTRICTED_BOXES = [
  { minX: 36.8, maxX: 55.8, minZ: -27.2, maxZ: 3.3, tag: 'no-moto-pond' },
  { minX: 6.45, maxX: 23.55, minZ: -56.6, maxZ: -30.4, tag: 'no-moto-ubosot' },
  { minX: -27.4, maxX: -14.6, minZ: -57.6, maxZ: -48.8, tag: 'no-moto-stage' }
];

const cachedMotoParts = [];
let sharedBeamMat = null;
let sharedTailMat = null;

function ensureSharedMotoMaterials() {
  if (!sharedTailMat) {
    sharedTailMat = new THREE.MeshBasicMaterial({ color: 0xff2424 });
  }
  if (!sharedBeamMat) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(64, 118, 6, 64, 62, 62);
    g.addColorStop(0, 'rgba(254, 249, 195, 0.72)');
    g.addColorStop(0.5, 'rgba(254, 240, 138, 0.28)');
    g.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    sharedBeamMat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  }
}

function normalizeGeometryForMerge(rawGeo, worldMat) {
  let g = rawGeo.clone();
  g.applyMatrix4(worldMat);
  if (g.index) {
    g = g.toNonIndexed();
  }
  if (!g.attributes.normal) {
    g.computeVertexNormals();
  }
  for (const attrName of Object.keys(g.attributes)) {
    if (attrName !== 'position' && attrName !== 'normal' && attrName !== 'uv') {
      g.deleteAttribute(attrName);
    }
  }
  if (!g.attributes.uv) {
    const count = g.attributes.position.count;
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2));
  }
  return g;
}

export function initMotorcycleRideTemplates(motoScene) {
  cachedMotoParts.length = 0;
  if (!motoScene) return;

  for (let i = 0; i < MOTO_CATALOG.length; i++) {
    const src = motoScene.getObjectByName(MOTO_CATALOG[i].nodeName);
    if (!src) {
      cachedMotoParts.push(null);
      continue;
    }

    const tpl = src.clone(true);
    tpl.position.set(0, 0, 0);
    tpl.rotation.set(0, 0, 0);
    tpl.scale.set(1, 1, 1);
    tpl.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(tpl);
    const ox = Number.isFinite(box.min.x) ? -(box.min.x + box.max.x) * 0.5 : 0;
    const oy = Number.isFinite(box.min.y) ? -box.min.y : 0;
    const oz = Number.isFinite(box.min.z) ? -(box.min.z + box.max.z) * 0.5 : 0;

    const centerMat = new THREE.Matrix4().makeTranslation(ox, oy, oz);
    const invRootMat = new THREE.Matrix4().copy(tpl.matrixWorld).invert();
    const relMat = new THREE.Matrix4();
    const buckets = new Map();

    tpl.traverse((obj) => {
      if (!obj.isMesh || !obj.geometry) return;
      const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
      if (!mat) return;
      relMat.multiplyMatrices(invRootMat, obj.matrixWorld);
      relMat.premultiply(centerMat);
      const norm = normalizeGeometryForMerge(obj.geometry, relMat);
      if (!buckets.has(mat)) buckets.set(mat, []);
      buckets.get(mat).push(norm);
    });

    const parts = [];
    for (const [mat, geos] of buckets) {
      const merged = mergeGeometries(geos, false);
      geos.forEach((g) => g.dispose());
      if (merged) parts.push({ geometry: merged, material: mat });
    }
    cachedMotoParts.push(parts);
  }
}

export function createPlayerMotorcycleMesh(modelIdx = 0, isParked = false) {
  ensureSharedMotoMaterials();
  const root = new THREE.Group();
  root.name = isParked ? 'ParkedPlayerMotorcycle' : 'PlayerDrivableMotorcycle';

  const idx = ((Math.floor(Number(modelIdx) || 0) % MOTO_CATALOG.length) + MOTO_CATALOG.length) % MOTO_CATALOG.length;
  const parts = cachedMotoParts[idx];

  if (parts && parts.length > 0) {
    for (const part of parts) {
      root.add(new THREE.Mesh(part.geometry, part.material));
    }
  } else {
    // Neat fallback scooter if GLB isn't loaded yet
    const colors = [0x2563eb, 0xdc2626, 0xf97316, 0xa8a29e, 0xe11d48];
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.56, 1.5),
      new THREE.MeshStandardMaterial({ color: colors[idx], roughness: 0.4 })
    );
    body.position.y = 0.54;
    root.add(body);
    for (const wz of [-0.55, 0.55]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.14, 10),
        new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85 })
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(0, 0.28, wz);
      root.add(wheel);
    }
  }

  if (isParked) {
    // Realistic parked kickstand tilt with engine & headlight turned off!
    root.rotation.z = 0.11;
  } else {
    // Warm headlight road beam pointing forward (+Z) + glowing red taillight (-Z)
    const beam = new THREE.Mesh(new THREE.PlaneGeometry(1.85, 3.8), sharedBeamMat);
    beam.rotation.x = -Math.PI / 2;
    beam.position.set(0, 0.06, 2.55);
    root.add(beam);

    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.11, 0.06), sharedTailMat);
    tail.position.set(0, 0.68, -0.82);
    root.add(tail);
  }

  return root;
}

// Enforce restricted no-motorcycle zones (Pond, Ubosot Courtyard, Concert Stage & Back Stairs)
export function resolveMotoRestrictedCollisions(pos, radius = 0.65) {
  let blockedTag = null;
  for (const box of MOTO_RESTRICTED_BOXES) {
    const closestX = Math.max(box.minX, Math.min(pos.x, box.maxX));
    const closestZ = Math.max(box.minZ, Math.min(pos.z, box.maxZ));
    const dx = pos.x - closestX;
    const dz = pos.z - closestZ;
    const distSq = dx * dx + dz * dz;
    if (distSq < radius * radius) {
      blockedTag = box.tag;
      if (distSq > 1e-6) {
        const dist = Math.sqrt(distSq);
        const push = radius - dist;
        pos.x += (dx / dist) * push;
        pos.z += (dz / dist) * push;
      } else {
        const dLeft = Math.abs(pos.x - box.minX);
        const dRight = Math.abs(box.maxX - pos.x);
        const dTop = Math.abs(pos.z - box.minZ);
        const dBottom = Math.abs(box.maxZ - pos.z);
        const m = Math.min(dLeft, dRight, dTop, dBottom);
        if (m === dLeft) pos.x = box.minX - radius;
        else if (m === dRight) pos.x = box.maxX + radius;
        else if (m === dTop) pos.z = box.minZ - radius;
        else pos.z = box.maxZ + radius;
      }
    }
  }
  return blockedTag;
}

// ----------------------------------------------------------------------------
// Classic Thai Scooter Dual-Tone Horn ("ปี๊น-ปี๊น!") & Gentle Engine Purr
// ----------------------------------------------------------------------------

export function playMotoHornSound(audioCtx, volume = 1.0) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  if (audioCtx.state !== 'running' || volume <= 0.05) return;
  try {
    const now = audioCtx.currentTime;
    const v = Math.min(1, volume);
    // Double cheerful scooter beep: "ปี๊น-ปี๊น!" (420 Hz + 528 Hz)
    [0, 0.17].forEach((offset) => {
      [420, 528].forEach((freq) => {
        const osc = audioCtx.createOscillator();
        const filter = audioCtx.createBiquadFilter();
        const g = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + offset);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(980, now + offset);
        filter.Q.value = 1.2;
        g.gain.setValueAtTime(0.001, now + offset);
        g.gain.linearRampToValueAtTime(0.2 * v, now + offset + 0.015);
        g.gain.setValueAtTime(0.18 * v, now + offset + 0.095);
        g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.13);
        osc.connect(filter).connect(g).connect(audioCtx._sfxGain || audioCtx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.14);
      });
    });
  } catch {}
}

export function createMotoEngineState() {
  return { osc: null, gain: null, filter: null, active: false };
}

export function updateMotoEngineHum(eng, audioCtx, speedRatio, riding) {
  if (!eng) return;
  if (!riding || !audioCtx || audioCtx.state !== 'running') {
    if (eng.gain && audioCtx) {
      try {
        eng.gain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.08);
      } catch {}
    }
    return;
  }
  if (!eng.osc) {
    try {
      const osc = audioCtx.createOscillator();
      const filter = audioCtx.createBiquadFilter();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = 58;
      filter.type = 'lowpass';
      filter.frequency.value = 190;
      gain.gain.value = 0.0001;
      osc.connect(filter).connect(gain).connect(audioCtx._sfxGain || audioCtx.destination);
      osc.start();
      eng.osc = osc;
      eng.filter = filter;
      eng.gain = gain;
    } catch {
      return;
    }
  }
  try {
    const now = audioCtx.currentTime;
    const r = Math.max(0, Math.min(1, speedRatio));
    const targetFreq = 54 + r * 72;
    const targetVol = r > 0.06 ? 0.055 + r * 0.055 : 0.018;
    eng.osc.frequency.setTargetAtTime(targetFreq, now, 0.08);
    eng.filter.frequency.setTargetAtTime(160 + r * 240, now, 0.08);
    eng.gain.gain.setTargetAtTime(targetVol, now, 0.08);
  } catch {}
}
