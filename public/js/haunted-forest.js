import * as THREE from 'three';

// ============================================================================
// HAUNTED FOREST BESIDE THE UBOSOT (ผีป่าช้าข้างอุโบสถ)
// Haunted area: Northeast dark forest (X: 24.5..55.8, Z: -57.5..-30.5)
// Safe zones: Inside Ubosot Kampheng Kaeo (X <= 23.2) OR back out to temple fair (Z > -30.0)
// ============================================================================

export const HAUNTED_FOREST_BOUNDS = {
  minX: 24.2,
  maxX: 56.0,
  minZ: -58.0,
  maxZ: -30.4
};

export function isInHauntedForest(x, z) {
  return (
    x >= HAUNTED_FOREST_BOUNDS.minX &&
    x <= HAUNTED_FOREST_BOUNDS.maxX &&
    z >= HAUNTED_FOREST_BOUNDS.minZ &&
    z <= HAUNTED_FOREST_BOUNDS.maxZ
  );
}

export function isInUbosotSanctuary(x, z) {
  return x >= 6.8 && x <= 23.3 && z >= -56.4 && z <= -30.6;
}

function createWarningSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Weathered dark wood plank look
  ctx.fillStyle = '#271a12';
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 496, 240);

  // Subtle weathered grain lines
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 3;
  for (let y = 24; y < 240; y += 22) {
    ctx.beginPath();
    ctx.moveTo(14, y);
    ctx.lineTo(498, y + (y % 44 === 0 ? 4 : -3));
    ctx.stroke();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 44px "Noto Sans Thai", sans-serif';
  ctx.fillStyle = '#ef4444';
  ctx.fillText('⚠️ ป่าช้าหลังโบสถ์', 256, 78);

  ctx.font = '800 34px "Noto Sans Thai", sans-serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('ห้ามเข้ายามวิกาล! 👻', 256, 146);

  ctx.font = '600 22px "Noto Sans Thai", sans-serif';
  ctx.fillStyle = '#fca5a5';
  ctx.fillText('(หากเจอดี ให้รีบวิ่งเข้าเขตพระอุโบสถ)', 256, 204);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createGhostMistTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 6, 64, 64, 64);
  g.addColorStop(0, 'rgba(134, 239, 172, 0.55)');
  g.addColorStop(0.45, 'rgba(22, 101, 52, 0.28)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildThaiGhostMesh() {
  const g = new THREE.Group();
  g.name = 'ThaiForestGhost';

  const dressMat = new THREE.MeshStandardMaterial({
    color: 0xdbe7e0,
    roughness: 0.9,
    transparent: true,
    opacity: 0.88,
    emissive: 0x3b6e58,
    emissiveIntensity: 0.55,
    side: THREE.DoubleSide
  });
  const paleSkinMat = new THREE.MeshStandardMaterial({
    color: 0xd9e6df,
    roughness: 0.7,
    emissive: 0x4b7764,
    emissiveIntensity: 0.5
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x050507,
    roughness: 0.95
  });
  const redEyeMat = new THREE.MeshBasicMaterial({ color: 0xff1818 });
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0x090205 });

  // Tattered floating white ghost dress (open bottom swaying cone)
  const dress = new THREE.Mesh(new THREE.ConeGeometry(0.46, 1.55, 12, 1, true), dressMat);
  dress.position.y = 1.15;
  g.add(dress);

  // Ragged drifting tattered strips around hem
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.48), dressMat);
    strip.position.set(Math.cos(a) * 0.42, 0.34, Math.sin(a) * 0.42);
    strip.rotation.y = -a + Math.PI / 2;
    g.add(strip);
  }

  // Pale dead head + sunken red glowing eyes + dark screaming mouth
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 14, 12), paleSkinMat);
  head.scale.set(0.92, 1.12, 0.95);
  head.position.set(0, 2.04, 0.02);
  g.add(head);

  for (const ex of [-0.072, 0.072]) {
    const socket = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 6), mouthMat);
    socket.position.set(ex, 2.06, 0.175);
    g.add(socket);

    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), redEyeMat);
    eye.position.set(ex, 2.06, 0.208);
    g.add(eye);
  }

  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), mouthMat);
  mouth.scale.set(0.85, 1.55, 0.5);
  mouth.position.set(0, 1.92, 0.185);
  g.add(mouth);

  // Long black streaming ghost hair framing & partly draping over face and back
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.225, 12, 10), hairMat);
  hairCap.position.set(0, 2.09, -0.02);
  g.add(hairCap);

  const backHair = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 1.15, 10, 1, true, Math.PI * 0.4, Math.PI * 1.2), hairMat);
  backHair.position.set(0, 1.54, -0.04);
  g.add(backHair);

  // Strands hanging down past cheeks
  for (const sx of [-0.14, 0.14]) {
    const strand = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.85, 0.05), hairMat);
    strand.position.set(sx, 1.72, 0.12);
    strand.rotation.z = sx > 0 ? -0.08 : 0.08;
    g.add(strand);
  }

  // Reaching pale spectral arms stretching menacingly forward (+Z)
  const armL = new THREE.Group();
  armL.position.set(-0.26, 1.74, 0.06);
  const armLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.03, 0.68, 7), paleSkinMat);
  armLMesh.rotation.x = Math.PI / 2;
  armLMesh.position.z = 0.34;
  armL.add(armLMesh);
  g.add(armL);

  const armR = new THREE.Group();
  armR.position.set(0.26, 1.74, 0.06);
  const armRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.03, 0.68, 7), paleSkinMat);
  armRMesh.rotation.x = Math.PI / 2;
  armRMesh.position.z = 0.34;
  armR.add(armRMesh);
  g.add(armR);

  // Swirling eerie green-black mist under floating ghost
  const mistTex = createGhostMistTexture();
  const mist = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 2.6),
    new THREE.MeshBasicMaterial({
      map: mistTex,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  mist.rotation.x = -Math.PI / 2;
  mist.position.y = 0.08;
  g.add(mist);

  g.visible = false;
  return { group: g, armL, armR, mist, dressMat };
}

export function buildHauntedForest(scene, addCollisionBox) {
  const root = new THREE.Group();
  root.name = 'HauntedForestSystem';

  // Spooky crooked wooden warning sign at the entrance to the forest behind the Photo Booth (X=25.4, Z=-30.4)
  const signGroup = new THREE.Group();
  signGroup.position.set(25.2, 0, -30.1);
  signGroup.rotation.y = 0.25;

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x3b2618, roughness: 0.95 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 2.0, 7), woodMat);
  pole.position.y = 1.0;
  pole.rotation.z = 0.06;
  signGroup.add(pole);

  const signBoard = new THREE.Mesh(
    new THREE.PlaneGeometry(1.95, 0.98),
    new THREE.MeshBasicMaterial({ map: createWarningSignTexture(), side: THREE.DoubleSide })
  );
  signBoard.position.set(0.04, 1.56, 0.05);
  signBoard.rotation.z = -0.05;
  signGroup.add(signBoard);

  // Eerie dim red flickering spirit lantern hanging from the warning sign
  const redBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff2a2a })
  );
  redBulb.position.set(0.95, 1.15, 0.06);
  signGroup.add(redBulb);

  root.add(signGroup);
  if (typeof addCollisionBox === 'function') {
    addCollisionBox(24.95, 25.45, -30.35, -29.85, 'haunted-warning-sign');
  }

  // Build the 3D Thai Ghost (hidden until player wanders into the haunted forest!)
  const ghost = buildThaiGhostMesh();
  root.add(ghost.group);

  scene.add(root);

  return {
    root,
    ghost,
    redBulb,
    active: false,
    inForestTime: 0,
    chaseStarted: false,
    dissolving: false,
    dissolveTimer: 0,
    jumpscareCooldown: 0,
    nextEerieSoundAt: 0,
    nextHeartbeatAt: 0,
    musicDuckFactor: 1.0, // 1.0 = normal music, 0.12 = spooky quiet inside forest
    horrorIntensity: 0 // 0..1 controls fog color & crimson-black vignette
  };
}

