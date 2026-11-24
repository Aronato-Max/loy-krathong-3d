import * as THREE from 'three';

// ============================================================================
// PLAYABLE LEGO BOUNCY CASTLE WITH STAIRS & TWIN SLIDES (บ้านลมยักษ์เลโก้)
// - Placed in SE Lawn (X=16.0, Z=20.8, rotY=Math.PI -> Rainbow Arches face North!)
// - Optimized via mergeStaticMeshesByMaterial (214 meshes -> ~13 draw calls!)
// - Real playable bouncy mattress, 10-step climbable stairs, high dome deck,
//   and twin slides with sliding physics & boing sound effects!
// ============================================================================

export const BOUNCY_CASTLE_CONFIG = {
  x: 16.0,
  z: 20.8,
  rotY: Math.PI, // Local +Z (front rainbow arches) faces World -Z (toward walkway & Krathong Contest!)
  scale: 0.95,
  price: 5,
  durationMs: 150000, // 2 minutes 30 seconds per ticket
  // Entrance interact point right in front of the twin rainbow arches
  interactX: 16.0,
  interactZ: 15.6,
  interactRadius: 4.6,
  // Spawn point inside the bouncy castle (front-center of mattress near right entrance arch)
  spawnLocalX: 1.6,
  spawnLocalZ: 1.85,
  // Exit point safely outside the front steps
  exitX: 16.0,
  exitZ: 15.2,
  // Outer collision box when player is NOT inside (prevents unpaid walk-in)
  outerBox: {
    minX: 9.85,
    maxX: 22.15,
    minZ: 16.85,
    maxZ: 24.25
  }
};

// Local-space coordinates (matching exact measured bounds of lego_bouncy_castle_with_stairs.glb)
const MATTRESS_Y = 0.64;
const UPPER_DECK_Y = 3.64;
const INTERIOR_LIMITS = {
  minX: -5.42,
  maxX: 5.42,
  minZ: -2.55,
  maxZ: 2.65
};

// Convert World (wx, wz) <-> Bouncy Castle Local (lx, lz)
export function worldToBouncyLocal(wx, wz) {
  const dx = wx - BOUNCY_CASTLE_CONFIG.x;
  const dz = wz - BOUNCY_CASTLE_CONFIG.z;
  const invS = 1 / BOUNCY_CASTLE_CONFIG.scale;
  const c = Math.cos(-BOUNCY_CASTLE_CONFIG.rotY);
  const s = Math.sin(-BOUNCY_CASTLE_CONFIG.rotY);
  return {
    lx: (dx * c + dz * s) * invS,
    lz: (-dx * s + dz * c) * invS
  };
}

export function bouncyLocalToWorld(lx, lz) {
  const S = BOUNCY_CASTLE_CONFIG.scale;
  const c = Math.cos(BOUNCY_CASTLE_CONFIG.rotY);
  const s = Math.sin(BOUNCY_CASTLE_CONFIG.rotY);
  return {
    x: BOUNCY_CASTLE_CONFIG.x + (lx * c + lz * s) * S,
    z: BOUNCY_CASTLE_CONFIG.z + (-lx * s + lz * c) * S
  };
}

export function getBouncySpawnWorld() {
  const pt = bouncyLocalToWorld(
    BOUNCY_CASTLE_CONFIG.spawnLocalX,
    BOUNCY_CASTLE_CONFIG.spawnLocalZ
  );
  return { x: pt.x, y: MATTRESS_Y * BOUNCY_CASTLE_CONFIG.scale, z: pt.z };
}

