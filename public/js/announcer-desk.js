import * as THREE from 'three';

// ============================================================================
// TEMPLE ANNOUNCER DESK & PA HORN SPEAKER SYSTEM (โต๊ะมัคนายกประกาศงานวัด)
// Location: East Lawn between Sky Lantern Plaza, Wooden Pier, Pond & Sala Buddha
// Broadcast Scope: Entire Right/East Side of the Temple Fair (X >= -6.5 fade, full >= 1.5)
// Background Festival Music remains ON at all times while announcing!
// ============================================================================

export const ANNOUNCER_DESK_CONFIG = {
  x: 32.3,
  z: -2.2,
  rotY: -2.18, // Desk faces West-Northwest toward Lantern Plaza & Pier walkway
  seatX: 32.72,
  seatZ: -1.94,
  seatRotY: -2.18,
  standX: 31.35,
  standZ: -2.75,
  interactRadius: 3.4,
  fadeMinX: -6.5, // Smooth fade across Main Road (-6.5 .. +1.5)
  fullMinX: 1.5   // Full clear PA volume across the entire Right Side of the fair!
};

export function getAnnouncerRightSideGain(playerX) {
  if (!Number.isFinite(playerX) || playerX <= ANNOUNCER_DESK_CONFIG.fadeMinX) return 0;
  if (playerX >= ANNOUNCER_DESK_CONFIG.fullMinX) return 1.0;
  const t =
    (playerX - ANNOUNCER_DESK_CONFIG.fadeMinX) /
    (ANNOUNCER_DESK_CONFIG.fullMinX - ANNOUNCER_DESK_CONFIG.fadeMinX);
  return Math.max(0, Math.min(1, t * t * (3 - 2 * t)));
}

function createAnnouncerSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  // Rich crimson-maroon temple banner with double gold border
  const grad = ctx.createLinearGradient(0, 0, 512, 160);
  grad.addColorStop(0, '#450a0a');
  grad.addColorStop(0.5, '#7f1d1d');
  grad.addColorStop(1, '#450a0a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 160);

  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 144);
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, 476, 124);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 36px "Noto Sans Thai", sans-serif';
  ctx.fillText('🎙️ โต๊ะมัคนายกประกาศงานวัด', 256, 60);

  ctx.fillStyle = '#fef9c3';
  ctx.font = '600 22px "Noto Sans Thai", sans-serif';
  ctx.fillText('นั่งฟรี • พูดออกไมค์กระจายเสียงฝั่งขวาของงาน 📢', 256, 112);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createDeskFrontBannerTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#991b1b';
  ctx.fillRect(0, 0, 512, 192);

  // Gold temple trim top & bottom
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, 0, 512, 18);
  ctx.fillRect(0, 174, 512, 18);

  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 4;
  ctx.strokeRect(14, 28, 484, 136);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 40px "Noto Sans Thai", sans-serif';
  ctx.fillText('📢 กองอำนวยการ & โฆษกงานวัด', 256, 80);

  ctx.fillStyle = '#ffffff';
  ctx.font = '600 24px "Noto Sans Thai", sans-serif';
  ctx.fillText('วัดทุ่งท่าช้าง • งานลอยกระทง ๒๕๖๙', 256, 130);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildAnnouncerDesk(scene, addRotatedCollisionBox) {
  const root = new THREE.Group();
  root.name = 'AnnouncerDeskSystem';
  root.position.set(ANNOUNCER_DESK_CONFIG.x, 0, ANNOUNCER_DESK_CONFIG.z);
  root.rotation.y = ANNOUNCER_DESK_CONFIG.rotY;

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c341d, roughness: 0.8 });
  const clothRedMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.72 });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.55,
    roughness: 0.3,
    emissive: 0x92400e,
    emissiveIntensity: 0.35
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.65, roughness: 0.35 });
  const hornWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.35,
    metalness: 0.15,
    side: THREE.DoubleSide
  });

  // 1) Low Thai Temple Mat / Carpet Base under the Desk
  const carpet = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.04, 2.3),
    new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.9 })
  );
  carpet.position.set(0, 0.02, -0.15);
  root.add(carpet);

  // 2) Announcer Table (width 1.9m, height 0.82m, depth 0.86m) draped in red-gold temple cloth
  const tableCore = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.78, 0.82), clothRedMat);
  tableCore.position.set(0, 0.41, 0);
  root.add(tableCore);

  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.07, 0.92), woodMat);
  tableTop.position.set(0, 0.82, 0);
  root.add(tableTop);

  const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 0.94), goldMat);
  goldTrim.position.set(0, 0.76, 0);
  root.add(goldTrim);

  // Front banner facing visitors (+Z in local group)
  const frontBanner = new THREE.Mesh(
    new THREE.PlaneGeometry(1.76, 0.64),
    new THREE.MeshBasicMaterial({ map: createDeskFrontBannerTexture() })
  );
  frontBanner.position.set(0, 0.41, 0.416);
  root.add(frontBanner);

  // 3) Announcer Chair behind the desk (local -Z = behind table, facing +Z)
  const chairGroup = new THREE.Group();
  chairGroup.position.set(0, 0, -0.58);
  const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.07, 0.54), clothRedMat);
  seatMesh.position.y = 0.46;
  chairGroup.add(seatMesh);

  const backRest = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.56, 0.07), clothRedMat);
  backRest.position.set(0, 0.76, -0.24);
  chairGroup.add(backRest);

  const backGoldTop = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.09), goldMat);
  backGoldTop.position.set(0, 1.05, -0.24);
  chairGroup.add(backGoldTop);

  for (const lx of [-0.23, 0.23]) {
    for (const lz of [-0.22, 0.22]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.026, 0.45, 7), woodMat);
      leg.position.set(lx, 0.225, lz);
      chairGroup.add(leg);
    }
  }
  root.add(chairGroup);

  // 4) Vintage Temple PA Amplifier Box + Gooseneck Microphone + Golden Phan Tray on Desk
  const ampBox = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.22, 0.34), darkMetalMat);
  ampBox.position.set(-0.52, 0.96, 0.04);
  root.add(ampBox);

  // Glowing VU meter & power knobs on the amplifier
  const vuMeter = new THREE.Mesh(
    new THREE.PlaneGeometry(0.22, 0.08),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  vuMeter.position.set(-0.6, 0.99, 0.212);
  root.add(vuMeter);

  for (let k = 0; k < 3; k++) {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 8), goldMat);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(-0.42 + k * 0.065, 0.94, 0.215);
    root.add(knob);
  }

  // Gooseneck Desktop Microphone right in front of the seated announcer
  const micBase = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.04, 12), darkMetalMat);
  micBase.position.set(0.05, 0.87, -0.06);
  root.add(micBase);

  const micStem = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.34, 8), steelMat);
  micStem.position.set(0.05, 1.03, -0.1);
  micStem.rotation.x = -0.28;
  root.add(micStem);

  const micHead = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 8), steelMat);
  micHead.scale.set(0.9, 1.25, 0.9);
  micHead.position.set(0.05, 1.19, -0.15);
  root.add(micHead);

  const onAirLedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const micLed = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), onAirLedMat);
  micLed.position.set(0.05, 0.9, -0.01);
  root.add(micLed);

  // Small decorative golden offering tray (พานทอง) & warm desk lamp on right side of desk
  const trayCup = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.06, 0.12, 10), goldMat);
  trayCup.position.set(0.58, 0.92, 0.06);
  root.add(trayCup);

  const deskBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  );
  deskBulb.position.set(0.75, 1.18, -0.12);
  root.add(deskBulb);
  const lampStand = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.025, 0.34, 7), goldMat);
  lampStand.position.set(0.75, 1.0, -0.12);
  root.add(lampStand);

  // 5) Overhead Signboard Arch behind the Announcer Desk (readable from BOTH front & back!)
  for (const px of [-1.08, 1.08]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.048, 2.75, 8), steelMat);
    post.position.set(px, 1.375, -0.92);
    root.add(post);
  }
  const signTex = createAnnouncerSignTexture();
  const signMat = new THREE.MeshBasicMaterial({ map: signTex });
  const signBoardBacking = new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.78, 0.04), goldMat);
  signBoardBacking.position.set(0, 2.48, -0.92);
  root.add(signBoardBacking);

  const signFront = new THREE.Mesh(new THREE.PlaneGeometry(2.36, 0.72), signMat);
  signFront.position.set(0, 2.48, -0.898);
  root.add(signFront);

  const signBack = new THREE.Mesh(new THREE.PlaneGeometry(2.36, 0.72), signMat);
  signBack.position.set(0, 2.48, -0.942);
  signBack.rotation.y = Math.PI;
  root.add(signBack);

  // 6) Tall Temple PA Horn Speaker Tower (เสาลำโพงฮอร์นปากแตร 4 ทิศทาง สูง 6.2 เมตร!)
  const towerGroup = new THREE.Group();
  towerGroup.position.set(-1.55, 0, -0.55);

  const towerBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 0.24, 10), darkMetalMat);
  towerBase.position.y = 0.12;
  towerGroup.add(towerBase);

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.085, 6.0, 10), steelMat);
  mast.position.y = 3.0;
  towerGroup.add(mast);

  const crossBar = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.07, 0.86), darkMetalMat);
  crossBar.position.y = 5.82;
  towerGroup.add(crossBar);

  // 4 Classic White Megaphone Horn Speakers facing N, E, S, W
  const hornGeo = new THREE.CylinderGeometry(0.32, 0.075, 0.56, 14, 1, true);
  hornGeo.rotateX(Math.PI / 2); // Flare opens toward +Z
  const driverGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.16, 10);
  driverGeo.rotateX(Math.PI / 2);

  for (let i = 0; i < 4; i++) {
    const hWrap = new THREE.Group();
    hWrap.position.y = 5.86;
    hWrap.rotation.y = (i * Math.PI) / 2 + Math.PI / 4;

    const driver = new THREE.Mesh(driverGeo, darkMetalMat);
    driver.position.set(0, 0, 0.26);
    hWrap.add(driver);

    const horn = new THREE.Mesh(hornGeo, hornWhiteMat);
    horn.position.set(0, -0.03, 0.56);
    horn.rotation.x = 0.22; // Angled slightly downward toward the crowd!
    hWrap.add(horn);

    const innerCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.22, 10),
      steelMat
    );
    innerCone.rotation.x = -Math.PI / 2 + 0.22;
    innerCone.position.set(0, -0.02, 0.52);
    hWrap.add(innerCone);

    towerGroup.add(hWrap);
  }

  // Beacon light on top of PA speaker mast
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), beaconMat);
  beacon.position.y = 6.14;
  towerGroup.add(beacon);

  // Expanding golden soundwave rings around the 4 PA horns when broadcasting!
  const soundRings = [];
  const ringGeo = new THREE.RingGeometry(0.45, 0.62, 24);
  ringGeo.rotateX(-Math.PI / 2);
  for (let r = 0; r < 3; r++) {
    const rMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const rMesh = new THREE.Mesh(ringGeo, rMat);
    rMesh.position.y = 5.82;
    rMesh.visible = false;
    towerGroup.add(rMesh);
    soundRings.push({ mesh: rMesh, mat: rMat, phase: r / 3 });
  }

  root.add(towerGroup);
  scene.add(root);

  // Add tight collision box for the table itself (leaving chair behind it walkable/approachable!)
  if (typeof addRotatedCollisionBox === 'function') {
    addRotatedCollisionBox(
      ANNOUNCER_DESK_CONFIG.x,
      ANNOUNCER_DESK_CONFIG.z,
      2.05,
      0.95,
      ANNOUNCER_DESK_CONFIG.rotY,
      'announcer-desk'
    );
  }

  return {
    root,
    soundRings,
    onAirLedMat,
    beaconMat,
    isBroadcasting: false,
    broadcastPulseUntil: 0
  };
}