// ----------------------------------------------------------------------------
// Procedural Horror Audio (Eerie Howl, Creepy Whisper-Laugh, Heartbeat, Jumpscare Shriek)
// ----------------------------------------------------------------------------

function playSpookyAmbientSound(audioCtx, enabled) {
  if (!enabled || !audioCtx || audioCtx.state !== 'running') return;
  try {
    const now = audioCtx.currentTime;
    // Eerie wavering spectral moan / distant howl
    const osc = audioCtx.createOscillator();
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(310, now);
    osc.frequency.exponentialRampToValueAtTime(215, now + 1.8);
    lfo.frequency.setValueAtTime(5.5, now);
    lfoGain.gain.setValueAtTime(14, now);
    lfo.connect(lfoGain).connect(osc.frequency);

    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.11, now + 0.45);
    g.gain.exponentialRampToValueAtTime(0.001, now + 2.1);

    osc.connect(g).connect(audioCtx.destination);
    osc.start(now);
    lfo.start(now);
    osc.stop(now + 2.2);
    lfo.stop(now + 2.2);
  } catch {}
}

function playHeartbeatSound(audioCtx, enabled, intensity = 0.6) {
  if (!enabled || !audioCtx || audioCtx.state !== 'running') return;
  try {
    const now = audioCtx.currentTime;
    [0, 0.17].forEach((offset, idx) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx === 0 ? 72 : 58, now + offset);
      osc.frequency.exponentialRampToValueAtTime(30, now + offset + 0.12);
      g.gain.setValueAtTime(0.22 * intensity, now + offset);
      g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.15);
      osc.connect(g).connect(audioCtx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.16);
    });
  } catch {}
}

