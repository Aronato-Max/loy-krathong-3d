import * as THREE from 'three';

// ============================================================================
// POND SWIMMING & COLLECTIBLE GOLD COINS (ว่ายน้ำเก็บเหรียญในสระลอยกระทง)
// Pond water bounds: X: 37.3..54.7, Z: -26.7..+2.7 (excluding wooden pier deck)
// ============================================================================

export const POND_SWIM_BOUNDS = {
  minX: 37.3,
  maxX: 54.7,
  minZ: -26.7,
  maxZ: 2.7
};

export const PIER_BOUNDS = {
  minX: 33.7,
  maxX: 37.9,
  minZ: -14.6,
  maxZ: -9.4,
  floorY: 0.28
};

export function isOnWoodenPier(x, z) {
  return (
    x >= PIER_BOUNDS.minX &&
    x <= PIER_BOUNDS.maxX &&
    z >= PIER_BOUNDS.minZ &&
    z <= PIER_BOUNDS.maxZ
  );
}

export function isInSwimmingPond(x, z) {
  if (isOnWoodenPier(x, z)) return false;
  return (
    x >= POND_SWIM_BOUNDS.minX &&
    x <= POND_SWIM_BOUNDS.maxX &&
    z >= POND_SWIM_BOUNDS.minZ &&
    z <= POND_SWIM_BOUNDS.maxZ
  );
}

function createPondSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0c4a6e';
  ctx.fillRect(0, 0, 512, 160);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 144);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 40px "Noto Sans Thai", sans-serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('🏊 ลงว่ายน้ำเก็บเหรียญได้!', 256, 62);
  ctx.font = '600 24px "Noto Sans Thai", sans-serif';
  ctx.fillStyle = '#e0f2fe';
  ctx.fillText('เก็บเหรียญในสระไปซื้อของกิน • โคมลอย • จุดพลุ', 256, 118);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildPondCoinSystem(scene) {
  const root = new THREE.Group();
  root.name = 'PondCoinSystem';

  // Friendly poolside signboard on the southwest bank of the pond (X=36.0, Z=0.5)
  const signTex = createPondSignTexture();
  const signBoard = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 0.78),
    new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
  );
  signBoard.position.set(36.0, 1.55, 0.8);
  signBoard.rotation.y = -Math.PI * 0.35;
  root.add(signBoard);

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.05, 1.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 })
  );
  pole.position.set(36.0, 0.8, 0.8);
  root.add(pole);

  // Shared coin geometries & materials
  const coinGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.06, 14);
  coinGeo.rotateX(Math.PI / 2);
  const bigCoinGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.08, 16);
  bigCoinGeo.rotateX(Math.PI / 2);

  const coinMat1 = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.65,
    roughness: 0.25,
    emissive: 0x92400e,
    emissiveIntensity: 0.55
  });
  const coinMat2 = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    metalness: 0.7,
    roughness: 0.2,
    emissive: 0xb45309,
    emissiveIntensity: 0.72
  });
  const coinMat5 = new THREE.MeshStandardMaterial({
    color: 0xfffbeb,
    metalness: 0.8,
    roughness: 0.15,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.95
  });
  const glowRingGeo = new THREE.RingGeometry(0.28, 0.44, 16);
  glowRingGeo.rotateX(-Math.PI / 2);
  const glowRingMat = new THREE.MeshBasicMaterial({
    color: 0xfde047,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  // Reusable water ripple ring around the local swimming player
  const swimRippleGeo = new THREE.RingGeometry(0.35, 0.55, 20);
  swimRippleGeo.rotateX(-Math.PI / 2);
  const swimRippleMat = new THREE.MeshBasicMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const swimRipple = new THREE.Mesh(swimRippleGeo, swimRippleMat);
  swimRipple.visible = false;
  root.add(swimRipple);

  scene.add(root);

  return {
    root,
    coins: new Map(), // id -> { data, group, mesh, ring }
    coinGeo,
    bigCoinGeo,
    coinMat1,
    coinMat2,
    coinMat5,
    glowRingGeo,
    glowRingMat,
    swimRipple,
    pendingClaims: new Set()
  };
}

export function spawnPondCoin(pondState, coinData) {
  if (!pondState || !coinData || pondState.coins.has(coinData.id)) return;
  const g = new THREE.Group();
  g.position.set(coinData.x, 0.32, coinData.z);

  const isBig = coinData.value >= 5;
  const mat = isBig
    ? pondState.coinMat5
    : coinData.value >= 2
      ? pondState.coinMat2
      : pondState.coinMat1;
  const mesh = new THREE.Mesh(isBig ? pondState.bigCoinGeo : pondState.coinGeo, mat);
  g.add(mesh);

  const ring = new THREE.Mesh(pondState.glowRingGeo, pondState.glowRingMat);
  ring.position.y = -0.22;
  ring.scale.setScalar(isBig ? 1.45 : 1.0);
  g.add(ring);

  pondState.root.add(g);
  pondState.coins.set(coinData.id, { data: coinData, group: g, mesh, ring });
}

export function removePondCoin(pondState, coinId) {
  if (!pondState) return;
  pondState.pendingClaims.delete(coinId);
  const item = pondState.coins.get(coinId);
  if (!item) return;
  pondState.root.remove(item.group);
  pondState.coins.delete(coinId);
}

export function syncPondCoins(pondState, coinsList) {
  if (!pondState || !Array.isArray(coinsList)) return;
  const keep = new Set(coinsList.map((c) => c.id));
  for (const [id] of Array.from(pondState.coins)) {
    if (!keep.has(id)) removePondCoin(pondState, id);
  }
  for (const c of coinsList) {
    spawnPondCoin(pondState, c);
  }
}

export function playCoinCollectSound(audioCtx, enabled, value = 1) {
  if (!enabled || !audioCtx || audioCtx.state !== 'running') return;
  try {
    const now = audioCtx.currentTime;
    const notes = value >= 5 ? [987.77, 1318.51, 1567.98] : [987.77, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.075);
      g.gain.setValueAtTime(0.14, now + idx * 0.075);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.075 + 0.24);
      osc.connect(g).connect(audioCtx.destination);
      osc.start(now + idx * 0.075);
      osc.stop(now + idx * 0.075 + 0.26);
    });
  } catch {}
}