export function updateAnnouncerDesk(deskState, elapsed, isBroadcastingNow) {
  if (!deskState) return;
  const active = Boolean(isBroadcastingNow) || performance.now() < deskState.broadcastPulseUntil;

  deskState.onAirLedMat.color.setHex(
    active ? (Math.sin(elapsed * 10) > 0 ? 0xff2a2a : 0xfbbf24) : 0x7f1d1d
  );
  deskState.beaconMat.color.setHex(active ? 0xfef08a : 0xd97706);

  for (const item of deskState.soundRings) {
    if (!active) {
      item.mesh.visible = false;
      continue;
    }
    item.mesh.visible = true;
    const cycle = (elapsed * 0.85 + item.phase) % 1;
    const scale = 1.0 + cycle * 4.8;
    item.mesh.scale.setScalar(scale);
    item.mat.opacity = (1 - cycle) * 0.65;
  }
}

export function drawAnnouncerMinimap(ctx, mapX, mapY) {
  const sx = mapX(ANNOUNCER_DESK_CONFIG.x);
  const sy = mapY(ANNOUNCER_DESK_CONFIG.z);
  ctx.save();
  ctx.fillStyle = '#ef4444';
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(sx, sy, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// ============================================================================
// TEMPLE PA CHIME ("ติ๊ง-ต่อง-แหน่ว!") & LIVE PA HORN VOICE STREAMING ENGINE
// ============================================================================

export function playPaChimeSound(audioCtx, volume = 0.85) {
  if (!audioCtx || volume <= 0.01) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  if (audioCtx.state !== 'running') return;
  try {
    const now = audioCtx.currentTime;
    // Classic 3-note Thai school/temple PA chime: C5 -> E5 -> G5
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const t0 = now + idx * 0.2;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      const bp = audioCtx.createBiquadFilter();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t0);

      bp.type = 'peaking';
      bp.frequency.setValueAtTime(1400, t0);
      bp.gain.setValueAtTime(4, t0);

      g.gain.setValueAtTime(0.001, t0);
      g.gain.linearRampToValueAtTime(0.24 * volume, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.55);

      osc.connect(bp).connect(g).connect(audioCtx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.58);
    });
  } catch {}
}