// Compute exact playable floor height & zone at any local (lx, lz) inside the castle
function sampleBouncySurface(lx, lz, curLocalY) {
  // 1) Upper Platform Floor under the Lego Dome (localX: -5.65..-3.65, localZ: -2.55..+1.78)
  if (lx <= -3.65 && lz <= 1.82) {
    // Only snap up onto the upper deck if player climbed the stairs (curLocalY >= 2.2)
    if (curLocalY >= 2.15) {
      return { floorY: UPPER_DECK_Y, zone: 'upper_deck' };
    }
    // Otherwise keep player blocked from walking underneath the enclosed tower!
    return { floorY: MATTRESS_Y, zone: 'tower_block' };
  }

  // 2) Climbable 10-step Stairs (localX: -3.85..-0.25, localZ: 0.40..1.66)
  if (lx >= -3.85 && lx <= -0.25 && lz >= 0.38 && lz <= 1.68) {
    const t = Math.max(0, Math.min(1, (-0.35 - lx) / (-0.35 - -3.72)));
    const stairY = MATTRESS_Y + t * (UPPER_DECK_Y - MATTRESS_Y);
    return { floorY: stairY, zone: 'stairs' };
  }

  // 3) Twin Playable Slides (SlideLane_1: localZ -2.35..-1.20, SlideLane_2: localZ -1.00..+0.15)
  const inSlideLane1 = lz >= -2.35 && lz <= -1.18;
  const inSlideLane2 = lz >= -1.02 && lz <= 0.16;
  if (lx >= -3.82 && lx <= -0.22 && (inSlideLane1 || inSlideLane2)) {
    const t = Math.max(0, Math.min(1, (-0.3 - lx) / (-0.3 - -3.75)));
    const slideY = MATTRESS_Y + t * (UPPER_DECK_Y - MATTRESS_Y);
    // Enter slide mode if coming from the top deck or already sliding high on the chute!
    if (curLocalY >= slideY - 0.55 && curLocalY >= 1.15) {
      return {
        floorY: slideY,
        zone: 'slide',
        laneCenterZ: inSlideLane1 ? -1.78 : -0.42
      };
    }
    // Prevent walking up the back/middle of the slide chute from below
    if (slideY > curLocalY + 0.65) {
      return { floorY: MATTRESS_Y, zone: 'slide_block' };
    }
  }

  // 4) Main Inflatable Bouncy Mattress Floor
  return { floorY: MATTRESS_Y, zone: 'mattress' };
}

export function createBouncyPlayerPhysics() {
  return {
    vy: 0,
    onGround: true,
    sliding: false,
    autoRebounds: 0,
    lastSlideSoundAt: 0
  };
}

export function triggerBouncyJump(phys, isStarving, audioCtx, sfxActive) {
  if (!phys || phys.sliding) return false;
  if (!phys.onGround && phys.vy > 0.8) return false;
  phys.vy = isStarving ? 5.6 : 7.8; // Launches ~2.2m high in the bouncy castle!
  phys.onGround = false;
  phys.autoRebounds = 1; // One playful bouncy mattress rebound upon landing!
  if (sfxActive) playBouncyBoingSound(audioCtx, 1.0);
  return true;
}