export function updatePondCoins(pondState, selfPlayer, elapsed, onTouchCoin) {
  if (!pondState) return;

  // Spin & bob all pond coins + check pickup collision when swimming!
  for (const [id, item] of pondState.coins) {
    const c = item.data;
    const phase = c.x * 0.7 + c.z * 0.5;
    item.mesh.rotation.y = elapsed * 2.8 + phase;
    item.group.position.y = 0.28 + Math.sin(elapsed * 3.1 + phase) * 0.08;
    const pulse = (c.value >= 5 ? 1.35 : 1.0) + Math.sin(elapsed * 4 + phase) * 0.16;
    item.ring.scale.setScalar(pulse);

    if (selfPlayer && selfPlayer.isSwimming && !pondState.pendingClaims.has(id)) {
      const dx = selfPlayer.currentPos.x - c.x;
      const dz = selfPlayer.currentPos.z - c.z;
      if (dx * dx + dz * dz <= 1.25 * 1.25) {
        pondState.pendingClaims.add(id);
        if (typeof onTouchCoin === 'function') {
          onTouchCoin(c);
        }
      }
    }
  }

  // Water ripple ring around swimming self player
  if (pondState.swimRipple) {
    if (selfPlayer && selfPlayer.isSwimming) {
      pondState.swimRipple.visible = true;
      pondState.swimRipple.position.set(selfPlayer.currentPos.x, 0.1, selfPlayer.currentPos.z);
      const rCycle = (elapsed * 1.35) % 1;
      pondState.swimRipple.scale.setScalar(0.75 + rCycle * 1.45);
      pondState.swimRipple.material.opacity = (1 - rCycle) * 0.65;
    } else {
      pondState.swimRipple.visible = false;
    }
  }
}