function playJumpscareShriek(audioCtx, enabled) {
  if (!enabled || !audioCtx || audioCtx.state !== 'running') return;
  try {
    const now = audioCtx.currentTime;
    // Dissonant tritone shriek + metallic noise burst (brief 0.65s scare!)
    [587.33, 830.61, 1244.51].forEach((f) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.62, now + 0.58);
      g.gain.setValueAtTime(0.14, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.62);
      osc.connect(g).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    });

    const dur = 0.5;
    const len = Math.floor(audioCtx.sampleRate * dur);
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.4);
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buf;
    const hp = audioCtx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1100;
    const ng = audioCtx.createGain();
    ng.gain.setValueAtTime(0.24, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + dur);
    noise.connect(hp).connect(ng).connect(audioCtx.destination);
    noise.start(now);
  } catch {}
}

function spawnGhostAheadOfPlayer(haunted, playerPos) {
  // Spawn ~10.5m away deeper inside the haunted forest so she emerges from the shadows!
  let gx = playerPos.x + (playerPos.x < 40 ? 9.5 : -9.5);
  let gz = playerPos.z + (playerPos.z > -44 ? -8.5 : 8.5);
  gx = THREE.MathUtils.clamp(gx, 26.5, 53.5);
  gz = THREE.MathUtils.clamp(gz, -55.5, -33.0);
  haunted.ghost.group.position.set(gx, 0, gz);
  haunted.ghost.group.visible = true;
  haunted.ghost.dressMat.opacity = 0.88;
}

const _normalFogCol = new THREE.Color(0x060a18);
const _hauntedFogCol = new THREE.Color(0x030e08);