// Step player physics inside the Bouncy Castle (stairs, upper deck, twin slides, bouncy mattress!)
export function stepPlayerInsideBouncyCastle(
  pos,
  phys,
  dt,
  isMoving,
  isStarving,
  audioCtx,
  sfxActive
) {
  const S = BOUNCY_CASTLE_CONFIG.scale;
  let { lx, lz } = worldToBouncyLocal(pos.x, pos.z);
  let ly = pos.y / S;

  // Confine smoothly inside the inflatable castle walls
  lx = Math.max(INTERIOR_LIMITS.minX, Math.min(INTERIOR_LIMITS.maxX, lx));
  lz = Math.max(INTERIOR_LIMITS.minZ, Math.min(INTERIOR_LIMITS.maxZ, lz));

  // Soft bounce-off around the central climbing cone tower (~localX: 2.25, localZ: -0.9, radius 1.2)
  const coneDx = lx - 2.3;
  const coneDz = lz - -0.95;
  const coneDist = Math.hypot(coneDx, coneDz);
  if (coneDist < 1.25 && coneDist > 0.001) {
    lx = 2.3 + (coneDx / coneDist) * 1.25;
    lz = -0.95 + (coneDz / coneDist) * 1.25;
  }

  let surf = sampleBouncySurface(lx, lz, ly);

  // Keep player out of solid under-tower / under-slide structure when on lower floor
  if (surf.zone === 'tower_block' || surf.zone === 'slide_block') {
    if (lz < 0.35 && lx < -0.2) {
      lx = -0.2;
    } else if (lx < -3.65 && lz > 1.75) {
      lz = 1.75;
    }
    surf = sampleBouncySurface(lx, lz, ly);
  }

  // Twin Slide Physics!
  if (surf.zone === 'slide') {
    phys.sliding = true;
    phys.vy = 0;
    phys.onGround = true;
    // Slide briskly down toward +localX and gently center in the chosen slide lane!
    lx += 4.6 * dt;
    lz += (surf.laneCenterZ - lz) * Math.min(1, dt * 8);
    const nextSurf = sampleBouncySurface(lx, lz, ly);
    ly = nextSurf.floorY;

    const now = performance.now();
    if (sfxActive && now - phys.lastSlideSoundAt > 1800) {
      phys.lastSlideSoundAt = now;
      playSlideWhooshSound(audioCtx);
    }

    // Pop off the bottom of the slide with a joyful mini-bounce onto the mattress!
    if (lx >= -0.32) {
      phys.sliding = false;
      lx = -0.05;
      phys.vy = 4.6;
      phys.onGround = false;
      if (sfxActive) playBouncyBoingSound(audioCtx, 0.72);
    }
  } else {
    phys.sliding = false;

    // Gravity & bouncy mattress landing!
    if (!phys.onGround || ly > surf.floorY + 0.05) {
      phys.vy -= 14.5 * dt;
      ly += phys.vy * dt;
      if (ly <= surf.floorY) {
        ly = surf.floorY;
        if (phys.autoRebounds > 0 && surf.zone === 'mattress') {
          phys.autoRebounds--;
          phys.vy = isStarving ? 3.2 : 4.4;
          phys.onGround = false;
          if (sfxActive) playBouncyBoingSound(audioCtx, 0.62);
        } else {
          phys.vy = 0;
          phys.onGround = true;
        }
      }
    } else {
      // Smoothly climb stairs / stand on upper deck / gentle walking bounce on inflatable floor!
      ly += (surf.floorY - ly) * Math.min(1, dt * 18);
      if (isMoving && surf.zone === 'mattress' && phys.onGround) {
        // Playful mini-hop every time player walks/runs on the air mattress!
        phys.vy = isStarving ? 2.1 : 3.25;
        phys.onGround = false;
        phys.autoRebounds = 0;
      }
    }
  }

  const worldPt = bouncyLocalToWorld(lx, lz);
  pos.x = worldPt.x;
  pos.y = ly * S;
  pos.z = worldPt.z;

  return {
    zone: surf.zone,
    sliding: phys.sliding,
    airborne: !phys.onGround,
    slideWorldYaw: BOUNCY_CASTLE_CONFIG.rotY + Math.PI / 2 // Facing down-slide (+localX)
  };
}

// Keep unpaid players safely outside the Bouncy Castle outer walls
export function resolveBouncyOuterCollision(pos, radius = 0.48) {
  const b = BOUNCY_CASTLE_CONFIG.outerBox;
  const cx = Math.max(b.minX, Math.min(b.maxX, pos.x));
  const cz = Math.max(b.minZ, Math.min(b.maxZ, pos.z));
  const dx = pos.x - cx;
  const dz = pos.z - cz;
  const distSq = dx * dx + dz * dz;
  if (distSq >= radius * radius) return false;

  if (distSq > 1e-6) {
    const dist = Math.sqrt(distSq);
    const push = radius - dist;
    pos.x += (dx / dist) * push;
    pos.z += (dz / dist) * push;
  } else {
    const dLeft = Math.abs(pos.x - b.minX);
    const dRight = Math.abs(b.maxX - pos.x);
    const dTop = Math.abs(pos.z - b.minZ);
    const dBot = Math.abs(b.maxZ - pos.z);
    const m = Math.min(dLeft, dRight, dTop, dBot);
    if (m === dLeft) pos.x = b.minX - radius;
    else if (m === dRight) pos.x = b.maxX + radius;
    else if (m === dTop) pos.z = b.minZ - radius;
    else pos.z = b.maxZ + radius;
  }
  return true;
}