// Live PCM16 PA Horn Transmitter (12 kHz mono Int16 -> ~4 KB per 170ms packet, zero header issues!)
export function createPaVoiceStreamer() {
  return {
    sourceNode: null,
    procNode: null,
    muteGain: null,
    active: false,
    resampleCarry: []
  };
}

export function startPaVoiceStreamer(streamer, audioCtx, mediaStream, onPcmPacket) {
  if (!streamer || !audioCtx || !mediaStream || streamer.active) return;
  try {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    const src = audioCtx.createMediaStreamSource(mediaStream);
    const proc = audioCtx.createScriptProcessor(4096, 1, 1);
    const mute = audioCtx.createGain();
    mute.gain.value = 0;

    const inRate = audioCtx.sampleRate || 48000;
    const outRate = 12000;
    const ratio = inRate / outRate;

    proc.onaudioprocess = (e) => {
      if (!streamer.active) return;
      const input = e.inputBuffer.getChannelData(0);
      const outLen = Math.floor(input.length / ratio);
      if (outLen <= 0) return;

      const pcm = new Int16Array(outLen);
      let peak = 0;
      for (let i = 0; i < outLen; i++) {
        const srcIdx = Math.min(input.length - 1, Math.floor(i * ratio));
        const sample = Math.max(-1, Math.min(1, input[srcIdx] * 1.35));
        const abs = Math.abs(sample);
        if (abs > peak) peak = abs;
        pcm[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      }
      // Noise gate: skip pure silence packets if mic is muted/completely silent
      if (peak < 0.004) return;
      if (typeof onPcmPacket === 'function') {
        onPcmPacket(outRate, pcm.buffer);
      }
    };

    src.connect(proc);
    proc.connect(mute);
    mute.connect(audioCtx.destination);

    streamer.sourceNode = src;
    streamer.procNode = proc;
    streamer.muteGain = mute;
    streamer.active = true;
  } catch (err) {
    console.warn('PA Voice streamer init error:', err);
  }
}

export function stopPaVoiceStreamer(streamer) {
  if (!streamer) return;
  streamer.active = false;
  try {
    if (streamer.procNode) {
      streamer.procNode.onaudioprocess = null;
      streamer.procNode.disconnect();
    }
    if (streamer.sourceNode) streamer.sourceNode.disconnect();
    if (streamer.muteGain) streamer.muteGain.disconnect();
  } catch {}
  streamer.procNode = null;
  streamer.sourceNode = null;
  streamer.muteGain = null;
}

// Live PA Horn Receiver Chain (Authentic Thai Temple Fair Horn Speaker: Bandpass + Slapback Echo!)
let _paChain = null;
function ensurePaHornChain(audioCtx) {
  if (_paChain && _paChain.ctx === audioCtx) return _paChain;

  const hp = audioCtx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 360;

  const presence = audioCtx.createBiquadFilter();
  presence.type = 'peaking';
  presence.frequency.value = 1850;
  presence.Q.value = 1.1;
  presence.gain.value = 5.5;

  const lp = audioCtx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 3900;

  // Subtle outdoor fairground PA echo (135ms gentle slapback)
  const delay = audioCtx.createDelay(0.5);
  delay.delayTime.value = 0.135;
  const delayGain = audioCtx.createGain();
  delayGain.gain.value = 0.22;

  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 1.0;

  hp.connect(presence);
  presence.connect(lp);
  lp.connect(masterGain);

  lp.connect(delay);
  delay.connect(delayGain);
  delayGain.connect(masterGain);

  masterGain.connect(audioCtx.destination);

  _paChain = {
    ctx: audioCtx,
    input: hp,
    masterGain,
    nextPlayTime: 0
  };
  return _paChain;
}

export function playPaVoicePcmPacket(audioCtx, rawBuffer, sampleRate, effectiveVolume) {
  if (!audioCtx || !rawBuffer || effectiveVolume <= 0.01) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  if (audioCtx.state !== 'running') return;

  try {
    const bytes =
      rawBuffer instanceof ArrayBuffer
        ? new Int16Array(rawBuffer)
        : ArrayBuffer.isView(rawBuffer)
          ? new Int16Array(rawBuffer.buffer, rawBuffer.byteOffset, Math.floor(rawBuffer.byteLength / 2))
          : null;
    if (!bytes || bytes.length === 0) return;

    const sr = Math.max(8000, Math.min(48000, Number(sampleRate) || 12000));
    const chain = ensurePaHornChain(audioCtx);
    chain.masterGain.gain.setTargetAtTime(Math.min(1.6, effectiveVolume * 1.25), audioCtx.currentTime, 0.04);

    const audioBuf = audioCtx.createBuffer(1, bytes.length, sr);
    const ch = audioBuf.getChannelData(0);
    for (let i = 0; i < bytes.length; i++) {
      ch[i] = bytes[i] / 32768;
    }

    const src = audioCtx.createBufferSource();
    src.buffer = audioBuf;
    src.connect(chain.input);

    const now = audioCtx.currentTime;
    if (chain.nextPlayTime < now + 0.02 || chain.nextPlayTime > now + 0.65) {
      chain.nextPlayTime = now + 0.06; // Tiny jitter buffer for smooth gapless PA speech
    }
    src.start(chain.nextPlayTime);
    chain.nextPlayTime += audioBuf.duration;
  } catch {}
}