export function updateHauntedForest(haunted, playerPos, scene, dt, elapsed, callbacks) {
  if (!haunted || !playerPos) return;

  // Flicker the warning sign's spooky red lantern
  if (haunted.redBulb) {
    haunted.redBulb.visible = Math.sin(elapsed * 11) > -0.65;
  }

  if (haunted.jumpscareCooldown > 0) {
    haunted.jumpscareCooldown = Math.max(0, haunted.jumpscareCooldown - dt);
  }

  const inForest = isInHauntedForest(playerPos.x, playerPos.z);
  const inUbosot = isInUbosotSanctuary(playerPos.x, playerPos.z);

  if (inForest) {
    haunted.inForestTime += dt;
    haunted.dissolving = false;
    haunted.musicDuckFactor += (0.1 - haunted.musicDuckFactor) * Math.min(1, dt * 3.5);
    haunted.horrorIntensity += (1.0 - haunted.horrorIntensity) * Math.min(1, dt * 2.5);

    // Trigger ghost emergence once player steps ~1.1s deep into the dark forest!
    if (!haunted.chaseStarted) {
      if (callbacks?.onHorrorOverlay) {
        callbacks.onHorrorOverlay(haunted.horrorIntensity * 0.45, false);
      }
      if (haunted.inForestTime >= 1.1) {
        haunted.chaseStarted = true;
        haunted.active = true;
        spawnGhostAheadOfPlayer(haunted, playerPos);
        playSpookyAmbientSound(callbacks?.audioCtx, callbacks?.soundEnabled);
        haunted.nextEerieSoundAt = elapsed + 5.2;
        if (callbacks?.onGhostAlert) {
          callbacks.onGhostAlert('👻 มีบางอย่างลอยออกมาจากป่าช้าหลังโบสถ์! รีบวิ่งเข้าเขตพระอุโบสถหรือหนีออกจากป่า!');
        }
      }
    }

    if (haunted.chaseStarted && haunted.ghost.group.visible) {
      const gPos = haunted.ghost.group.position;
      const dx = playerPos.x - gPos.x;
      const dz = playerPos.z - gPos.z;
      const dist = Math.hypot(dx, dz);

      // Glide steadily toward the player (3.7 m/s — slower than walk 4.5 / sprint 8.2 so player can always escape!)
      if (dist > 0.2) {
        const speed = haunted.jumpscareCooldown > 0 ? 1.8 : 3.75;
        gPos.x += (dx / dist) * speed * dt;
        gPos.z += (dz / dist) * speed * dt;
        // Keep ghost trapped strictly inside the haunted forest!
        gPos.x = THREE.MathUtils.clamp(gPos.x, HAUNTED_FOREST_BOUNDS.minX + 0.3, HAUNTED_FOREST_BOUNDS.maxX - 0.5);
        gPos.z = THREE.MathUtils.clamp(gPos.z, HAUNTED_FOREST_BOUNDS.minZ + 0.5, HAUNTED_FOREST_BOUNDS.maxZ - 0.3);
        haunted.ghost.group.rotation.y = Math.atan2(dx, dz);
      }

      // Eerie floating hover + outstretched grasping arms + spinning mist
      gPos.y = Math.sin(elapsed * 2.8) * 0.14;
      haunted.ghost.armL.rotation.x = Math.sin(elapsed * 4.2) * 0.18;
      haunted.ghost.armR.rotation.x = Math.cos(elapsed * 4.2) * 0.18;
      haunted.ghost.mist.rotation.z = elapsed * 1.4;

      // Periodic spooky moans & accelerating heartbeat as ghost closes in!
      if (elapsed >= haunted.nextEerieSoundAt) {
        playSpookyAmbientSound(callbacks?.audioCtx, callbacks?.soundEnabled);
        haunted.nextEerieSoundAt = elapsed + 4.8 + Math.random() * 2.5;
      }
      if (dist < 10.5 && elapsed >= haunted.nextHeartbeatAt) {
        const closeness = THREE.MathUtils.clamp(1 - dist / 10.5, 0.2, 1);
        playHeartbeatSound(callbacks?.audioCtx, callbacks?.soundEnabled, closeness);
        haunted.nextHeartbeatAt = elapsed + (1.05 - closeness * 0.55);
      }

      // Update crimson-black vignette darkness based on ghost proximity
      const proximity = THREE.MathUtils.clamp(1 - (dist - 1.5) / 11.0, 0.25, 1);
      if (callbacks?.onHorrorOverlay) {
        callbacks.onHorrorOverlay(proximity, dist < 5.5);
      }

      // JUMPSCARE if ghost catches up to player!
      if (dist < 1.65 && haunted.jumpscareCooldown <= 0) {
        haunted.jumpscareCooldown = 5.5;
        playJumpscareShriek(callbacks?.audioCtx, callbacks?.soundEnabled);
        if (callbacks?.onJumpscare) {
          callbacks.onJumpscare();
        }
        // Recoil ghost back into the trees so player has a fair chance to sprint to safety!
        spawnGhostAheadOfPlayer(haunted, playerPos);
      }
    }
  } else {
    // Player escaped to the Ubosot Sanctuary OR back out of the forest!
    if (haunted.active || haunted.chaseStarted) {
      haunted.active = false;
      haunted.chaseStarted = false;
      haunted.dissolving = true;
      haunted.dissolveTimer = 1.0;
      if (callbacks?.onGhostBanished) {
        callbacks.onGhostBanished(inUbosot);
      }
    }
    haunted.inForestTime = 0;
    haunted.musicDuckFactor += (1.0 - haunted.musicDuckFactor) * Math.min(1, dt * 2.5);
    haunted.horrorIntensity += (0 - haunted.horrorIntensity) * Math.min(1, dt * 3.0);

    if (callbacks?.onHorrorOverlay) {
      callbacks.onHorrorOverlay(0, false);
    }

    // Dissolve ghost back into dark forest shadows smoothly!
    if (haunted.dissolving && haunted.ghost.group.visible) {
      haunted.dissolveTimer -= dt * 1.4;
      haunted.ghost.group.position.y += dt * 0.9;
      haunted.ghost.dressMat.opacity = Math.max(0, haunted.dissolveTimer * 0.88);
      if (haunted.dissolveTimer <= 0) {
        haunted.dissolving = false;
        haunted.ghost.group.visible = false;
      }
    }
  }

  // Smoothly blend scene fog into spooky dark-green forest mist while inside the haunted woods
  if (scene.fog) {
    const t = haunted.horrorIntensity;
    scene.fog.color.copy(_normalFogCol).lerp(_hauntedFogCol, t);
    const baseDensity = callbacks?.lowGraphics ? 0.011 : 0.0062;
    scene.fog.density = baseDensity + t * 0.022;
  }
}