// ============================================================================
// ENTRANCE SIGNBOARD & MINIMAP MARKER
// ============================================================================

function createBouncySignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 176;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 176);
  grad.addColorStop(0, '#1d4ed8');
  grad.addColorStop(0.5, '#7c3aed');
  grad.addColorStop(1, '#db2777');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 176);

  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 160);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 40px "Noto Sans Thai", sans-serif';
  ctx.fillText('🏰 บ้านลมยักษ์เลโก้', 256, 60);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 24px "Noto Sans Thai", sans-serif';
  ctx.fillText('ค่าเข้า 5 💰 • เล่นรอบละ 2:30 นาที (มีสไลเดอร์!)', 256, 120);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildBouncyEntranceSign(scene) {
  const g = new THREE.Group();
  g.name = 'BouncyCastleEntranceSign';
  // Stand cheerfully beside the front-left of the castle facing the walkway
  g.position.set(11.3, 0, 15.8);
  g.rotation.y = Math.PI + 0.22;

  const poleMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.5, roughness: 0.35 });
  for (const sx of [-1.05, 1.05]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 2.35, 8), poleMat);
    pole.position.set(sx, 1.175, 0);
    g.add(pole);
  }

  const signTex = createBouncySignTexture();
  const signMat = new THREE.MeshBasicMaterial({ map: signTex });
  const backing = new THREE.Mesh(new THREE.BoxGeometry(2.36, 0.82, 0.06), poleMat);
  backing.position.set(0, 1.92, 0);
  g.add(backing);

  const front = new THREE.Mesh(new THREE.PlaneGeometry(2.28, 0.75), signMat);
  front.position.set(0, 1.92, 0.035);
  g.add(front);

  const back = new THREE.Mesh(new THREE.PlaneGeometry(2.28, 0.75), signMat);
  back.position.set(0, 1.92, -0.035);
  back.rotation.y = Math.PI;
  g.add(back);

  scene.add(g);
  return g;
}

export function drawBouncyCastleMinimap(ctx, mapX, mapY, mapW, mapH) {
  const b = BOUNCY_CASTLE_CONFIG.outerBox;
  ctx.save();
  ctx.fillStyle = '#3b82f6';
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 1.5;
  ctx.fillRect(mapX(b.minX), mapY(b.minZ), mapW(b.maxX - b.minX), mapH(b.maxZ - b.minZ));
  ctx.strokeRect(mapX(b.minX), mapY(b.minZ), mapW(b.maxX - b.minX), mapH(b.maxZ - b.minZ));
  ctx.restore();
}

// ============================================================================
// PROCEDURAL PLAYFUL AUDIO (Boing Jump & Slide Whoosh!)
// ============================================================================

export function playBouncyBoingSound(audioCtx, strength = 1.0) {
  if (!audioCtx || audioCtx.state !== 'running') return;
  try {
    const out = audioCtx._sfxGain || audioCtx.destination;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(165, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.24);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.2 * Math.min(1, strength), now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.27);
    osc.connect(g).connect(out);
    osc.start(now);
    osc.stop(now + 0.29);
  } catch {}
}

export function playSlideWhooshSound(audioCtx) {
  if (!audioCtx || audioCtx.state !== 'running') return;
  try {
    const out = audioCtx._sfxGain || audioCtx.destination;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.45);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.14, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
    osc.connect(g).connect(out);
    osc.start(now);
    osc.stop(now + 0.5);
  } catch {}
}
