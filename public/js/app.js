import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {
  buildTempleGardens,
  setGardenGraphicsMode,
  updateTempleGardens,
  drawGardenMinimap
} from './garden.js';
import {
  LANTERN_PLAZA_CONFIG,
  buildLanternPlaza,
  setLanternPlazaGraphicsMode,
  createReleasedLanternMesh,
  updateLanternPlaza,
  drawLanternPlazaMinimap
} from './lantern-plaza.js';
import {
  buildFrontRoad,
  setFrontRoadGraphicsMode,
  updateFrontRoad,
  drawFrontRoadMinimap,
  upgradeRoadMotorcycles
} from './front-road.js';

// Backend API/Socket origin (empty = same origin; set via /config.js when hosting public/ on Cloudflare Pages)
const SERVER_URL = (window.LOY_KRATHONG_CONFIG?.serverUrl || '').replace(/\/+$/, '');
const apiUrl = (path) => `${SERVER_URL}${path}`;

// ============================================================================
// 1. CONSTANTS, ZONES & CONFIGURATION
// ============================================================================

const MODEL_VER = '?v=3';
const MODEL_SPECS = [
  {
    key: 'gate',
    url: `/models/gate.glb${MODEL_VER}`,
    label: 'ซุ้มประตูปรางค์ 3 ยอด',
    pos: [0, 0, 54],
    rotY: 0,
    fallbackSize: [9, 12, 3.5]
  },
  {
    key: 'tunnel24',
    url: `/models/tunnel_24m.glb${MODEL_VER}`,
    label: 'อุโมงค์ไฟ 24 เมตร',
    pos: [8, 0, -7],
    rotY: 0,
    fallbackSize: [3.2, 3.5, 24]
  },
  {
    key: 'tunnel18',
    url: `/models/tunnel_18m.glb${MODEL_VER}`,
    label: 'อุโมงค์ไฟ 18 เมตร',
    pos: [19, 0, -20.6],
    rotY: Math.PI / 2,
    fallbackSize: [3.2, 3.5, 18]
  },
  {
    key: 'krathongTables',
    url: `/models/krathong_tables.glb${MODEL_VER}`,
    label: 'โต๊ะบูชากระทง',
    pos: [20, 0, -25.8],
    rotY: 0,
    animate: true,
    fallbackSize: [5, 2.2, 2]
  },
  {
    key: 'concertStage',
    url: `/models/concert_stage.glb${MODEL_VER}`,
    label: 'เวทีคอนเสิร์ตกลางแจ้ง',
    pos: [-21, 0, -52.5],
    rotY: 0,
    animate: true,
    fallbackSize: [22, 8, 7.5]
  },
  {
    key: 'ubosot',
    url: `/models/ubosot.glb${MODEL_VER}`,
    label: 'อุโบสถ',
    pos: [15, 0, -43.5],
    rotY: 0,
    fallbackSize: [16.76, 11.5, 25.96]
  },
  {
    key: 'salaBuddha',
    url: `/models/sala_buddha.glb${MODEL_VER}`,
    label: 'ศาลาพระพุทธรูป',
    pos: [31, 0, 13],
    rotY: -Math.PI / 2,
    fallbackSize: [10.64, 6, 15]
  }
];

const AVATAR_CATALOG = [
  { id: 'Avatar_BoyCargo', suffix: 'BoyCargo', label: 'หนุ่มคาร์โก้', tag: 'กลาง', icon: '🧢' },
  { id: 'Avatar_BoySport', suffix: 'BoySport', label: 'หนุ่มสปอร์ต', tag: 'กลาง', icon: '⚽' },
  { id: 'Avatar_ManShirt', suffix: 'ManShirt', label: 'หนุ่มเชิ้ตขาว', tag: 'โต', icon: '👔' },
  { id: 'Avatar_GirlPink', suffix: 'GirlPink', label: 'สาวชุดชมพู', tag: 'กลาง', icon: '🎀' },
  { id: 'Avatar_GirlBeret', suffix: 'GirlBeret', label: 'สาวหมวกเบเรต์', tag: 'กลาง', icon: '🎨' },
  { id: 'Avatar_WomanBoots', suffix: 'WomanBoots', label: 'สาวบูทเท่', tag: 'โต', icon: '👢' },
  { id: 'Avatar_ChibiBoyRed', suffix: 'ChibiBoyRed', label: 'จิบิฮู้ดแดง', tag: 'จิบิ', icon: '🧧' },
  { id: 'Avatar_ChibiManSuit', suffix: 'ChibiManSuit', label: 'จิบิสูท', tag: 'จิบิ', icon: '🎩' },
  { id: 'Avatar_ChibiGirlBun', suffix: 'ChibiGirlBun', label: 'จิบิมวยผม', tag: 'จิบิ', icon: '🍡' },
  { id: 'Avatar_ChibiGirlTwintails', suffix: 'ChibiGirlTwintails', label: 'จิบิทวินเทล', tag: 'จิบิ', icon: '🌸' }
];

const AVATAR_BY_ID = new Map(AVATAR_CATALOG.map((a) => [a.id, a]));

const avatarBank = {
  loaded: false,
  scene: null,
  animations: []
};

const KRATHONG_META = {
  banana: { name: 'กระทงใบตอง', emoji: '🌿' },
  lotus: { name: 'กระทงดอกบัว', emoji: '🪷' },
  bread: { name: 'กระทงขนมปัง', emoji: '🍞' }
};

const BUDDHA_BLESSINGS = [
  'ขอให้คุณและครอบครัวประสบแต่ความสุข ความเจริญ สุขภาพพลานามัยแข็งแรง ปราศจากโรคภัยไข้เจ็บทั้งปวง',
  'ขอบุญกุศลในค่ำคืนวันเพ็ญเดือนสิบสอง จงดลบันดาลให้การงานราบรื่น สมหวังในสิ่งที่ปรารถนาทุกประการ',
  'ขอให้ทุกข์โศกโรคภัยลอยหายไปกับสายน้ำ เหลือไว้แต่สิริมงคล ความร่มเย็นเป็นสุขตลอดปี',
  'ขอให้มีสติปัญญาแจ่มใส ดุจแสงจันทร์วันเพ็ญ ก้าวผ่านทุกอุปสรรคได้อย่างสง่างาม',
  'ขอให้โชคลาภ เงินทอง และกัลยาณมิตรที่ดีหลั่งไหลเข้ามาไม่ขาดสาย ตลอดไปเทอญ'
];

const INTERACT_ZONES = [
  {
    id: 'krathong-shop',
    x: 20,
    z: -24.5,
    radius: 4.8,
    label: 'เลือกบูชากระทง (3 แบบ)',
    dialogId: 'dialog-krathong-shop'
  },
  {
    id: 'float-pier',
    x: 35.4,
    z: -12,
    radius: 4.8,
    label: 'ลอยกระทงอธิษฐาน',
    dialogId: 'dialog-float-krathong'
  },
  {
    id: 'lantern-plaza',
    x: LANTERN_PLAZA_CONFIG.x,
    z: LANTERN_PLAZA_CONFIG.z,
    radius: LANTERN_PLAZA_CONFIG.interactRadius,
    label: 'ปล่อยโคมลอยอธิษฐาน 🏮',
    dialogId: 'dialog-release-lantern'
  },
  {
    id: 'sala-buddha',
    x: 30.8,
    z: 13,
    radius: 6.0,
    label: 'กราบไหว้พระรับคำอวยพร',
    dialogId: 'dialog-buddha'
  }
];

const CONCERT_POS = new THREE.Vector3(-21, 2, -52.5);
const WORLD_BOUNDS = { minX: -41.2, maxX: 56.2, minZ: -57.8, maxZ: 59.9 };

// ============================================================================
// 2. DOM REFERENCES & APPLICATION STATE
// ============================================================================

const dom = {
  worldCanvas: document.getElementById('world-canvas'),
  labelsLayer: document.getElementById('labels-layer'),
  loadingScreen: document.getElementById('loading-screen'),
  loadingBarFill: document.getElementById('loading-bar-fill'),
  loadingProgressbar: document.getElementById('loading-progressbar'),
  loadingStatus: document.getElementById('loading-status'),
  loadingPercent: document.getElementById('loading-percent'),

  lobbyOverlay: document.getElementById('lobby-overlay'),
  lobbyForm: document.getElementById('lobby-form'),
  previewCanvas: document.getElementById('preview-canvas'),
  btnPreviewWave: document.getElementById('btn-preview-wave'),
  previewSelectedName: document.getElementById('preview-selected-name'),
  avatarGrid: document.getElementById('avatar-grid'),
  inputNickname: document.getElementById('input-nickname'),
  selectRoom: document.getElementById('select-room'),
  optMic: document.getElementById('opt-mic'),
  optLowGfx: document.getElementById('opt-low-gfx'),

  hud: document.getElementById('hud'),
  hudNickname: document.getElementById('hud-nickname'),
  hudRoomName: document.getElementById('hud-room-name'),
  hudOnlineCount: document.getElementById('hud-online-count'),
  hudHeldKrathong: document.getElementById('hud-held-krathong'),
  btnMusicToggle: document.getElementById('btn-music-toggle'),
  btnGfxToggle: document.getElementById('btn-gfx-toggle'),
  btnMicSetup: document.getElementById('btn-mic-setup'),
  micStateText: document.getElementById('mic-state-text'),

  minimapToggle: document.getElementById('minimap-toggle'),
  minimapZoomHint: document.getElementById('minimap-zoom-hint'),
  minimapCanvas: document.getElementById('minimap-canvas'),

  toastBanner: document.getElementById('toast-banner'),
  interactWrap: document.getElementById('interact-prompt-wrap'),
  btnInteract: document.getElementById('btn-interact'),
  interactLabel: document.getElementById('interact-label'),

  joystickZone: document.getElementById('joystick-zone'),
  joystickKnob: document.getElementById('joystick-knob'),
  btnSprint: document.getElementById('btn-sprint'),
  btnWave: document.getElementById('btn-wave'),
  btnPtt: document.getElementById('btn-ptt'),

  chatPanel: document.getElementById('chat-panel'),
  btnChatToggle: document.getElementById('btn-chat-toggle'),
  chatBody: document.getElementById('chat-body'),
  chatMessages: document.getElementById('chat-messages'),
  chatForm: document.getElementById('chat-form'),
  chatInput: document.getElementById('chat-input'),

  dialogKrathongShop: document.getElementById('dialog-krathong-shop'),
  dialogFloatKrathong: document.getElementById('dialog-float-krathong'),
  floatHeldInfo: document.getElementById('float-held-info'),
  floatQuickPick: document.getElementById('float-quick-pick'),
  floatKrathongForm: document.getElementById('float-krathong-form'),
  inputWish: document.getElementById('input-wish'),

  dialogReleaseLantern: document.getElementById('dialog-release-lantern'),
  releaseLanternForm: document.getElementById('release-lantern-form'),
  inputLanternWish: document.getElementById('input-lantern-wish'),

  dialogBuddha: document.getElementById('dialog-buddha'),
  buddhaBlessingText: document.getElementById('buddha-blessing-text'),
  btnPrayAgain: document.getElementById('btn-pray-again')
};

const state = {
  joined: false,
  lowGraphics: window.matchMedia('(pointer: coarse)').matches,
  selfId: null,
  roomId: 'room-1',
  roomName: 'ลานงาน 1',
  roomMax: 35,
  selectedRoomId: 'auto',
  nickname: 'ผู้ร่วมงาน',
  avatarConfig: {
    avatarId: 'Avatar_BoyCargo'
  },
  heldKrathong: null,
  activeZone: null,
  isSpeaking: false,
  musicEnabled: true,
  minimapExpanded: false,
  sprintTouch: false,
  keys: new Set(),
  joystick: { active: false, dx: 0, dy: 0 },
  cameraOrbit: { yaw: 0, pitch: 0.38, distance: 8.5 },
  players: new Map(), // id -> { id, nickname, avatar, group, parts, targetPos, currentPos, targetRotY, currentRotY, isMoving, isRunning, heldKrathong, heldMesh, isSpeaking, chatBubble, chatExpire, labelEl }
  krathongs: new Map(), // id -> { data, mesh, labelEl }
  releasedLanterns: new Map(), // id -> { data, mesh, labelEl }
  modelReport: []
};

// ============================================================================
// 3. THREE.JS WORLD RENDERER, SCENE, LIGHTING & SKY
// ============================================================================

const renderer = new THREE.WebGLRenderer({
  canvas: dom.worldCanvas,
  antialias: !state.lowGraphics,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.autoUpdate = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x060a18);
scene.fog = new THREE.FogExp2(0x060a18, 0.0065);

const camera = new THREE.PerspectiveCamera(
  58,
  window.innerWidth / window.innerHeight,
  0.2,
  260
);
camera.position.set(0, 5, 67);

let gardenState = null;
let lanternPlazaState = null;
let frontRoadState = null;
const lambertMatCache = new WeakMap();

function toFastLambertMaterial(stdMat) {
  if (!stdMat || !stdMat.isMeshStandardMaterial) return stdMat;
  if (lambertMatCache.has(stdMat)) return lambertMatCache.get(stdMat);

  const lambert = new THREE.MeshLambertMaterial({
    color: stdMat.color ? stdMat.color.clone() : 0xffffff,
    map: stdMat.map || null,
    emissive: stdMat.emissive ? stdMat.emissive.clone() : 0x000000,
    emissiveMap: stdMat.emissiveMap || null,
    emissiveIntensity: stdMat.emissiveIntensity ?? 1,
    transparent: stdMat.transparent,
    opacity: stdMat.opacity,
    alphaTest: stdMat.alphaTest,
    side: stdMat.side,
    vertexColors: stdMat.vertexColors
  });
  lambertMatCache.set(stdMat, lambert);
  return lambert;
}

function applyMobileMaterialMode(rootObj, useFastLambert) {
  if (!rootObj) return;
  rootObj.traverse((obj) => {
    if (!obj.isMesh || !obj.material || Array.isArray(obj.material)) return;
    if (useFastLambert) {
      if (obj.material.isMeshStandardMaterial) {
        if (!obj.userData._stdMat) obj.userData._stdMat = obj.material;
        obj.material = toFastLambertMaterial(obj.userData._stdMat);
      }
    } else if (obj.userData._stdMat) {
      obj.material = obj.userData._stdMat;
    }
  });
}

const perfLodRefs = {
  detailedWalls: null,
  liteWalls: null,
  parkedMotoGroup: null,
  parkedMotoInsts: [],
  concertAnimNodes: [],
  concertPos: new THREE.Vector3(-21, 0, -52.5),
  krathongTablesRoot: null,
  krathongPos: new THREE.Vector3(20, 0, -25.8),
  cullableBuildings: [] // { root, pos, maxDist }
};

function applyPerfLodMode(low) {
  if (perfLodRefs.detailedWalls) {
    perfLodRefs.detailedWalls.visible = !low;
  }
  if (perfLodRefs.liteWalls) {
    perfLodRefs.liteWalls.visible = Boolean(low);
  }
  for (const item of perfLodRefs.parkedMotoInsts) {
    // In mobile lowGraphics mode show only first 2 motorcycle models (~60% fewer draw calls & tris)
    if (low) {
      item.mesh.visible = item.modelIdx < 2;
      item.mesh.count = Math.max(1, Math.ceil(item.fullCount * 0.5));
    } else {
      item.mesh.visible = true;
      item.mesh.count = item.fullCount;
    }
    item.mesh.instanceMatrix.needsUpdate = true;
  }
  applyMobileMaterialMode(scene, Boolean(low));

  // Restore full visibility immediately when leaving lowGraphics mode
  if (!low) {
    for (const n of perfLodRefs.concertAnimNodes) n.visible = true;
    if (perfLodRefs.krathongTablesRoot) perfLodRefs.krathongTablesRoot.visible = true;
    if (perfLodRefs.parkedMotoGroup) perfLodRefs.parkedMotoGroup.visible = true;
    if (frontRoadState) frontRoadState.root.visible = true;
    for (const b of perfLodRefs.cullableBuildings) b.root.visible = true;
  }
}

function updateMobileZoneCulling() {
  if (!state.lowGraphics) return;
  const camZ = camera.position.z;

  // Hide 530-draw-call concert dancers when >46m away (stage & screen remain visible!)
  const showDancers = camera.position.distanceTo(perfLodRefs.concertPos) <= 46;
  for (let i = 0; i < perfLodRefs.concertAnimNodes.length; i++) {
    perfLodRefs.concertAnimNodes[i].visible = showDancers;
  }

  if (perfLodRefs.krathongTablesRoot) {
    perfLodRefs.krathongTablesRoot.visible =
      camera.position.distanceTo(perfLodRefs.krathongPos) <= 48;
  }
  if (perfLodRefs.parkedMotoGroup) {
    perfLodRefs.parkedMotoGroup.visible = camZ > 15;
  }
  if (frontRoadState) {
    frontRoadState.root.visible = camZ > 20;
  }
  for (let i = 0; i < perfLodRefs.cullableBuildings.length; i++) {
    const b = perfLodRefs.cullableBuildings[i];
    b.root.visible = camera.position.distanceTo(b.pos) <= b.maxDist;
  }
}

const skyRefs = {
  stars: null,
  lanterns: null,
  lanternMeta: [],
  pondMesh: null,
  pondWaterMat: null,
  staticSigns: []
};

// Lighting (kept compact at 3 key PointLights + Hemi + Moon; in lowGraphics only Hemi + Moon + Sala)
const hemiLight = new THREE.HemisphereLight(0x8aa2f0, 0x243828, 1.48);
scene.add(hemiLight);

const moonLight = new THREE.DirectionalLight(0xdbeafe, 1.45);
moonLight.position.set(25, 55, -60);
moonLight.castShadow = true;
moonLight.shadow.mapSize.set(1024, 1024);
moonLight.shadow.camera.near = 10;
moonLight.shadow.camera.far = 160;
moonLight.shadow.camera.left = -55;
moonLight.shadow.camera.right = 60;
moonLight.shadow.camera.top = 65;
moonLight.shadow.camera.bottom = -65;
scene.add(moonLight);

const entranceLight = new THREE.PointLight(0xffbe55, 34, 38, 1.3);
entranceLight.position.set(0, 6.2, 54);
scene.add(entranceLight);

const stageLight = new THREE.PointLight(0xec4899, 34, 38, 1.3);
stageLight.position.set(-21, 7, -47);
scene.add(stageLight);

// Warm golden interior lighting for Sala Buddha (illuminates Buddha statue & tiled floor)
const salaMainLight = new THREE.PointLight(0xffd27d, 52, 26, 1.2);
salaMainLight.position.set(31.2, 4.6, 13);
scene.add(salaMainLight);

function applyGraphicsMode(low) {
  state.lowGraphics = Boolean(low);
  document.body.classList.toggle('low-gfx', state.lowGraphics);

  // Mobile turbo mode: lower fill-rate + NoToneMapping + shorter far frustum + fast Lambert shaders + no blur passes
  renderer.setPixelRatio(
    state.lowGraphics ? 0.72 : Math.min(window.devicePixelRatio || 1, 1.5)
  );
  renderer.toneMapping = state.lowGraphics ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = !state.lowGraphics;
  if (!state.lowGraphics) {
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.needsUpdate = true;
  }

  camera.far = state.lowGraphics ? 76 : 165;
  camera.updateProjectionMatrix();
  if (scene.fog) {
    scene.fog.density = state.lowGraphics ? 0.011 : 0.0062;
  }

  entranceLight.visible = !state.lowGraphics;
  stageLight.visible = !state.lowGraphics;
  hemiLight.intensity = state.lowGraphics ? 1.75 : 1.48;

  if (skyRefs.stars) {
    skyRefs.stars.visible = true;
  }
  if (skyRefs.lanterns) {
    skyRefs.lanterns.count = state.lowGraphics ? 20 : 56;
    skyRefs.lanterns.instanceMatrix.needsUpdate = true;
  }
  if (gardenState) {
    setGardenGraphicsMode(gardenState, state.lowGraphics);
  }
  if (lanternPlazaState) {
    setLanternPlazaGraphicsMode(lanternPlazaState, state.lowGraphics);
  }
  if (frontRoadState) {
    setFrontRoadGraphicsMode(frontRoadState, state.lowGraphics);
  }
  applyPerfLodMode(state.lowGraphics);
  if (dom.btnGfxToggle) {
    dom.btnGfxToggle.setAttribute('aria-pressed', String(state.lowGraphics));
    const lbl = dom.btnGfxToggle.querySelector('.btn-label');
    if (lbl) lbl.textContent = state.lowGraphics ? 'กราฟิก: ประหยัด' : 'กราฟิก: ปกติ';
  }
}

// ============================================================================
// 4. COLLISION SYSTEM (AABBs & Rotated Boxes)
// ============================================================================

const staticAABBs = []; // { minX, maxX, minZ, maxZ, tag }
const rotatedBoxes = []; // { cx, cz, halfW, halfD, cos, sin, tag }

function addCollisionBox(minX, maxX, minZ, maxZ, tag = '') {
  staticAABBs.push({
    minX: Math.min(minX, maxX),
    maxX: Math.max(minX, maxX),
    minZ: Math.min(minZ, maxZ),
    maxZ: Math.max(minZ, maxZ),
    tag
  });
}

function addRotatedCollisionBox(cx, cz, width, depth, rotY, tag = '') {
  rotatedBoxes.push({
    cx,
    cz,
    halfW: width * 0.5,
    halfD: depth * 0.5,
    cos: Math.cos(-rotY),
    sin: Math.sin(-rotY),
    invCos: Math.cos(rotY),
    invSin: Math.sin(rotY),
    tag
  });
}

function resolvePlayerCollisions(pos, radius = 0.48) {
  pos.x = Math.max(WORLD_BOUNDS.minX, Math.min(WORLD_BOUNDS.maxX, pos.x));
  pos.z = Math.max(WORLD_BOUNDS.minZ, Math.min(WORLD_BOUNDS.maxZ, pos.z));

  for (let pass = 0; pass < 2; pass++) {
    for (const box of staticAABBs) {
      const closestX = Math.max(box.minX, Math.min(pos.x, box.maxX));
      const closestZ = Math.max(box.minZ, Math.min(pos.z, box.maxZ));
      const dx = pos.x - closestX;
      const dz = pos.z - closestZ;
      const distSq = dx * dx + dz * dz;

      if (distSq < radius * radius) {
        if (distSq > 1e-6) {
          const dist = Math.sqrt(distSq);
          const push = radius - dist;
          pos.x += (dx / dist) * push;
          pos.z += (dz / dist) * push;
        } else {
          // Center inside AABB: push out toward nearest face
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

    for (const obb of rotatedBoxes) {
      const relX = pos.x - obb.cx;
      const relZ = pos.z - obb.cz;
      const localX = relX * obb.cos - relZ * obb.sin;
      const localZ = relX * obb.sin + relZ * obb.cos;

      const clampedX = Math.max(-obb.halfW, Math.min(localX, obb.halfW));
      const clampedZ = Math.max(-obb.halfD, Math.min(localZ, obb.halfD));
      const dx = localX - clampedX;
      const dz = localZ - clampedZ;
      const distSq = dx * dx + dz * dz;

      if (distSq < radius * radius && distSq > 1e-6) {
        const dist = Math.sqrt(distSq);
        const push = radius - dist;
        const pushLX = (dx / dist) * push;
        const pushLZ = (dz / dist) * push;
        pos.x += pushLX * obb.invCos - pushLZ * obb.invSin;
        pos.z += pushLX * obb.invSin + pushLZ * obb.invCos;
      }
    }
  }
}

// Register building & pond collisions (keeping gate archway & tunnels walkable)
function setupWorldCollisions() {
  // Gate pillars & guardian elephant pedestals (0, 54) - center walkway X: -3.1..+3.1 is open!
  addCollisionBox(-4.5, -3.1, 52.3, 55.8, 'gate-left');
  addCollisionBox(3.1, 4.5, 52.3, 55.8, 'gate-right');
  addCollisionBox(-6.8, -4.5, 52.8, 55.5, 'gate-elephant-left');
  addCollisionBox(4.5, 6.8, 52.8, 55.5, 'gate-elephant-right');

  // Krathong tables (20, -25.8)
  addCollisionBox(17.2, 22.8, -26.8, -24.8, 'krathong-tables');

  // Concert stage moved to north-left (-21, -52.5), rotY = 0
  addCollisionBox(-32.2, -9.8, -56.3, -48.7, 'concert-stage');

  // Ubosot (15, -43.5) ~ 16.76m x 25.96m (leave slight margin around walls)
  addCollisionBox(7.2, 22.8, -55.8, -31.2, 'ubosot');

  // Sala Buddha (31, 13), rotY = -Math.PI/2 -> open tiled interior up to the altar!
  addCollisionBox(32.5, 38.4, 10.6, 15.4, 'sala-buddha-altar');
  addCollisionBox(37.7, 38.6, 7.8, 18.2, 'sala-buddha-back');
  addCollisionBox(23.6, 38.5, 7.4, 8.2, 'sala-buddha-side-north');
  addCollisionBox(23.6, 38.5, 17.8, 18.6, 'sala-buddha-side-south');

  // Pond water boundary (X: 37..55, Z: -27..+3) - pier extends to X=37.2 cleanly
  addCollisionBox(37.2, 57, -27.5, 3.5, 'pond-water');

  // Temple perimeter walls (starting outside elephant pedestals at X = ±6.8)
  addCollisionBox(-42.5, -6.7, 53.55, 54.45, 'wall-front-left');
  addCollisionBox(6.7, 57.5, 53.55, 54.45, 'wall-front-right');
  addCollisionBox(-42.45, -41.55, -58.9, 54.4, 'wall-left');
  addCollisionBox(56.55, 57.45, -58.9, 54.4, 'wall-right');
  addCollisionBox(-42.4, 57.4, -58.95, -58.05, 'wall-back');
}

// ============================================================================
// 5. PROCEDURAL TEXTURES, KRATHONGS, SKY & TEMPLE FAIR ENVIRONMENT
// ============================================================================

function makeSignTexture(text, bg = '#1e1b4b', border = '#f6c453', fg = '#fef08a') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 160);

  ctx.strokeStyle = border;
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 496, 144);

  ctx.fillStyle = fg;
  ctx.font = 'bold 48px "Noto Sans Thai", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 82);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createSignBoard(text, width = 3.2, height = 1.0, bg = '#1e1b4b', fg = '#fef08a') {
  const tex = makeSignTexture(text, bg, '#f6c453', fg);
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    emissive: new THREE.Color(0xf59e0b),
    emissiveMap: tex,
    emissiveIntensity: 0.45,
    roughness: 0.4
  });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.14), mat);
  return mesh;
}

function createKrathongMesh(type = 'lotus', scale = 1) {
  const group = new THREE.Group();

  const baseColor = type === 'bread' ? 0xd99b52 : 0x2e7d32;
  const baseMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.7 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.12, 14), baseMat);
  base.position.y = 0.06;
  group.add(base);

  const petalColor =
    type === 'lotus' ? 0xf472b6 : type === 'bread' ? 0xfbbf24 : 0x65a30d;
  const petalMat = new THREE.MeshStandardMaterial({ color: petalColor, roughness: 0.55 });
  const petalGeo = new THREE.ConeGeometry(0.065, 0.16, 5);
  const count = 10;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const petal = new THREE.Mesh(petalGeo, petalMat);
    petal.position.set(Math.cos(a) * 0.21, 0.13, Math.sin(a) * 0.21);
    petal.rotation.z = -Math.cos(a) * 0.45;
    petal.rotation.x = Math.sin(a) * 0.45;
    group.add(petal);
  }

  // Marigold center ring
  const flower = new THREE.Mesh(
    new THREE.TorusGeometry(0.11, 0.035, 6, 12),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 })
  );
  flower.rotation.x = Math.PI / 2;
  flower.position.y = 0.13;
  group.add(flower);

  // Candle + flame
  const candle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.18, 8),
    new THREE.MeshStandardMaterial({ color: 0xfef08a })
  );
  candle.position.y = 0.2;
  group.add(candle);

  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.032, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffb703 })
  );
  flame.scale.set(0.8, 1.5, 0.8);
  flame.position.y = 0.31;
  group.add(flame);

  // Incense sticks
  const incenseMat = new THREE.MeshBasicMaterial({ color: 0x991b1b });
  for (let i = -1; i <= 1; i++) {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.22, 5), incenseMat);
    stick.position.set(i * 0.025, 0.21, -0.04);
    stick.rotation.z = i * 0.1;
    group.add(stick);
  }

  group.scale.setScalar(scale);
  return group;
}

function buildSkyAtmosphere() {
  // Full Moon
  const moonGroup = new THREE.Group();
  const moonMesh = new THREE.Mesh(
    new THREE.SphereGeometry(6.5, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xfff7d6, fog: false })
  );
  moonGroup.add(moonMesh);

  const haloCanvas = document.createElement('canvas');
  haloCanvas.width = 128;
  haloCanvas.height = 128;
  const hctx = haloCanvas.getContext('2d');
  const grad = hctx.createRadialGradient(64, 64, 14, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255, 243, 196, 0.65)');
  grad.addColorStop(0.5, 'rgba(253, 224, 71, 0.18)');
  grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
  hctx.fillStyle = grad;
  hctx.fillRect(0, 0, 128, 128);

  const haloTex = new THREE.CanvasTexture(haloCanvas);
  const haloSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: haloTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false
    })
  );
  haloSprite.scale.set(34, 34, 1);
  moonGroup.add(haloSprite);
  moonGroup.position.set(28, 58, -98);
  scene.add(moonGroup);

  // Starfield
  const starCount = 950;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.42;
    const r = 135 + Math.random() * 25;
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.cos(phi) + 8;
    starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xf8fafc,
    size: 0.75,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    fog: false
  });
  skyRefs.stars = new THREE.Points(starGeo, starMat);
  scene.add(skyRefs.stars);

  // Sky Lanterns (InstancedMesh)
  const lanternCount = 64;
  const lanternGeo = new THREE.CylinderGeometry(0.45, 0.3, 0.95, 8, 1, false);
  const lanternMat = new THREE.MeshBasicMaterial({
    color: 0xff9e2c,
    transparent: true,
    opacity: 0.92,
    fog: false
  });
  const lanterns = new THREE.InstancedMesh(lanternGeo, lanternMat, lanternCount);
  lanterns.frustumCulled = false;

  for (let i = 0; i < lanternCount; i++) {
    skyRefs.lanternMeta.push({
      x: (Math.random() - 0.5) * 110 + 8,
      y: 12 + Math.random() * 52,
      z: (Math.random() - 0.5) * 120 - 5,
      speed: 0.55 + Math.random() * 0.75,
      swayPhase: Math.random() * Math.PI * 2,
      scale: 0.75 + Math.random() * 0.65
    });
  }
  skyRefs.lanterns = lanterns;
  scene.add(lanterns);
}

function buildGroundAndRoads() {
  // Base grass lawn
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x1d4026,
    roughness: 0.95
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(250, 210), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(8, 0, 12);
  ground.receiveShadow = true;
  scene.add(ground);

  // Outer perimeter decorative low wall / fence marker
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
  const pathMat = new THREE.MeshStandardMaterial({ color: 0x8d7b68, roughness: 0.9 });

  // Main road: width 6.2m at X=0, Z: -58 to +60.5 (meets the 4-lane highway at Z=60.5)
  const mainRoad = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 118.5), roadMat);
  mainRoad.rotation.x = -Math.PI / 2;
  mainRoad.position.set(0, 0.015, 1.25);
  mainRoad.receiveShadow = true;
  scene.add(mainRoad);

  // Dashed yellow center line (InstancedMesh)
  const dashGeo = new THREE.PlaneGeometry(0.18, 2.2);
  const dashMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const dashCount = 26;
  const dashes = new THREE.InstancedMesh(dashGeo, dashMat, dashCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < dashCount; i++) {
    dummy.position.set(0, 0.025, -55 + i * 4.5);
    dummy.rotation.set(-Math.PI / 2, 0, 0);
    dummy.updateMatrix();
    dashes.setMatrixAt(i, dummy.matrix);
  }
  dashes.instanceMatrix.needsUpdate = true;
  scene.add(dashes);

  // Cross road top-left at Z = -37.5 (X: -38 to -3.1)
  const crossRoad = new THREE.Mesh(new THREE.PlaneGeometry(34.9, 5.2), pathMat);
  crossRoad.rotation.x = -Math.PI / 2;
  crossRoad.position.set(-20.55, 0.016, -37.5);
  crossRoad.receiveShadow = true;
  scene.add(crossRoad);

  // Walkway under right-turn tunnel & open path from krathong_tables (20,-25.8) to pier (35.4,-12)
  const tunnelWalk1 = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 26), pathMat);
  tunnelWalk1.rotation.x = -Math.PI / 2;
  tunnelWalk1.position.set(8, 0.014, -7);
  scene.add(tunnelWalk1);

  const tunnelWalk2 = new THREE.Mesh(new THREE.PlaneGeometry(19.3, 3.4), pathMat);
  tunnelWalk2.rotation.x = -Math.PI / 2;
  tunnelWalk2.position.set(16.15, 0.014, -20.6);
  scene.add(tunnelWalk2);

  // Open diagonal walkway connecting trimmed end of tunnel_18m (25,-20.6) & krathong tables (20,-25.8) to pier (35.4,-12)
  const pierLink = new THREE.Mesh(new THREE.PlaneGeometry(13.5, 5.2), pathMat);
  pierLink.rotation.x = -Math.PI / 2;
  pierLink.rotation.z = -0.68;
  pierLink.position.set(30.5, 0.014, -16.8);
  scene.add(pierLink);

  // Plaza around Krathong tables & Command tent
  const plazaTopRight = new THREE.Mesh(new THREE.PlaneGeometry(18, 9), pathMat);
  plazaTopRight.rotation.x = -Math.PI / 2;
  plazaTopRight.position.set(15.5, 0.012, -25.2);
  scene.add(plazaTopRight);

  // Walkway to Sala Buddha & Contest
  const eastBranch = new THREE.Mesh(new THREE.PlaneGeometry(24, 3.6), pathMat);
  eastBranch.rotation.x = -Math.PI / 2;
  eastBranch.position.set(15, 0.013, 12.2);
  scene.add(eastBranch);
}

function buildCornerArchAndStringLights() {
  // Corner light arch at (8, 0, -20.6) joining tunnel_24m (north end Z=-19) and tunnel_18m (west end X=10)
  const cornerGroup = new THREE.Group();
  cornerGroup.position.set(8, 0, -20.6);

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.7,
    roughness: 0.35
  });
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  const corners = [
    [-1.5, -1.5],
    [1.5, -1.5],
    [-1.5, 1.5],
    [1.5, 1.5]
  ];
  for (const [cx, cz] of corners) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.4, 8), frameMat);
    post.position.set(cx, 1.7, cz);
    cornerGroup.add(post);
  }
  const topRing = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.09, 8, 24), frameMat);
  topRing.rotation.x = Math.PI / 2;
  topRing.position.y = 3.4;
  cornerGroup.add(topRing);

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), bulbMat);
    bulb.position.set(Math.cos(a) * 2.05, 3.4, Math.sin(a) * 2.05);
    cornerGroup.add(bulb);
  }
  scene.add(cornerGroup);

  // Temple fair string lights along main road X = -3.8 and X = +3.8 (Z: -56 to +52)
  const poleCount = 38; // 19 per side
  const poleGeo = new THREE.CylinderGeometry(0.05, 0.07, 4.2, 6);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
  const poles = new THREE.InstancedMesh(poleGeo, poleMat, poleCount);

  const bulbGeo = new THREE.SphereGeometry(0.11, 8, 8);
  const bulbMeshMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const totalBulbs = 180;
  const bulbs = new THREE.InstancedMesh(bulbGeo, bulbMeshMat, totalBulbs);

  const dummy = new THREE.Object3D();
  let pIdx = 0;
  for (let i = 0; i < 19; i++) {
    const z = -56 + i * 6;
    for (const side of [-3.8, 3.8]) {
      dummy.position.set(side, 2.1, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      poles.setMatrixAt(pIdx++, dummy.matrix);
    }
  }
  poles.instanceMatrix.needsUpdate = true;
  scene.add(poles);

  const palette = [
    new THREE.Color(0xfacc15),
    new THREE.Color(0xf43f5e),
    new THREE.Color(0x2dd4bf),
    new THREE.Color(0xfb923c),
    new THREE.Color(0xa855f7)
  ];

  let bIdx = 0;
  for (let i = 0; i < 90; i++) {
    const z = -56 + (i / 89) * 108;
    const sag = Math.sin(((z + 56) % 6) / 6 * Math.PI) * 0.35;
    for (const side of [-3.8, 3.8]) {
      if (bIdx >= totalBulbs) break;
      dummy.position.set(side, 4.1 - sag, z);
      dummy.updateMatrix();
      bulbs.setMatrixAt(bIdx, dummy.matrix);
      bulbs.setColorAt(bIdx, palette[bIdx % palette.length]);
      bIdx++;
    }
  }
  bulbs.instanceMatrix.needsUpdate = true;
  if (bulbs.instanceColor) bulbs.instanceColor.needsUpdate = true;
  scene.add(bulbs);
}

function buildNorthTreePlaza() {
  // Top-left tree plaza (north of cross road Z: -41 to -56, X: -36 to -6)
  const treePositions = [];
  for (let x = -34; x <= -8; x += 5.2) {
    for (let z = -55; z <= -42; z += 4.3) {
      treePositions.push({
        x: x + (Math.random() - 0.5) * 1.4,
        z: z + (Math.random() - 0.5) * 1.1,
        s: 0.85 + Math.random() * 0.5
      });
    }
  }

  const count = treePositions.length;
  const trunkMesh = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.18, 0.28, 2.6, 7),
    new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 }),
    count
  );
  const crownMesh = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(1.75, 1),
    new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 }),
    count
  );
  const uplightMesh = new THREE.InstancedMesh(
    new THREE.CircleGeometry(1.1, 12),
    new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.32
    }),
    count
  );

  const dummy = new THREE.Object3D();
  treePositions.forEach((t, i) => {
    dummy.position.set(t.x, 1.3 * t.s, t.z);
    dummy.rotation.set(0, Math.random() * Math.PI, 0);
    dummy.scale.setScalar(t.s);
    dummy.updateMatrix();
    trunkMesh.setMatrixAt(i, dummy.matrix);

    dummy.position.set(t.x, 3.2 * t.s, t.z);
    dummy.scale.set(t.s, t.s * 1.15, t.s);
    dummy.updateMatrix();
    crownMesh.setMatrixAt(i, dummy.matrix);

    dummy.position.set(t.x, 0.03, t.z);
    dummy.rotation.set(-Math.PI / 2, 0, 0);
    dummy.scale.setScalar(t.s);
    dummy.updateMatrix();
    uplightMesh.setMatrixAt(i, dummy.matrix);
  });

  trunkMesh.instanceMatrix.needsUpdate = true;
  crownMesh.instanceMatrix.needsUpdate = true;
  uplightMesh.instanceMatrix.needsUpdate = true;
  scene.add(trunkMesh, crownMesh, uplightMesh);

  const label = createSignBoard('ลานต้นไม้', 3.4, 0.9, '#14532d', '#fde047');
  label.position.set(-20, 2.2, -41.5);
  scene.add(label);
}

const motorcycleParkingSlots = [];
const MOTORCYCLE_NODE_NAMES = [
  'Moto01_GrandFilano_Blue',
  'Moto02_Wave125i_BlueRed',
  'Moto03_SuperCub_Orange',
  'Moto04_Fazzio_Khaki',
  'Moto05_Scoopy_Club12_Red'
];

function buildMotorcycleParking() {
  const lots = [
    { cx: -16, cz: 46, w: 12, d: 9, label: 'ที่จอดรถมอเตอร์ไซค์ (ซ้าย)' },
    { cx: 11.5, cz: 48, w: 9, d: 9, label: 'ที่จอดรถมอเตอร์ไซค์ (ขวา)' }
  ];

  motorcycleParkingSlots.length = 0;
  let slotIndex = 0;

  for (let lotIdx = 0; lotIdx < lots.length; lotIdx++) {
    const lot = lots[lotIdx];
    const pad = new THREE.Mesh(
      new THREE.PlaneGeometry(lot.w, lot.d),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(lot.cx, 0.015, lot.cz);
    pad.receiveShadow = true;
    scene.add(pad);

    const sign = createSignBoard('ที่จอดรถมอเตอร์ไซค์', 3.6, 0.9, '#1e3a8a', '#facc15');
    sign.position.set(lot.cx, 2.3, lot.cz - lot.d * 0.5 + 0.4);
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 2.3, 6),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
    );
    post.position.set(lot.cx, 1.15, lot.cz - lot.d * 0.5 + 0.4);
    scene.add(sign, post);

    const cols = Math.floor((lot.w - 1.5) / 1.35);
    const firstX = lot.cx - (cols - 1) * 0.675;
    const lastX = firstX + (cols - 1) * 1.35;

    for (let r = 0; r < 2; r++) {
      const rowZ = lot.cz - 2.0 + r * 3.8;
      // Add row collision box while keeping the aisle between the two rows walkable
      addCollisionBox(
        firstX - 0.35,
        lastX + 0.35,
        rowZ - 0.82,
        rowZ + 0.82,
        `moto-lot-${lotIdx}-row-${r}`
      );

      for (let c = 0; c < cols; c++) {
        // Deterministic slight parking angle jitter so rows look natural
        const jitter = Math.sin(slotIndex * 1.9 + lotIdx * 3.1) * 0.07;
        motorcycleParkingSlots.push({
          x: firstX + c * 1.35,
          z: rowZ,
          rotY: (r === 0 ? 0 : Math.PI) + jitter,
          modelIdx: (slotIndex * 2 + r) % MOTORCYCLE_NODE_NAMES.length
        });
        slotIndex++;
      }
    }
  }
}

function buildFallbackMotorcycles(slots) {
  const count = slots.length;
  if (count === 0) return;
  const bodyMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.45, 0.55, 1.45),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }),
    count
  );
  const wheelMesh = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.14, 10),
    new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85 }),
    count * 2
  );
  const handleMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.65, 0.06, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.6, roughness: 0.3 }),
    count
  );

  const bikeColors = [
    new THREE.Color(0xef4444),
    new THREE.Color(0x3b82f6),
    new THREE.Color(0x10b981),
    new THREE.Color(0xf59e0b),
    new THREE.Color(0xe2e8f0)
  ];
  const dummy = new THREE.Object3D();

  slots.forEach((b, i) => {
    dummy.position.set(b.x, 0.55, b.z);
    dummy.rotation.set(0, b.rotY, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    bodyMesh.setMatrixAt(i, dummy.matrix);
    bodyMesh.setColorAt(i, bikeColors[i % bikeColors.length]);

    dummy.position.set(b.x, 0.92, b.z + Math.cos(b.rotY) * 0.45);
    dummy.rotation.set(0, b.rotY, 0);
    dummy.updateMatrix();
    handleMesh.setMatrixAt(i, dummy.matrix);

    for (let w = 0; w < 2; w++) {
      const wz = w === 0 ? 0.52 : -0.52;
      dummy.position.set(b.x, 0.28, b.z + Math.cos(b.rotY) * wz);
      dummy.rotation.set(0, b.rotY, Math.PI / 2);
      dummy.updateMatrix();
      wheelMesh.setMatrixAt(i * 2 + w, dummy.matrix);
    }
  });

  bodyMesh.instanceMatrix.needsUpdate = true;
  if (bodyMesh.instanceColor) bodyMesh.instanceColor.needsUpdate = true;
  wheelMesh.instanceMatrix.needsUpdate = true;
  handleMesh.instanceMatrix.needsUpdate = true;
  scene.add(bodyMesh, wheelMesh, handleMesh);
}

function populateParkedMotorcycles(motoScene) {
  const templates = [];
  for (const name of MOTORCYCLE_NODE_NAMES) {
    const node = motoScene.getObjectByName(name);
    if (node) templates.push(node);
  }
  if (templates.length === 0) {
    const root = motoScene.getObjectByName('All_5_Motorcycles_Parked') || motoScene;
    for (const child of root.children) {
      templates.push(child);
    }
  }
  if (templates.length === 0) {
    buildFallbackMotorcycles(motorcycleParkingSlots);
    return;
  }

  // Group parking slots by motorcycle model index
  const slotsByModel = templates.map(() => []);
  for (const slot of motorcycleParkingSlots) {
    slotsByModel[slot.modelIdx % templates.length].push(slot);
  }

  const motoGroup = new THREE.Group();
  motoGroup.name = 'ParkedMotorcyclesGroup';
  const dummy = new THREE.Object3D();
  const invRootMat = new THREE.Matrix4();
  const relMat = new THREE.Matrix4();
  const centerMat = new THREE.Matrix4();

  templates.forEach((srcNode, modelIdx) => {
    const placements = slotsByModel[modelIdx];
    if (!placements || placements.length === 0) return;

    const tpl = srcNode.clone(true);
    tpl.position.set(0, 0, 0);
    tpl.rotation.set(0, 0, 0);
    tpl.scale.set(1, 1, 1);
    tpl.updateMatrixWorld(true);

    // Ground tires cleanly onto the parking pad (Y = 0.015) and center X/Z
    const box = new THREE.Box3().setFromObject(tpl);
    const offsetX = Number.isFinite(box.min.x) ? -(box.min.x + box.max.x) * 0.5 : 0;
    const offsetY = Number.isFinite(box.min.y) ? -box.min.y + 0.015 : 0.015;
    const offsetZ = Number.isFinite(box.min.z) ? -(box.min.z + box.max.z) * 0.5 : 0;
    centerMat.makeTranslation(offsetX, offsetY, offsetZ);
    invRootMat.copy(tpl.matrixWorld).invert();

    // Batch geometries by shared material into one InstancedMesh per material
    const buckets = new Map();
    tpl.traverse((obj) => {
      if (!obj.isMesh || !obj.geometry) return;
      const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
      if (!mat) return;

      let geo = obj.geometry.index ? obj.geometry.toNonIndexed() : obj.geometry.clone();
      // Keep consistent attributes across merged parts
      for (const attrName of Object.keys(geo.attributes)) {
        if (attrName !== 'position' && attrName !== 'normal' && attrName !== 'uv') {
          geo.deleteAttribute(attrName);
        }
      }
      if (!geo.attributes.normal) {
        geo.computeVertexNormals();
      }
      if (!geo.attributes.uv) {
        const count = geo.attributes.position.count;
        geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2));
      }

      relMat.multiplyMatrices(invRootMat, obj.matrixWorld);
      relMat.premultiply(centerMat);
      geo.applyMatrix4(relMat);

      if (!buckets.has(mat)) buckets.set(mat, []);
      buckets.get(mat).push(geo);
    });

    for (const [mat, geos] of buckets) {
      const merged = mergeGeometries(geos, false);
      geos.forEach((g) => g.dispose());
      if (!merged) continue;

      const inst = new THREE.InstancedMesh(merged, mat, placements.length);
      inst.castShadow = !state.lowGraphics;
      inst.receiveShadow = true;

      placements.forEach((p, idx) => {
        dummy.position.set(p.x, 0, p.z);
        dummy.rotation.set(0, p.rotY, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        inst.setMatrixAt(idx, dummy.matrix);
      });
      inst.instanceMatrix.needsUpdate = true;
      perfLodRefs.parkedMotoInsts.push({ mesh: inst, fullCount: placements.length, modelIdx });
      motoGroup.add(inst);
    }
  });

  scene.add(motoGroup);
  perfLodRefs.parkedMotoGroup = motoGroup;
  applyPerfLodMode(state.lowGraphics);
}

function buildVendorStalls() {
  // Generate 60+ stalls across the 5 layout zones
  const stalls = [];

  // 1) ขวาถนนเมน X=5.5 (Z: +41 ถึง +16.3) -> 12 stalls (เว้นทางเดินเข้าศาลาพระพุทธรูป)
  for (let i = 0; i < 12; i++) {
    stalls.push({ x: 5.5, z: 40.5 - i * 2.2, rotY: -Math.PI / 2 });
  }

  // 2) ซ้ายถนนเมน X=-5.5 (Z: +32 ถึง +6) -> 12 stalls + bottom L-hook around open lawn -> 8 stalls
  for (let i = 0; i < 12; i++) {
    stalls.push({ x: -5.5, z: 31.2 - i * 2.25, rotY: Math.PI / 2 });
  }
  for (let i = 0; i < 5; i++) {
    stalls.push({ x: -8.5 - i * 2.3, z: 34.0, rotY: Math.PI });
  }
  for (let i = 0; i < 3; i++) {
    stalls.push({ x: -8.5 - i * 2.3, z: 38.8, rotY: 0 });
  }

  // 3) แนวนอนกลางฝั่งซ้าย Z=+5 (X: -8.5 ถึง -31) -> 11 stalls
  for (let i = 0; i < 11; i++) {
    stalls.push({ x: -8.5 - i * 2.25, z: 5.0, rotY: Math.PI });
  }

  // 4) ขอบซ้ายสุด X=-35 (Z: +2 ถึง -33) -> 16 stalls
  for (let i = 0; i < 16; i++) {
    stalls.push({ x: -35.0, z: 1.5 - i * 2.3, rotY: Math.PI / 2 });
  }

  // 5) กลุ่มตัว U หน้าลานเวทีคอนเสิร์ต (X=-5.5, Z=-4.5, X=-23.5) -> 17 stalls
  for (let i = 0; i < 6; i++) {
    stalls.push({ x: -5.5, z: -5.2 - i * 2.25, rotY: -Math.PI / 2 });
  }
  for (let i = 0; i < 6; i++) {
    stalls.push({ x: -8.2 - i * 2.55, z: -4.5, rotY: Math.PI });
  }
  for (let i = 0; i < 5; i++) {
    stalls.push({ x: -23.5, z: -6.8 - i * 2.25, rotY: Math.PI / 2 });
  }

  const count = stalls.length; // 77 stalls
  const roofGeo = new THREE.ConeGeometry(1.55, 0.95, 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.65 });
  const roofMesh = new THREE.InstancedMesh(roofGeo, roofMat, count);

  const tableGeo = new THREE.BoxGeometry(1.85, 0.78, 0.72);
  const tableMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
  const tableMesh = new THREE.InstancedMesh(tableGeo, tableMat, count);

  const postGeo = new THREE.CylinderGeometry(0.035, 0.035, 2.2, 6);
  const postMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.5 });
  const postMesh = new THREE.InstancedMesh(postGeo, postMat, count * 4);

  const bulbGeo = new THREE.SphereGeometry(0.09, 6, 6);
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const bulbMesh = new THREE.InstancedMesh(bulbGeo, bulbMat, count);

  const tentColors = [
    new THREE.Color(0xef4444),
    new THREE.Color(0xf59e0b),
    new THREE.Color(0xec4899),
    new THREE.Color(0x14b8a6),
    new THREE.Color(0x3b82f6),
    new THREE.Color(0x8b5cf6)
  ];

  const dummy = new THREE.Object3D();
  stalls.forEach((s, i) => {
    dummy.position.set(s.x, 2.65, s.z);
    dummy.rotation.set(0, s.rotY + Math.PI / 4, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    roofMesh.setMatrixAt(i, dummy.matrix);
    roofMesh.setColorAt(i, tentColors[i % tentColors.length]);

    const frontOffset = 0.52;
    dummy.position.set(
      s.x + Math.sin(s.rotY) * frontOffset,
      0.39,
      s.z + Math.cos(s.rotY) * frontOffset
    );
    dummy.rotation.set(0, s.rotY, 0);
    dummy.updateMatrix();
    tableMesh.setMatrixAt(i, dummy.matrix);

    dummy.position.set(
      s.x + Math.sin(s.rotY) * 0.95,
      2.12,
      s.z + Math.cos(s.rotY) * 0.95
    );
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    bulbMesh.setMatrixAt(i, dummy.matrix);

    const offsets = [
      [-0.95, -0.95],
      [0.95, -0.95],
      [-0.95, 0.95],
      [0.95, 0.95]
    ];
    offsets.forEach(([ox, oz], p) => {
      dummy.position.set(s.x + ox, 1.1, s.z + oz);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      postMesh.setMatrixAt(i * 4 + p, dummy.matrix);
    });

    addCollisionBox(s.x - 1.0, s.x + 1.0, s.z - 1.0, s.z + 1.0, `stall-${i}`);
  });

  roofMesh.instanceMatrix.needsUpdate = true;
  if (roofMesh.instanceColor) roofMesh.instanceColor.needsUpdate = true;
  tableMesh.instanceMatrix.needsUpdate = true;
  postMesh.instanceMatrix.needsUpdate = true;
  bulbMesh.instanceMatrix.needsUpdate = true;
  scene.add(roofMesh, tableMesh, postMesh, bulbMesh);
}

function buildSpecialZones() {
  // 1) กองอำนวยการ: เต็นท์สีม่วง-ขาวพร้อมป้ายไฟที่ (8.5, -26.2)
  const cmdGroup = new THREE.Group();
  cmdGroup.position.set(8.5, 0, -26.2);

  const whiteTent = new THREE.Mesh(
    new THREE.ConeGeometry(2.6, 1.35, 4),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 })
  );
  whiteTent.position.y = 3.1;
  whiteTent.rotation.y = Math.PI / 4;
  cmdGroup.add(whiteTent);

  const purpleSkirt = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.45, 3.6),
    new THREE.MeshStandardMaterial({ color: 0x7e22ce, roughness: 0.55 })
  );
  purpleSkirt.position.y = 2.35;
  cmdGroup.add(purpleSkirt);

  const postMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
  for (const [px, pz] of [[-1.65, -1.65], [1.65, -1.65], [-1.65, 1.65], [1.65, 1.65]]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8), postMat);
    p.position.set(px, 1.2, pz);
    cmdGroup.add(p);
  }
  const cmdDesk = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.85, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x6b21a8, roughness: 0.7 })
  );
  cmdDesk.position.set(0, 0.425, 1.0);
  cmdGroup.add(cmdDesk);

  const cmdSign = createSignBoard('กองอำนวยการ', 3.4, 0.9, '#581c87', '#fef08a');
  cmdSign.position.set(0, 2.75, 1.9);
  cmdGroup.add(cmdSign);

  scene.add(cmdGroup);
  addCollisionBox(6.7, 10.3, -28.0, -24.4, 'command-tent');

  // 2) โซนประกวดกระทง: แท่นวางกระทงประกวดขนาดใหญ่ 3 ใบพร้อมป้ายไฟที่ (15, 7)
  const contestGroup = new THREE.Group();
  contestGroup.position.set(15, 0, 7);

  const carpet = new THREE.Mesh(
    new THREE.BoxGeometry(9.6, 0.14, 3.4),
    new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.85 })
  );
  carpet.position.y = 0.07;
  contestGroup.add(carpet);

  const types = ['banana', 'lotus', 'bread'];
  for (let i = 0; i < 3; i++) {
    const px = (i - 1) * 3.0;
    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 1.0, 1.05, 12),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 })
    );
    ped.position.set(px, 0.55, 0);
    contestGroup.add(ped);

    const goldRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.88, 0.06, 8, 18),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6, roughness: 0.3 })
    );
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.set(px, 1.08, 0);
    contestGroup.add(goldRing);

    const giantKrathong = createKrathongMesh(types[i], 2.5);
    giantKrathong.position.set(px, 1.1, 0);
    contestGroup.add(giantKrathong);
  }

  const contestSign = createSignBoard('ประกวดกระทง', 4.2, 1.0, '#7c2d12', '#fde047');
  contestSign.position.set(0, 2.9, -1.6);
  contestGroup.add(contestSign);
  scene.add(contestGroup);
  addCollisionBox(10.2, 19.8, 5.2, 8.8, 'krathong-contest');

  // 3) สระน้ำและท่าน้ำจุดลอยกระทง: X: 37..55, Z: -27..+3 และท่าน้ำที่ (35.4, -12)
  const pondGeo = new THREE.PlaneGeometry(18, 30, 24, 36);
  const pondMat = new THREE.MeshStandardMaterial({
    color: 0x0b3b59,
    emissive: 0x062138,
    emissiveIntensity: 0.45,
    metalness: 0.78,
    roughness: 0.16
  });
  const pondMesh = new THREE.Mesh(pondGeo, pondMat);
  pondMesh.rotation.x = -Math.PI / 2;
  pondMesh.position.set(46, 0.04, -12);
  scene.add(pondMesh);
  skyRefs.pondMesh = pondMesh;
  skyRefs.pondWaterMat = pondMat;

  // Pond border stone curb (west edge X=37, north Z=-27, south Z=3, east X=55)
  const bankMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
  const northBank = new THREE.Mesh(new THREE.BoxGeometry(19, 0.35, 0.7), bankMat);
  northBank.position.set(46, 0.17, -27.2);
  const southBank = new THREE.Mesh(new THREE.BoxGeometry(19, 0.35, 0.7), bankMat);
  southBank.position.set(46, 0.17, 3.2);
  const eastBank = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 31), bankMat);
  eastBank.position.set(55.2, 0.17, -12);
  const westTopBank = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 12.2), bankMat);
  westTopBank.position.set(36.9, 0.15, -20.9);
  const westBotBank = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 12.2), bankMat);
  westBotBank.position.set(36.9, 0.15, -3.1);
  scene.add(northBank, southBank, eastBank, westTopBank, westBotBank);

  // Wooden Pier at (35.4, 0, -12)
  const pierGroup = new THREE.Group();
  pierGroup.position.set(35.4, 0, -12);

  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.24, 5.2),
    new THREE.MeshStandardMaterial({ color: 0x7c4a24, roughness: 0.85 })
  );
  deck.position.set(0.4, 0.16, 0);
  pierGroup.add(deck);

  const woodPostMat = new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.9 });
  const lanternBulbMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
  for (const [px, pz] of [[-1.3, -2.3], [-1.3, 2.3], [2.2, -2.3], [2.2, 2.3]]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8), woodPostMat);
    p.position.set(px, 1.3, pz);
    pierGroup.add(p);

    const lan = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), lanternBulbMat);
    lan.position.set(px, 2.65, pz);
    pierGroup.add(lan);
  }

  const pierSign = createSignBoard('จุดลอยกระทง 🪷', 3.8, 1.0, '#0f172a', '#fde047');
  pierSign.rotation.y = -Math.PI / 2;
  pierSign.position.set(-1.3, 2.9, 0);
  pierGroup.add(pierSign);

  scene.add(pierGroup);
}

// ============================================================================
// 6. GLTF MODEL LOADER WITH PROGRESS BAR & WIREFRAME FALLBACK
// ============================================================================

const mixers = [];

function createFallbackWireframe(spec) {
  const [w, h, d] = spec.fallbackSize || [4, 4, 4];
  const group = new THREE.Group();
  group.position.set(...spec.pos);
  group.rotation.y = spec.rotY;

  const boxGeo = new THREE.BoxGeometry(w, h, d);
  const edges = new THREE.EdgesGeometry(boxGeo);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0xf59e0b })
  );
  line.position.y = h / 2;
  group.add(line);

  const sign = createSignBoard(spec.label, Math.min(w, 6), 1.1, '#7f1d1d', '#fef08a');
  sign.position.y = h + 0.9;
  group.add(sign);

  scene.add(group);
  return group;
}

function mergeStaticMeshesByMaterial(root, animatedClips = [], castShadow = false, extraSkipObjects = []) {
  const animatedNames = new Set();
  for (const clip of animatedClips || []) {
    for (const track of clip.tracks || []) {
      const nodeName = track.name.split('.')[0];
      if (nodeName) animatedNames.add(nodeName);
    }
  }

  const skipNodes = new Set();
  const topAnimatedRoots = [];
  if (animatedNames.size > 0) {
    root.traverse((obj) => {
      if (obj.name && animatedNames.has(obj.name)) {
        if (!skipNodes.has(obj)) topAnimatedRoots.push(obj);
        obj.traverse((desc) => skipNodes.add(desc));
      }
    });
  }
  for (const extra of extraSkipObjects || []) {
    if (!extra) continue;
    extra.traverse((desc) => skipNodes.add(desc));
  }

  root.updateMatrixWorld(true);
  const invRoot = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const relMat = new THREE.Matrix4();

  const buckets = new Map();
  root.traverse((obj) => {
    if (!obj.isMesh || obj.isSkinnedMesh || obj.isInstancedMesh || !obj.geometry) return;
    if (skipNodes.has(obj)) return;
    if (Array.isArray(obj.material) || !obj.material) return;

    const mat = obj.material;
    if (!buckets.has(mat)) buckets.set(mat, []);
    buckets.get(mat).push(obj);
  });

  for (const [mat, meshes] of buckets) {
    if (meshes.length <= 1) continue;
    const geos = [];
    for (const m of meshes) {
      const geo = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      for (const attrName of Object.keys(geo.attributes)) {
        if (attrName !== 'position' && attrName !== 'normal' && attrName !== 'uv') {
          geo.deleteAttribute(attrName);
        }
      }
      if (!geo.attributes.normal) geo.computeVertexNormals();
      if (!geo.attributes.uv) {
        geo.setAttribute(
          'uv',
          new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2)
        );
      }
      relMat.multiplyMatrices(invRoot, m.matrixWorld);
      geo.applyMatrix4(relMat);
      geos.push(geo);
    }

    const merged = mergeGeometries(geos, false);
    geos.forEach((g) => g.dispose());
    if (!merged) continue;

    for (const m of meshes) {
      if (m.parent) m.parent.remove(m);
      m.geometry.dispose();
    }

    const mergedMesh = new THREE.Mesh(merged, mat);
    mergedMesh.castShadow = castShadow;
    mergedMesh.receiveShadow = true;
    root.add(mergedMesh);
  }
  return topAnimatedRoots;
}

function createFenceRun(parentGroup, templateRoot, startX, startZ, endX, endZ) {
  const dx = endX - startX;
  const dz = endZ - startZ;
  const totalLen = Math.hypot(dx, dz);
  const angle = Math.atan2(-dz, dx);
  const totalBays = Math.max(1, Math.round(totalLen / 2.5));
  const scaleX = totalLen / (totalBays * 2.5);

  const runGroup = new THREE.Group();
  runGroup.position.set(startX, 0, startZ);
  runGroup.rotation.y = angle;
  runGroup.scale.x = scaleX;

  let remainingBays = totalBays;
  let offsetX = 0;
  let chunkIdx = 0;

  while (remainingBays > 0) {
    const takeBays = Math.min(10, remainingBays);
    const chunk = templateRoot.clone(true);
    chunk.position.set(offsetX + 12.5, 0, 0);

    // Avoid duplicate pillar at chunk boundary
    if (chunkIdx > 0) {
      const firstPillar = chunk.getObjectByName('FencePillar_0');
      if (firstPillar && firstPillar.parent) {
        firstPillar.parent.remove(firstPillar);
      }
    }

    // Trim extra bays/pillars if this final chunk is < 10 bays
    if (takeBays < 10) {
      for (let b = takeBays + 1; b <= 10; b++) {
        const extraBay = chunk.getObjectByName(`FenceBay_${b}`);
        if (extraBay && extraBay.parent) extraBay.parent.remove(extraBay);
        const extraPillar = chunk.getObjectByName(`FencePillar_${b}`);
        if (extraPillar && extraPillar.parent) extraPillar.parent.remove(extraPillar);
      }
    }

    runGroup.add(chunk);
    offsetX += takeBays * 2.5;
    remainingBays -= takeBays;
    chunkIdx++;
  }

  // Batch each wall side independently so walls behind the camera frustum-cull cleanly!
  mergeStaticMeshesByMaterial(runGroup, [], false);
  parentGroup.add(runGroup);
}

function buildLiteTempleWalls() {
  const liteGroup = new THREE.Group();
  liteGroup.name = 'TemplePerimeterWallsLite';

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xe6d6c3, roughness: 0.85 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xa1493c, roughness: 0.78 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.45 });

  const runs = [
    [-6.8, 54, -42.0, 54],
    [6.8, 54, 57.0, 54],
    [-42.0, 54, -42.0, -58.5],
    [57.0, 54, 57.0, -58.5],
    [-42.0, -58.5, 57.0, -58.5]
  ];

  const pillarCoords = [];
  for (const [sx, sz, ex, ez] of runs) {
    const dx = ex - sx;
    const dz = ez - sz;
    const len = Math.hypot(dx, dz);
    const angle = Math.atan2(-dz, dx);

    const wall = new THREE.Mesh(new THREE.BoxGeometry(len, 1.85, 0.34), wallMat);
    wall.position.set((sx + ex) * 0.5, 0.925, (sz + ez) * 0.5);
    wall.rotation.y = angle;
    liteGroup.add(wall);

    const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.16, 0.44), trimMat);
    rail.position.set((sx + ex) * 0.5, 1.9, (sz + ez) * 0.5);
    rail.rotation.y = angle;
    liteGroup.add(rail);

    const steps = Math.max(1, Math.round(len / 5.0));
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      pillarCoords.push([sx + dx * u, sz + dz * u]);
    }
  }

  const pInst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.46, 2.25, 0.46), wallMat, pillarCoords.length);
  const cInst = new THREE.InstancedMesh(new THREE.ConeGeometry(0.24, 0.42, 4), goldMat, pillarCoords.length);
  const d = new THREE.Object3D();
  pillarCoords.forEach(([px, pz], i) => {
    d.position.set(px, 1.125, pz);
    d.rotation.set(0, 0, 0);
    d.updateMatrix();
    pInst.setMatrixAt(i, d.matrix);

    d.position.set(px, 2.45, pz);
    d.rotation.set(0, Math.PI / 4, 0);
    d.updateMatrix();
    cInst.setMatrixAt(i, d.matrix);
  });
  pInst.instanceMatrix.needsUpdate = true;
  cInst.instanceMatrix.needsUpdate = true;
  liteGroup.add(pInst, cInst);

  scene.add(liteGroup);
  return liteGroup;
}

function buildTemplePerimeterWalls(fenceScene) {
  const templateRoot = fenceScene.getObjectByName('TempleFence_Root') || fenceScene;
  const wallsGroup = new THREE.Group();
  wallsGroup.name = 'TemplePerimeterWalls';

  // Front-left from outside left elephant pedestal (-6.8, 54) to (-42.0, 54)
  createFenceRun(wallsGroup, templateRoot, -6.8, 54, -42.0, 54);
  // Front-right from outside right elephant pedestal (+6.8, 54) to (+57.0, 54)
  createFenceRun(wallsGroup, templateRoot, 6.8, 54, 57.0, 54);
  // West (left) wall from (-42.0, 54) to (-42.0, -58.5)
  createFenceRun(wallsGroup, templateRoot, -42.0, 54, -42.0, -58.5);
  // East (right) wall from (+57.0, 54) to (+57.0, -58.5)
  createFenceRun(wallsGroup, templateRoot, 57.0, 54, 57.0, -58.5);
  // North (back) wall from (-42.0, -58.5) to (+57.0, -58.5)
  createFenceRun(wallsGroup, templateRoot, -42.0, -58.5, 57.0, -58.5);

  scene.add(wallsGroup);
  perfLodRefs.detailedWalls = wallsGroup;
  perfLodRefs.liteWalls = buildLiteTempleWalls();
  applyPerfLodMode(state.lowGraphics);
}

async function loadAllModels() {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/vendor/draco/');
  loader.setDRACOLoader(dracoLoader);

  const total = MODEL_SPECS.length + 3; // 7 world models + avatars.glb + temple_wall.glb + motorcycles.glb
  const perFileProgress = new Array(total).fill(0);

  function updateProgressUI(statusText) {
    const sum = perFileProgress.reduce((a, b) => a + b, 0);
    const pct = Math.min(100, Math.round((sum / total) * 100));
    dom.loadingBarFill.style.width = `${pct}%`;
    dom.loadingProgressbar.setAttribute('aria-valuenow', String(pct));
    dom.loadingPercent.textContent = `${pct}%`;
    if (statusText) {
      dom.loadingStatus.textContent = statusText;
    }
  }

  for (let i = 0; i < MODEL_SPECS.length; i++) {
    const spec = MODEL_SPECS[i];
    updateProgressUI(`กำลังโหลด ${spec.url.replace('/models/', '')} (${i + 1}/${total})`);

    try {
      const gltf = await new Promise((resolve, reject) => {
        loader.load(
          spec.url,
          (data) => resolve(data),
          (xhr) => {
            if (xhr.lengthComputable && xhr.total > 0) {
              perFileProgress[i] = Math.min(0.95, xhr.loaded / xhr.total);
              updateProgressUI();
            }
          },
          (err) => reject(err)
        );
      });

      const modelRoot = gltf.scene;
      // Trim the last east bay (X=25..28) from tunnel_18m to open space before the pier
      if (spec.key === 'tunnel18') {
        for (const trimName of ['TunnelBay_1', 'ArchFrame_1']) {
          const part = modelRoot.getObjectByName(trimName);
          if (part && part.parent) {
            part.parent.remove(part);
          }
        }
      }
      modelRoot.position.set(...spec.pos);
      modelRoot.rotation.y = spec.rotY;
      // Only large architectural buildings cast static baked shadows (skip high-poly tables/tunnels)
      const shouldCast = !state.lowGraphics && (spec.key === 'gate' || spec.key === 'ubosot' || spec.key === 'salaBuddha');
      const animRoots = mergeStaticMeshesByMaterial(modelRoot, spec.animate ? gltf.animations : [], shouldCast);
      if (spec.key === 'concertStage') {
        perfLodRefs.concertAnimNodes = animRoots;
        perfLodRefs.cullableBuildings.push({ root: modelRoot, pos: new THREE.Vector3(...spec.pos), maxDist: 82 });
      } else if (spec.key === 'krathongTables') {
        perfLodRefs.krathongTablesRoot = modelRoot;
      } else if (spec.key === 'gate' || spec.key === 'ubosot' || spec.key === 'salaBuddha') {
        perfLodRefs.cullableBuildings.push({ root: modelRoot, pos: new THREE.Vector3(...spec.pos), maxDist: 78 });
      }
      modelRoot.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = shouldCast;
          obj.receiveShadow = true;
        }
      });
      scene.add(modelRoot);

      const clipNames = (gltf.animations || []).map((a) => a.name);
      if (spec.animate && gltf.animations && gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(modelRoot);
        for (const clip of gltf.animations) {
          const action = mixer.clipAction(clip);
          action.play();
        }
        mixers.push({
          mixer,
          pos: new THREE.Vector3(...spec.pos),
          maxDist: spec.key === 'concertStage' ? 62 : 38
        });
      }

      perFileProgress[i] = 1;
      state.modelReport.push({
        key: spec.key,
        url: spec.url,
        status: 'loaded',
        animations: clipNames
      });
      updateProgressUI(`โหลดสำเร็จ: ${spec.url.replace('/models/', '')}`);
    } catch (err) {
      console.warn(`Model failed (${spec.url}), using wireframe fallback:`, err);
      createFallbackWireframe(spec);
      perFileProgress[i] = 1;
      state.modelReport.push({
        key: spec.key,
        url: spec.url,
        status: 'fallback',
        error: err?.message || 'load error'
      });
      updateProgressUI(`ใช้กล่องจำลองแทน: ${spec.url.replace('/models/', '')}`);
    }
  }

  // Load 10-character pack (/models/avatars.glb)
  const avatarIdx = MODEL_SPECS.length;
  updateProgressUI(`กำลังโหลด avatars.glb (${avatarIdx + 1}/${total})`);
  try {
    const avatarGltf = await new Promise((resolve, reject) => {
      loader.load(
        `/models/avatars.glb${MODEL_VER}`,
        (data) => resolve(data),
        (xhr) => {
          if (xhr.lengthComputable && xhr.total > 0) {
            perFileProgress[avatarIdx] = Math.min(0.95, xhr.loaded / xhr.total);
            updateProgressUI();
          }
        },
        (err) => reject(err)
      );
    });
    avatarBank.loaded = true;
    avatarBank.scene = avatarGltf.scene;
    avatarBank.animations = avatarGltf.animations || [];
    perFileProgress[avatarIdx] = 1;
    state.modelReport.push({
      key: 'avatars',
      url: '/models/avatars.glb',
      status: 'loaded',
      animations: avatarBank.animations.map((a) => a.name)
    });
    updateProgressUI('โหลดสำเร็จ: avatars.glb');
  } catch (err) {
    console.warn('avatars.glb failed, using fallback avatar:', err);
    perFileProgress[avatarIdx] = 1;
    state.modelReport.push({
      key: 'avatars',
      url: '/models/avatars.glb',
      status: 'fallback',
      error: err?.message || 'load error'
    });
  }

  // Load temple perimeter wall (/models/temple_wall.glb)
  const wallIdx = MODEL_SPECS.length + 1;
  updateProgressUI(`กำลังโหลด temple_wall.glb (${wallIdx + 1}/${total})`);
  try {
    const wallGltf = await new Promise((resolve, reject) => {
      loader.load(
        `/models/temple_wall.glb${MODEL_VER}`,
        (data) => resolve(data),
        (xhr) => {
          if (xhr.lengthComputable && xhr.total > 0) {
            perFileProgress[wallIdx] = Math.min(0.95, xhr.loaded / xhr.total);
            updateProgressUI();
          }
        },
        (err) => reject(err)
      );
    });
    buildTemplePerimeterWalls(wallGltf.scene);
    perFileProgress[wallIdx] = 1;
    state.modelReport.push({
      key: 'templeWall',
      url: '/models/temple_wall.glb',
      status: 'loaded',
      animations: []
    });
    updateProgressUI('โหลดสำเร็จ: temple_wall.glb');
  } catch (err) {
    console.warn('temple_wall.glb failed:', err);
    perFileProgress[wallIdx] = 1;
    state.modelReport.push({
      key: 'templeWall',
      url: '/models/temple_wall.glb',
      status: 'fallback',
      error: err?.message || 'load error'
    });
  }

  // Load parked motorcycles pack (/models/motorcycles.glb)
  const motoIdx = MODEL_SPECS.length + 2;
  updateProgressUI(`กำลังโหลด motorcycles.glb (${total}/${total})`);
  try {
    const motoGltf = await new Promise((resolve, reject) => {
      loader.load(
        `/models/motorcycles.glb${MODEL_VER}`,
        (data) => resolve(data),
        (xhr) => {
          if (xhr.lengthComputable && xhr.total > 0) {
            perFileProgress[motoIdx] = Math.min(0.95, xhr.loaded / xhr.total);
            updateProgressUI();
          }
        },
        (err) => reject(err)
      );
    });
    populateParkedMotorcycles(motoGltf.scene);
    if (frontRoadState) {
      upgradeRoadMotorcycles(frontRoadState, motoGltf.scene, avatarBank.scene);
    }
    perFileProgress[motoIdx] = 1;
    state.modelReport.push({
      key: 'motorcycles',
      url: '/models/motorcycles.glb',
      status: 'loaded',
      animations: []
    });
    updateProgressUI('โหลดสำเร็จ: motorcycles.glb');
  } catch (err) {
    console.warn('motorcycles.glb failed, using fallback motorcycles:', err);
    buildFallbackMotorcycles(motorcycleParkingSlots);
    perFileProgress[motoIdx] = 1;
    state.modelReport.push({
      key: 'motorcycles',
      url: '/models/motorcycles.glb',
      status: 'fallback',
      error: err?.message || 'load error'
    });
  }

  dracoLoader.dispose();
  // Ensure fast Lambert shaders & mobile LOD are applied to all newly loaded GLBs
  applyPerfLodMode(state.lowGraphics);
  // Bake static shadows once after all models finish loading (0 ms per-frame shadow cost)
  if (!state.lowGraphics) {
    renderer.shadowMap.needsUpdate = true;
  }
  window.__MODEL_REPORT__ = state.modelReport;
  document.body.dataset.modelReport = JSON.stringify(state.modelReport);
  console.info('GLB Model Loading Report:', state.modelReport);
  updateProgressUI('พร้อมเข้าสู่งานลอยกระทง 3 มิติ!');
}

// ============================================================================
// 7. 3D ANIME/CHIBI AVATAR LOADER (avatars.glb) & LOBBY 360° PREVIEW
// ============================================================================

function buildFallbackAvatarMesh() {
  const root = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.22, 0.5, 6, 12),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 })
  );
  body.position.y = 0.65;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 14, 14),
    new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.6 })
  );
  head.position.y = 1.25;
  const handSocket = new THREE.Group();
  handSocket.position.set(0.28, 0.65, 0.25);
  root.add(body, head, handSocket);
  return {
    root,
    handSocket,
    headY: 1.5,
    triggerWave() {},
    update() {}
  };
}

function buildAvatar(rawConfig = {}) {
  const spec = AVATAR_BY_ID.get(rawConfig?.avatarId) || AVATAR_CATALOG[0];
  const sourceNode = avatarBank.loaded && avatarBank.scene
    ? avatarBank.scene.getObjectByName(spec.id)
    : null;

  if (!sourceNode) {
    return buildFallbackAvatarMesh();
  }

  const root = new THREE.Group();
  const model = sourceNode.clone(true);
  model.position.set(0, 0, 0);
  model.rotation.set(0, 0, 0);
  model.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = !state.lowGraphics;
      obj.receiveShadow = true;
    }
  });
  root.add(model);

  // Measure natural height & ground feet cleanly at Y=0
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  if (Number.isFinite(box.min.y) && Math.abs(box.min.y) > 0.005) {
    model.position.y -= box.min.y;
  }
  const headY = Number.isFinite(box.max.y) ? Math.max(0.85, box.max.y - (box.min.y || 0)) : 1.35;

  // Attach right-hand socket for holding Krathong
  const handSocket = new THREE.Group();
  const forearmR = model.getObjectByName(`${spec.suffix}_ForearmR`);
  if (forearmR) {
    handSocket.position.set(0, -0.2, 0.16);
    forearmR.add(handSocket);
  } else {
    handSocket.position.set(-0.24, headY * 0.5, 0.25);
    root.add(handSocket);
  }

  // Bind Idle, Walk, Wave AnimationClips
  const mixer = new THREE.AnimationMixer(model);
  const idleClip = THREE.AnimationClip.findByName(avatarBank.animations, `Idle_${spec.suffix}`);
  const walkClip = THREE.AnimationClip.findByName(avatarBank.animations, `Walk_${spec.suffix}`);
  const waveClip = THREE.AnimationClip.findByName(avatarBank.animations, `Wave_${spec.suffix}`);

  const idleAction = idleClip ? mixer.clipAction(idleClip) : null;
  const walkAction = walkClip ? mixer.clipAction(walkClip) : null;
  const waveAction = waveClip ? mixer.clipAction(waveClip) : null;

  if (waveAction) {
    waveAction.setLoop(THREE.LoopOnce, 1);
    waveAction.clampWhenFinished = false;
  }
  if (idleAction) {
    idleAction.play();
  }

  let currentLocomotion = 'idle';
  let waveUntil = 0;

  function triggerWave() {
    if (!waveAction) return;
    const now = performance.now();
    waveAction.reset();
    waveAction.setEffectiveWeight(1);
    waveAction.fadeIn(0.14).play();
    waveUntil = now + (waveClip.duration || 1.6) * 1000;
  }

  function update(dt, isMoving = false, isRunning = false) {
    const wantLocomotion = isMoving && walkAction ? 'walk' : 'idle';
    if (wantLocomotion !== currentLocomotion) {
      const fromAct = currentLocomotion === 'walk' ? walkAction : idleAction;
      const toAct = wantLocomotion === 'walk' ? walkAction : idleAction;
      if (toAct) {
        toAct.reset().setEffectiveWeight(1).play();
        if (fromAct && fromAct !== toAct) {
          toAct.crossFadeFrom(fromAct, 0.18, true);
        }
      }
      currentLocomotion = wantLocomotion;
    }

    if (walkAction && currentLocomotion === 'walk') {
      walkAction.timeScale = isRunning ? 1.55 : 1.0;
    }

    if (waveUntil > 0 && performance.now() > waveUntil) {
      waveUntil = 0;
      if (waveAction) {
        waveAction.fadeOut(0.2);
      }
    }

    mixer.update(dt);
  }

  return {
    root,
    handSocket,
    headY,
    triggerWave,
    update
  };
}

// Lobby 360° Preview Scene
const previewRenderer = new THREE.WebGLRenderer({
  canvas: dom.previewCanvas,
  antialias: true,
  alpha: true
});
const previewScene = new THREE.Scene();
const previewCamera = new THREE.PerspectiveCamera(40, 1, 0.1, 30);
previewCamera.position.set(0, 1.05, 2.5);
previewCamera.lookAt(0, 0.72, 0);

previewScene.add(new THREE.HemisphereLight(0xfef3c7, 0x1e293b, 1.4));
const previewDir = new THREE.DirectionalLight(0xffffff, 1.25);
previewDir.position.set(2, 4, 3);
previewScene.add(previewDir);

const previewPedestal = new THREE.Mesh(
  new THREE.CylinderGeometry(0.65, 0.75, 0.1, 24),
  new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.4, roughness: 0.4 })
);
previewPedestal.position.y = -0.05;
previewScene.add(previewPedestal);

let previewAvatar = null;
let previewYaw = 0.28;
let previewDragging = false;
let previewLastX = 0;

function renderAvatarCards() {
  dom.avatarGrid.replaceChildren();
  for (const item of AVATAR_CATALOG) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'avatar-card';
    btn.dataset.avatarId = item.id;
    btn.setAttribute('role', 'radio');
    const isSelected = state.avatarConfig.avatarId === item.id;
    btn.setAttribute('aria-checked', String(isSelected));
    if (isSelected) btn.classList.add('selected');

    const iconEl = document.createElement('span');
    iconEl.className = 'avatar-card-icon';
    iconEl.textContent = item.icon;

    const nameEl = document.createElement('span');
    nameEl.className = 'avatar-card-name';
    nameEl.textContent = item.label;

    const tagEl = document.createElement('span');
    tagEl.className = 'avatar-card-tag';
    tagEl.textContent = item.tag;

    btn.append(iconEl, nameEl, tagEl);
    btn.addEventListener('click', () => {
      state.avatarConfig = { avatarId: item.id };
      renderAvatarCards();
      refreshPreviewAvatar();
    });
    dom.avatarGrid.appendChild(btn);
  }
}

function refreshPreviewAvatar() {
  if (previewAvatar) {
    previewScene.remove(previewAvatar.root);
  }
  previewAvatar = buildAvatar(state.avatarConfig);
  previewAvatar.root.rotation.y = previewYaw;
  previewScene.add(previewAvatar.root);

  const spec = AVATAR_BY_ID.get(state.avatarConfig.avatarId) || AVATAR_CATALOG[0];
  dom.previewSelectedName.textContent = `${spec.icon} ${spec.label} (${spec.tag})`;

  // Frame camera to fit tall / medium / chibi characters nicely
  const h = previewAvatar.headY || 1.3;
  const dist = Math.max(1.85, h * 1.82);
  previewCamera.position.set(0, h * 0.62 + 0.12, dist);
  previewCamera.lookAt(0, h * 0.48, 0);
}

dom.btnPreviewWave.addEventListener('click', () => {
  if (previewAvatar) {
    previewAvatar.triggerWave();
  }
});

function resizePreviewCanvas() {
  const rect = dom.previewCanvas.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    previewRenderer.setSize(rect.width, rect.height, false);
    previewCamera.aspect = rect.width / rect.height;
    previewCamera.updateProjectionMatrix();
  }
}

dom.previewCanvas.addEventListener('pointerdown', (e) => {
  previewDragging = true;
  previewLastX = e.clientX;
  dom.previewCanvas.setPointerCapture(e.pointerId);
});
dom.previewCanvas.addEventListener('pointermove', (e) => {
  if (!previewDragging) return;
  const dx = e.clientX - previewLastX;
  previewLastX = e.clientX;
  previewYaw += dx * 0.015;
  if (previewAvatar) previewAvatar.root.rotation.y = previewYaw;
});
dom.previewCanvas.addEventListener('pointerup', () => { previewDragging = false; });
dom.previewCanvas.addEventListener('pointercancel', () => { previewDragging = false; });

// ============================================================================
// 8. MULTIPLAYER PLAYER MANAGEMENT & 3D LABELS
// ============================================================================

function updatePlayerHeldKrathong(playerObj, krathongType) {
  if (playerObj.heldMesh) {
    playerObj.handSocket.remove(playerObj.heldMesh);
    playerObj.heldMesh = null;
  }
  playerObj.heldKrathong = krathongType || null;
  if (krathongType) {
    const mesh = createKrathongMesh(krathongType, 0.56);
    playerObj.handSocket.add(mesh);
    playerObj.heldMesh = mesh;
  }
  if (playerObj.id === state.selfId) {
    state.heldKrathong = playerObj.heldKrathong;
    const meta = KRATHONG_META[state.heldKrathong];
    dom.hudHeldKrathong.textContent = meta
      ? `${meta.emoji} ถือ${meta.name} (ไปที่ท่าน้ำเพื่อลอย)`
      : '🪷 ยังไม่ได้ถือกระทง';
  }
}

function createPlayerLabelElement(playerId, nickname) {
  const wrap = document.createElement('div');
  wrap.className = 'floating-label';

  const bubble = document.createElement('div');
  bubble.className = 'label-chat-bubble hidden';

  const speaking = document.createElement('div');
  speaking.className = 'label-speaking hidden';
  speaking.textContent = '🎙️ กำลังพูด...';

  const name = document.createElement('div');
  name.className = playerId === state.selfId ? 'label-name is-self' : 'label-name';
  name.textContent = nickname;

  wrap.append(bubble, speaking, name);
  dom.labelsLayer.appendChild(wrap);
  return { wrap, bubble, speaking, name };
}

function spawnOrUpdatePlayer(data) {
  if (state.players.has(data.id)) return state.players.get(data.id);

  const built = buildAvatar(data.avatar);
  if (state.lowGraphics) {
    applyMobileMaterialMode(built.root, true);
  }
  built.root.position.set(data.x || 0, data.y || 0, data.z || 59);
  built.root.rotation.y = data.rotY ?? Math.PI;
  scene.add(built.root);

  const labelEls = createPlayerLabelElement(data.id, data.nickname);
  const pObj = {
    id: data.id,
    nickname: data.nickname,
    avatar: data.avatar,
    group: built.root,
    handSocket: built.handSocket,
    headY: built.headY,
    triggerWave: built.triggerWave,
    updateAnim: built.update,
    currentPos: new THREE.Vector3(data.x || 0, data.y || 0, data.z || 59),
    targetPos: new THREE.Vector3(data.x || 0, data.y || 0, data.z || 59),
    currentRotY: data.rotY ?? Math.PI,
    targetRotY: data.rotY ?? Math.PI,
    isMoving: Boolean(data.isMoving),
    isRunning: Boolean(data.isRunning),
    heldKrathong: null,
    heldMesh: null,
    isSpeaking: Boolean(data.isSpeaking),
    labelEls,
    chatExpireAt: 0
  };

  if (data.heldKrathong) {
    updatePlayerHeldKrathong(pObj, data.heldKrathong);
  }
  if (pObj.isSpeaking) {
    pObj.labelEls.speaking.classList.remove('hidden');
  }

  state.players.set(data.id, pObj);
  updateOnlineCounter();
  return pObj;
}

function removePlayer(id) {
  const p = state.players.get(id);
  if (!p) return;
  scene.remove(p.group);
  p.labelEls.wrap.remove();
  state.players.delete(id);
  updateOnlineCounter();
  cleanupPeerConnection(id);
}

function updateOnlineCounter() {
  dom.hudOnlineCount.textContent = `ออนไลน์ ${state.players.size}/${state.roomMax} คน`;
  if (dom.hudRoomName) {
    dom.hudRoomName.textContent = state.roomName;
  }
}

function showPlayerChatBubble(playerId, text) {
  const p = state.players.get(playerId);
  if (!p) return;
  p.labelEls.bubble.textContent = text;
  p.labelEls.bubble.classList.remove('hidden');
  p.chatExpireAt = performance.now() + 5500;
}

function spawnFloatedKrathong(kData) {
  if (state.krathongs.has(kData.id)) return;
  const mesh = createKrathongMesh(kData.type, 1.05);
  mesh.position.set(kData.x, 0.08, kData.z);
  scene.add(mesh);

  const labelEl = document.createElement('div');
  labelEl.className = 'floating-label';
  const card = document.createElement('div');
  card.className = 'krathong-label';
  const ownerStrong = document.createElement('strong');
  ownerStrong.textContent = kData.ownerName;
  const wishSpan = document.createElement('span');
  wishSpan.textContent = kData.wish;
  card.append(ownerStrong, wishSpan);
  labelEl.appendChild(card);
  dom.labelsLayer.appendChild(labelEl);

  state.krathongs.set(kData.id, { data: kData, mesh, labelEl });
}

function spawnReleasedLantern(lData) {
  if (!lData || state.releasedLanterns.has(lData.id)) return;
  const ageMs = Date.now() - (lData.createdAt || Date.now());
  if (ageMs >= LANTERN_PLAZA_CONFIG.lifetimeMs) return;

  const mesh = createReleasedLanternMesh(lData.color);
  mesh.position.set(lData.x, 1.15, lData.z);
  scene.add(mesh);

  const labelEl = document.createElement('div');
  labelEl.className = 'floating-label';
  const card = document.createElement('div');
  card.className = 'lantern-label';
  const ownerStrong = document.createElement('strong');
  ownerStrong.textContent = `🏮 ${lData.ownerName}`;
  const wishSpan = document.createElement('span');
  wishSpan.textContent = lData.wish;
  card.append(ownerStrong, wishSpan);
  labelEl.appendChild(card);
  dom.labelsLayer.appendChild(labelEl);

  state.releasedLanterns.set(lData.id, { data: lData, mesh, labelEl });
}

// ============================================================================
// 9. SPATIAL CONCERT AUDIO (concert.mp3 OR 120 BPM SYNTHESIZER)
// ============================================================================

const audioEngine = {
  ctx: null,
  concertGain: null,
  concertPanner: null,
  usingMp3: false,
  mp3El: null,
  synthTimer: null,
  step: 0,
  started: false
};

async function initConcertAudio() {
  if (audioEngine.started) {
    if (audioEngine.ctx && audioEngine.ctx.state === 'suspended') {
      await audioEngine.ctx.resume();
    }
    return;
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  audioEngine.ctx = new AudioCtx();
  audioEngine.concertGain = audioEngine.ctx.createGain();
  audioEngine.concertGain.gain.value = 0.0;
  audioEngine.concertPanner = audioEngine.ctx.createStereoPanner();
  audioEngine.concertGain.connect(audioEngine.concertPanner);
  audioEngine.concertPanner.connect(audioEngine.ctx.destination);
  audioEngine.started = true;

  // Check if /audio/concert.mp3 exists without causing a 404 console warning
  let hasMp3 = false;
  try {
    const res = await fetch(apiUrl('/api/audio-check'));
    if (res.ok) {
      const info = await res.json();
      hasMp3 = Boolean(info?.exists);
    }
  } catch {
    hasMp3 = false;
  }

  if (hasMp3) {
    try {
      const el = new Audio('/audio/concert.mp3');
      el.loop = true;
      el.crossOrigin = 'anonymous';
      const src = audioEngine.ctx.createMediaElementSource(el);
      src.connect(audioEngine.concertGain);
      await el.play();
      audioEngine.mp3El = el;
      audioEngine.usingMp3 = true;
      return;
    } catch (err) {
      console.warn('Could not stream concert.mp3, falling back to 120 BPM synth:', err);
    }
  }

  // Fallback: 120 BPM Web Audio Synthesizer (16th-note step = 125ms)
  startSynth120BPM();
}

function startSynth120BPM() {
  if (audioEngine.synthTimer) return;
  // Thai pentatonic scale (C major pentatonic: C, D, E, G, A)
  const melodyFreqs = [523.25, 587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33];
  const bassFreqs = [130.81, 130.81, 146.83, 164.81, 196.0, 196.0, 146.83, 164.81];

  audioEngine.synthTimer = window.setInterval(() => {
    const ctx = audioEngine.ctx;
    if (!ctx || !state.musicEnabled || ctx.state !== 'running') return;
    if (audioEngine.concertGain.gain.value < 0.005) {
      audioEngine.step = (audioEngine.step + 1) % 16;
      return;
    }

    const now = ctx.currentTime;
    const s = audioEngine.step;

    // Kick on 0, 4, 8, 12
    if (s % 4 === 0) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.14);
      g.gain.setValueAtTime(0.65, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(g).connect(audioEngine.concertGain);
      osc.start(now);
      osc.stop(now + 0.17);
    }

    // Snare/clap on 4 and 12
    if (s === 4 || s === 12) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);
      g.gain.setValueAtTime(0.28, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(g).connect(audioEngine.concertGain);
      osc.start(now);
      osc.stop(now + 0.11);
    }

    // Offbeat Hi-hat
    if (s % 2 === 1) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(6400, now);
      g.gain.setValueAtTime(0.04, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.connect(g).connect(audioEngine.concertGain);
      osc.start(now);
      osc.stop(now + 0.04);
    }

    // Walking festive bass on every 2 steps
    if (s % 2 === 0) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bassFreqs[(s / 2) % bassFreqs.length], now);
      g.gain.setValueAtTime(0.14, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(g).connect(audioEngine.concertGain);
      osc.start(now);
      osc.stop(now + 0.19);
    }

    // Pentatonic melody pluck
    if (s % 2 === 0 || s === 7 || s === 15) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      const idx = (s + Math.floor(Date.now() / 2000)) % melodyFreqs.length;
      osc.frequency.setValueAtTime(melodyFreqs[idx], now);
      g.gain.setValueAtTime(0.16, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(g).connect(audioEngine.concertGain);
      osc.start(now);
      osc.stop(now + 0.24);
    }

    audioEngine.step = (s + 1) % 16;
  }, 125);
}

function updateSpatialConcertAudio(playerPos) {
  if (!audioEngine.concertGain || !audioEngine.ctx) return;
  if (!state.musicEnabled) {
    audioEngine.concertGain.gain.setTargetAtTime(0, audioEngine.ctx.currentTime, 0.06);
    return;
  }
  const dist = playerPos.distanceTo(CONCERT_POS);
  // Loud within 10m, gentle rolloff up to 52m
  const maxDist = 52;
  const vol = Math.max(0, 1 - Math.max(0, dist - 8) / (maxDist - 8));
  const curvedVol = vol * vol * 0.48;
  audioEngine.concertGain.gain.setTargetAtTime(curvedVol, audioEngine.ctx.currentTime, 0.08);

  // Stereo pan relative to camera right vector
  const toStage = CONCERT_POS.clone().sub(playerPos);
  const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const pan = THREE.MathUtils.clamp(toStage.normalize().dot(camRight), -0.85, 0.85);
  audioEngine.concertPanner.pan.setTargetAtTime(pan, audioEngine.ctx.currentTime, 0.08);
}

// ============================================================================
// 10. WEBRTC PUSH-TO-TALK MESH & PROXIMITY VOICE AUDIO
// ============================================================================

const rtcConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

const voiceState = {
  localStream: null,
  micGranted: false,
  peers: new Map() // peerId -> { pc, audioEl, gainNode, sourceNode }
};

async function requestMicrophoneAccess(silent = false) {
  if (voiceState.localStream) return true;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    dom.micStateText.textContent = 'ไมค์: ไม่รองรับ';
    return false;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    stream.getAudioTracks().forEach((t) => { t.enabled = false; });
    voiceState.localStream = stream;
    voiceState.micGranted = true;
    dom.micStateText.textContent = 'ไมค์: พร้อม';

    // Attach local audio tracks to any existing peer connections
    for (const [, peer] of voiceState.peers) {
      const senders = peer.pc.getSenders();
      stream.getAudioTracks().forEach((track) => {
        if (!senders.some((s) => s.track === track)) {
          peer.pc.addTrack(track, stream);
        }
      });
    }
    return true;
  } catch (err) {
    voiceState.micGranted = false;
    dom.micStateText.textContent = 'ไมค์: ปิดสิทธิ์';
    if (!silent) {
      showToast('ไม่สามารถเข้าถึงไมโครโฟนได้ (ยังสามารถฟังเพื่อนและแชตข้อความได้)');
    }
    return false;
  }
}

function createPeerConnection(peerId) {
  if (voiceState.peers.has(peerId)) {
    return voiceState.peers.get(peerId);
  }

  const pc = new RTCPeerConnection(rtcConfig);
  const peerEntry = {
    pc,
    audioEl: null,
    gainNode: null,
    sourceNode: null
  };
  voiceState.peers.set(peerId, peerEntry);

  if (voiceState.localStream) {
    voiceState.localStream.getAudioTracks().forEach((track) => {
      pc.addTrack(track, voiceState.localStream);
    });
  }

  pc.onicecandidate = (e) => {
    if (e.candidate && socket) {
      socket.emit('webrtc:ice', { to: peerId, candidate: e.candidate });
    }
  };

  pc.ontrack = (e) => {
    const stream = e.streams[0];
    if (!stream) return;

    if (!peerEntry.audioEl) {
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      audioEl.playsInline = true;
      audioEl.srcObject = stream;
      peerEntry.audioEl = audioEl;

      if (audioEngine.ctx) {
        // Mute raw element and route via Web Audio GainNode for smooth proximity volume
        audioEl.muted = true;
        try {
          const src = audioEngine.ctx.createMediaStreamSource(stream);
          const gain = audioEngine.ctx.createGain();
          gain.gain.value = 1.0;
          src.connect(gain).connect(audioEngine.ctx.destination);
          peerEntry.sourceNode = src;
          peerEntry.gainNode = gain;
        } catch {
          audioEl.muted = false;
        }
      }
      audioEl.play().catch(() => {});
    }
  };

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
      cleanupPeerConnection(peerId);
    }
  };

  return peerEntry;
}

function cleanupPeerConnection(peerId) {
  const entry = voiceState.peers.get(peerId);
  if (!entry) return;
  try { entry.pc.close(); } catch {}
  if (entry.audioEl) {
    entry.audioEl.srcObject = null;
  }
  voiceState.peers.delete(peerId);
}

function updateProximityVoiceVolumes() {
  const self = state.players.get(state.selfId);
  if (!self) return;

  for (const [peerId, entry] of voiceState.peers) {
    const peerPlayer = state.players.get(peerId);
    if (!peerPlayer) continue;
    const dist = self.currentPos.distanceTo(peerPlayer.currentPos);
    // 0-15m full (1.0), 15-28m linear fade to 0.0, >=28m silent (0.0)
    let gainVal = 1.0;
    if (dist > 15) {
      gainVal = Math.max(0, 1 - (dist - 15) / (28 - 15));
    }
    if (entry.gainNode && audioEngine.ctx) {
      entry.gainNode.gain.setTargetAtTime(gainVal, audioEngine.ctx.currentTime, 0.06);
    } else if (entry.audioEl) {
      entry.audioEl.volume = gainVal;
    }
  }
}

async function setPushToTalk(active) {
  if (!state.joined) return;
  if (active && !voiceState.localStream) {
    const ok = await requestMicrophoneAccess(false);
    if (!ok) return;
  }
  if (state.isSpeaking === active) return;

  state.isSpeaking = active;
  if (voiceState.localStream) {
    voiceState.localStream.getAudioTracks().forEach((t) => {
      t.enabled = active;
    });
  }

  dom.btnPtt.classList.toggle('active', active);
  dom.btnPtt.setAttribute('aria-pressed', String(active));

  const self = state.players.get(state.selfId);
  if (self) {
    self.isSpeaking = active;
    self.labelEls.speaking.classList.toggle('hidden', !active);
  }
  if (socket) {
    socket.emit('voice:speaking', { speaking: active });
  }
}

// ============================================================================
// 11. SOCKET.IO MULTIPLAYER & SIGNALING
// ============================================================================

let socket = null;

function appendChatMessage(msg) {
  const li = document.createElement('li');
  li.className = msg.type === 'system' ? 'chat-item system' : 'chat-item';
  if (msg.type === 'system') {
    li.textContent = `✨ ${msg.text}`;
  } else {
    const strong = document.createElement('strong');
    strong.textContent = `${msg.senderName}:`;
    const body = document.createElement('span');
    body.textContent = ` ${msg.text}`;
    li.append(strong, body);
  }
  dom.chatMessages.appendChild(li);
  while (dom.chatMessages.children.length > 60) {
    dom.chatMessages.removeChild(dom.chatMessages.firstChild);
  }
  dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
}

const MAX_VOICE_PEERS = 6;
const VOICE_CONNECT_RADIUS = 26;
const VOICE_DISCONNECT_RADIUS = 34;
let voiceSyncTimer = null;

async function syncProximityVoicePeers() {
  if (!state.joined || !socket) return;
  const self = state.players.get(state.selfId);
  if (!self) return;

  // Sort remote peers in the room by distance to self
  const nearby = [];
  for (const [peerId, p] of state.players) {
    if (peerId === state.selfId) continue;
    const dist = self.currentPos.distanceTo(p.currentPos);
    nearby.push({ peerId, dist });
  }
  nearby.sort((a, b) => a.dist - b.dist);

  const desired = new Set(
    nearby
      .filter((n) => n.dist <= VOICE_CONNECT_RADIUS)
      .slice(0, MAX_VOICE_PEERS)
      .map((n) => n.peerId)
  );

  // Close connections for peers who walked far away (or left room)
  for (const [peerId] of voiceState.peers) {
    const peerPlayer = state.players.get(peerId);
    const dist = peerPlayer ? self.currentPos.distanceTo(peerPlayer.currentPos) : Infinity;
    if (!peerPlayer || (dist > VOICE_DISCONNECT_RADIUS && !desired.has(peerId))) {
      cleanupPeerConnection(peerId);
    }
  }

  // Initiate WebRTC offers only to nearby peers (deterministic initiator: selfId > peerId)
  for (const peerId of desired) {
    if (voiceState.peers.has(peerId)) continue;
    if (voiceState.peers.size >= MAX_VOICE_PEERS) break;
    if (state.selfId > peerId) {
      const entry = createPeerConnection(peerId);
      try {
        const offer = await entry.pc.createOffer();
        await entry.pc.setLocalDescription(offer);
        socket.emit('webrtc:offer', { to: peerId, offer });
      } catch (err) {
        console.warn('WebRTC proximity offer error:', err);
      }
    }
  }
}

async function fetchRoomsStatus() {
  if (!dom.selectRoom) return;
  try {
    const res = await fetch(apiUrl('/api/rooms'));
    if (!res.ok) return;
    const data = await res.json();
    if (!Array.isArray(data?.rooms)) return;

    const currentVal = dom.selectRoom.value || 'auto';
    dom.selectRoom.replaceChildren();

    const autoOpt = document.createElement('option');
    autoOpt.value = 'auto';
    autoOpt.textContent = `✨ เข้าห้องว่างอัตโนมัติ (ออนไลน์รวม ${data.totalOnline || 0} คน)`;
    dom.selectRoom.appendChild(autoOpt);

    for (const r of data.rooms) {
      const opt = document.createElement('option');
      opt.value = r.id;
      const fullTag = r.count >= r.max ? ' [เต็ม]' : '';
      opt.textContent = `🏮 ${r.name} (${r.count}/${r.max} คน)${fullTag}`;
      dom.selectRoom.appendChild(opt);
    }
    dom.selectRoom.value = currentVal;
  } catch {
    // Keep default options if backend is still waking up
  }
}

function connectSocketAndJoin() {
  socket = window.io(SERVER_URL || undefined, {
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    socket.emit(
      'player:join',
      {
        nickname: state.nickname,
        avatar: state.avatarConfig,
        lowGraphics: state.lowGraphics,
        roomId: state.selectedRoomId || 'auto'
      },
      (res) => {
        if (res?.ok) {
          state.selfId = res.selfId;
          state.roomId = res.roomId || 'room-1';
          state.roomName = res.roomName || 'ลานงาน 1';
          state.roomMax = res.roomMax || 35;
          state.joined = true;
          dom.lobbyOverlay.classList.add('hidden');
          dom.hud.classList.remove('hidden');
          dom.hudNickname.textContent = state.nickname;
          updateOnlineCounter();

          // Release the Lobby's 2nd WebGL context to free mobile VRAM immediately
          try {
            previewRenderer.dispose();
            previewRenderer.forceContextLoss();
          } catch {}

          if (voiceSyncTimer) clearInterval(voiceSyncTimer);
          voiceSyncTimer = setInterval(syncProximityVoicePeers, 2000);
          syncProximityVoicePeers();
        }
      }
    );
  });

  socket.on('world:init', (data) => {
    state.selfId = data.selfId;
    if (data.roomId) state.roomId = data.roomId;
    if (data.roomName) state.roomName = data.roomName;
    if (data.roomMax) state.roomMax = data.roomMax;
    dom.chatMessages.replaceChildren();
    (data.recentChats || []).forEach(appendChatMessage);
    (data.players || []).forEach((p) => spawnOrUpdatePlayer(p));
    (data.krathongs || []).forEach((k) => spawnFloatedKrathong(k));
    (data.lanterns || []).forEach((l) => spawnReleasedLantern(l));
    updateOnlineCounter();
  });

  socket.on('player:joined', (p) => {
    spawnOrUpdatePlayer(p);
  });

  function applyRemoteMove(d) {
    const p = state.players.get(d.id);
    if (!p || d.id === state.selfId) return;
    p.targetPos.set(d.x, d.y, d.z);
    p.targetRotY = d.rotY;
    p.isMoving = d.isMoving;
    p.isRunning = d.isRunning;
  }

  socket.on('player:moved', applyRemoteMove);
  socket.on('players:batch', (list) => {
    if (!Array.isArray(list)) return;
    for (let i = 0; i < list.length; i++) {
      applyRemoteMove(list[i]);
    }
  });

  socket.on('player:krathongUpdated', (d) => {
    const p = state.players.get(d.id);
    if (p) updatePlayerHeldKrathong(p, d.heldKrathong);
  });

  socket.on('krathong:floated', (k) => {
    spawnFloatedKrathong(k);
  });

  socket.on('lantern:released', (l) => {
    spawnReleasedLantern(l);
  });

  socket.on('chat:message', (msg) => {
    appendChatMessage(msg);
    if (msg.type === 'player' && msg.senderId) {
      showPlayerChatBubble(msg.senderId, msg.text);
    }
  });

  socket.on('voice:speaking', (d) => {
    const p = state.players.get(d.id);
    if (!p) return;
    p.isSpeaking = Boolean(d.speaking);
    p.labelEls.speaking.classList.toggle('hidden', !p.isSpeaking);
  });

  socket.on('player:waved', (d) => {
    const p = state.players.get(d?.id);
    if (p && p.triggerWave) {
      p.triggerWave();
    }
  });

  socket.on('player:left', (d) => {
    removePlayer(d.id);
  });

  // Proximity-scoped WebRTC Signaling handlers (max 6 nearby peers per client)
  socket.on('webrtc:offer', async ({ from, offer }) => {
    if (!from || !offer) return;
    if (!voiceState.peers.has(from) && voiceState.peers.size >= MAX_VOICE_PEERS) return;
    const entry = createPeerConnection(from);
    try {
      await entry.pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await entry.pc.createAnswer();
      await entry.pc.setLocalDescription(answer);
      socket.emit('webrtc:answer', { to: from, answer });
    } catch (err) {
      console.warn('WebRTC answer error:', err);
    }
  });

  socket.on('webrtc:answer', async ({ from, answer }) => {
    const entry = voiceState.peers.get(from);
    if (!entry || !answer) return;
    try {
      await entry.pc.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      console.warn('WebRTC setRemoteDescription error:', err);
    }
  });

  socket.on('webrtc:ice', async ({ from, candidate }) => {
    const entry = voiceState.peers.get(from);
    if (!entry || !candidate) return;
    try {
      await entry.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch {}
  });
}

// ============================================================================
// 12. MINIMAP RENDERER (NAVIGATION ONLY - NO TELEPORT)
// ============================================================================

const minimapCtx = dom.minimapCanvas.getContext('2d');

function drawMinimap() {
  const w = dom.minimapCanvas.width;
  const h = dom.minimapCanvas.height;
  minimapCtx.clearRect(0, 0, w, h);

  // World bounds mapped to minimap: X [-45..60] (span 105), Z [-61..78] (span 139)
  const mapX = (wx) => ((wx + 45) / 105) * w;
  const mapY = (wz) => ((wz + 61) / 139) * h;
  const mapW = (ww) => (ww / 105) * w;
  const mapH = (wd) => (wd / 139) * h;

  // Grass base
  minimapCtx.fillStyle = '#14331d';
  minimapCtx.fillRect(0, 0, w, h);

  // Front 4-lane highway (Z: 60.5..74.9)
  drawFrontRoadMinimap(minimapCtx, mapX, mapY, mapW, mapH);

  // Temple perimeter wall outline
  minimapCtx.strokeStyle = '#d97706';
  minimapCtx.lineWidth = 2.5;
  minimapCtx.beginPath();
  minimapCtx.moveTo(mapX(-6.8), mapY(54));
  minimapCtx.lineTo(mapX(-42), mapY(54));
  minimapCtx.lineTo(mapX(-42), mapY(-58.5));
  minimapCtx.lineTo(mapX(57), mapY(-58.5));
  minimapCtx.lineTo(mapX(57), mapY(54));
  minimapCtx.lineTo(mapX(6.8), mapY(54));
  minimapCtx.stroke();

  // Pond (X: 37..55, Z: -27..+3)
  minimapCtx.fillStyle = '#0284c7';
  minimapCtx.fillRect(mapX(37), mapY(-27), mapW(18), mapH(30));

  // Main road (X: -3.1..+3.1, Z: -58..+60.5)
  minimapCtx.fillStyle = '#475569';
  minimapCtx.fillRect(mapX(-3.1), mapY(-58), mapW(6.2), mapH(118.5));

  // Cross road (Z: -40..-35, X: -38..-3.1)
  minimapCtx.fillStyle = '#a1887f';
  minimapCtx.fillRect(mapX(-38), mapY(-40), mapW(34.9), mapH(5));

  // Ubosot (15, -43.5)
  minimapCtx.fillStyle = '#fbbf24';
  minimapCtx.fillRect(mapX(6.6), mapY(-56.5), mapW(16.8), mapH(26));

  // Concert stage moved to north-left (-21, -52.5)
  minimapCtx.fillStyle = '#ec4899';
  minimapCtx.fillRect(mapX(-32.2), mapY(-56.3), mapW(22.4), mapH(7.6));

  // Light tunnels (8, -7) & trimmed horizontal tunnel (X: 8..25, Z: -20.6)
  minimapCtx.fillStyle = '#facc15';
  minimapCtx.fillRect(mapX(6.5), mapY(-19), mapW(3), mapH(24));
  minimapCtx.fillRect(mapX(8), mapY(-22.1), mapW(17), mapH(3));

  // Krathong tables (20, -25.8) & Command (8.5, -26.2)
  minimapCtx.fillStyle = '#fb923c';
  minimapCtx.fillRect(mapX(17.5), mapY(-27), mapW(5), mapH(2.2));
  minimapCtx.fillStyle = '#a855f7';
  minimapCtx.fillRect(mapX(6.7), mapY(-28), mapW(3.6), mapH(3.6));

  // Contest (15, 7) & Sala Buddha (31, 13)
  minimapCtx.fillStyle = '#f43f5e';
  minimapCtx.fillRect(mapX(10.5), mapY(5.5), mapW(9), mapH(3));
  minimapCtx.fillStyle = '#fde047';
  minimapCtx.fillRect(mapX(25), mapY(7.5), mapW(12), mapH(11));

  // Pier (35.4, -12)
  minimapCtx.fillStyle = '#b45309';
  minimapCtx.fillRect(mapX(33.5), mapY(-14.5), mapW(4), mapH(5));

  // Parking lots
  minimapCtx.fillStyle = '#1d4ed8';
  minimapCtx.fillRect(mapX(-22), mapY(41.5), mapW(12), mapH(9));
  minimapCtx.fillRect(mapX(7), mapY(43.5), mapW(9), mapH(9));

  // Gate (0, 54)
  minimapCtx.fillStyle = '#f59e0b';
  minimapCtx.fillRect(mapX(-4.5), mapY(52.5), mapW(9), mapH(3));

  // Temple fair gardens (SE, SW/Mid-West & NE trees) & central lantern plaza
  drawGardenMinimap(minimapCtx, mapX, mapY);
  drawLanternPlazaMinimap(minimapCtx, mapX, mapY, mapW);

  // Remote online players (blue dots)
  for (const [id, p] of state.players) {
    if (id === state.selfId) continue;
    minimapCtx.fillStyle = '#38bdf8';
    minimapCtx.beginPath();
    minimapCtx.arc(mapX(p.currentPos.x), mapY(p.currentPos.z), 3.6, 0, Math.PI * 2);
    minimapCtx.fill();
  }

  // Self directional arrow
  const self = state.players.get(state.selfId);
  if (self) {
    const sx = mapX(self.currentPos.x);
    const sy = mapY(self.currentPos.z);
    minimapCtx.save();
    minimapCtx.translate(sx, sy);
    // rotY=0 faces +Z (down on minimap), rotY=Math.PI faces -Z (up on minimap)
    minimapCtx.rotate(-self.currentRotY + Math.PI);
    minimapCtx.fillStyle = '#facc15';
    minimapCtx.strokeStyle = '#0f172a';
    minimapCtx.lineWidth = 1.5;
    minimapCtx.beginPath();
    minimapCtx.moveTo(0, -6.5);
    minimapCtx.lineTo(4.8, 5.2);
    minimapCtx.lineTo(0, 2.6);
    minimapCtx.lineTo(-4.8, 5.2);
    minimapCtx.closePath();
    minimapCtx.fill();
    minimapCtx.stroke();
    minimapCtx.restore();
  }
}

// ============================================================================
// 13. UI EVENTS, DIALOGS, JOYSTICK & CAMERA INPUT
// ============================================================================

let toastTimer = null;
function showToast(msg) {
  dom.toastBanner.textContent = msg;
  dom.toastBanner.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    dom.toastBanner.classList.add('hidden');
  }, 3600);
}

// Fallback for <dialog closedby="any"> on Safari
if (!('closedBy' in HTMLDialogElement.prototype)) {
  const outside = (e, dialog) => {
    const r = dialog.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };
  for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
    let pressedOutside = false;
    dialog.addEventListener('pointerdown', (e) => { pressedOutside = outside(e, dialog); });
    dialog.addEventListener('pointerup', (e) => {
      if (pressedOutside && outside(e, dialog)) dialog.close();
    });
  }
}

document.querySelectorAll('[data-close-dialog]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const d = document.getElementById(btn.dataset.closeDialog);
    if (d && d.open) d.close();
  });
});

function isTypingOrModalOpen() {
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return true;
  return Boolean(document.querySelector('dialog[open]'));
}

function playTempleBell() {
  const ctx = audioEngine.ctx;
  if (!ctx || ctx.state !== 'running') return;
  const now = ctx.currentTime;
  const freqs = [528, 1056, 1584];
  freqs.forEach((f, idx) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, now);
    g.gain.setValueAtTime(0.14 / (idx + 1), now);
    g.gain.exponentialRampToValueAtTime(0.0008, now + 2.2);
    osc.connect(g).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 2.3);
  });
}

function openZoneDialog(zone) {
  if (!zone) return;
  if (zone.id === 'krathong-shop') {
    dom.dialogKrathongShop.showModal();
  } else if (zone.id === 'float-pier') {
    if (state.heldKrathong) {
      const meta = KRATHONG_META[state.heldKrathong];
      dom.floatHeldInfo.textContent = `คุณกำลังถือ ${meta.emoji} ${meta.name} พร้อมปล่อยลงสระน้ำแล้ว`;
      dom.floatQuickPick.classList.add('hidden');
    } else {
      dom.floatHeldInfo.textContent = 'คุณยังไม่ได้รับกระทงจากซุ้มบูชากระทง สามารถเลือกแบบด่วนด้านล่างได้ทันที';
      dom.floatQuickPick.classList.remove('hidden');
    }
    dom.dialogFloatKrathong.showModal();
  } else if (zone.id === 'lantern-plaza') {
    dom.dialogReleaseLantern.showModal();
  } else if (zone.id === 'sala-buddha') {
    const self = state.players.get(state.selfId);
    if (self) {
      self.currentRotY = Math.atan2(34.6 - self.currentPos.x, 13 - self.currentPos.z);
      self.group.rotation.y = self.currentRotY;
    }
    playTempleBell();
    showRandomBlessing();
    dom.dialogBuddha.showModal();
  }
}

// Krathong Shop Selection
document.querySelectorAll('[data-krathong-type]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.krathongType;
    const self = state.players.get(state.selfId);
    if (self) updatePlayerHeldKrathong(self, type);
    if (socket) socket.emit('player:krathong', { type });
    dom.dialogKrathongShop.close();
    const meta = KRATHONG_META[type];
    showToast(`รับ ${meta.emoji} ${meta.name} แล้ว! เดินไปที่ท่าน้ำจุดลอยกระทงได้เลย`);
  });
});

// Float Krathong Submit
dom.floatKrathongForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let type = state.heldKrathong;
  if (!type) {
    const picked = dom.floatKrathongForm.querySelector('input[name="quickKrathong"]:checked');
    type = picked ? picked.value : 'lotus';
  }
  const wish = dom.inputWish.value.trim() || 'ขอให้มีความสุข สุขภาพแข็งแรง 🌕';
  const launchX = 38.2 + Math.random() * 1.4;
  const launchZ = -12 + (Math.random() - 0.5) * 4;

  if (socket) {
    socket.emit('krathong:float', { type, wish, x: launchX, z: launchZ }, () => {
      dom.inputWish.value = '';
      dom.dialogFloatKrathong.close();
      showToast('ปล่อยกระทงลงสู่สระน้ำเรียบร้อยแล้ว 🪷');
    });
  }
});

// Release Sky Lantern Submit
dom.releaseLanternForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const picked = dom.releaseLanternForm.querySelector('input[name="lanternColor"]:checked');
  const color = picked ? picked.value : 'gold';
  const wish = dom.inputLanternWish.value.trim() || 'ขอให้ชีวิตสว่างไสวดุจโคมลอย 🏮';
  const self = state.players.get(state.selfId);
  const launchX = self
    ? THREE.MathUtils.clamp(self.currentPos.x + (Math.random() - 0.5) * 0.8, 16.5, 26.5)
    : LANTERN_PLAZA_CONFIG.x;
  const launchZ = self
    ? THREE.MathUtils.clamp(self.currentPos.z + (Math.random() - 0.5) * 0.8, -10.5, -1.5)
    : LANTERN_PLAZA_CONFIG.z;

  if (socket) {
    socket.emit('lantern:release', { color, wish, x: launchX, z: launchZ }, () => {
      dom.inputLanternWish.value = '';
      dom.dialogReleaseLantern.close();
      showToast('ปล่อยโคมลอยขึ้นสู่ท้องฟ้าเรียบร้อยแล้ว 🏮✨');
    });
  }
});

// Sala Buddha Blessing
function showRandomBlessing() {
  const b = BUDDHA_BLESSINGS[Math.floor(Math.random() * BUDDHA_BLESSINGS.length)];
  dom.buddhaBlessingText.textContent = `"${b}"`;
}
dom.btnPrayAgain.addEventListener('click', showRandomBlessing);

// Lobby Form Bindings
dom.optLowGfx.checked = state.lowGraphics;

dom.lobbyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nick = dom.inputNickname.value.trim();
  if (!nick) {
    dom.inputNickname.focus();
    return;
  }
  state.nickname = nick;
  state.selectedRoomId = dom.selectRoom ? dom.selectRoom.value : 'auto';
  applyGraphicsMode(dom.optLowGfx.checked);

  await initConcertAudio();
  if (dom.optMic.checked) {
    await requestMicrophoneAccess(true);
  }

  connectSocketAndJoin();
});

// HUD Buttons
dom.btnInteract.addEventListener('click', () => {
  if (state.activeZone) openZoneDialog(state.activeZone);
});

dom.minimapToggle.addEventListener('click', () => {
  state.minimapExpanded = !state.minimapExpanded;
  dom.minimapToggle.classList.toggle('expanded', state.minimapExpanded);
  dom.minimapToggle.setAttribute('aria-expanded', String(state.minimapExpanded));
  dom.minimapZoomHint.textContent = state.minimapExpanded ? 'แตะย่อ' : 'แตะขยาย';
});

dom.btnMusicToggle.addEventListener('click', async () => {
  await initConcertAudio();
  state.musicEnabled = !state.musicEnabled;
  dom.btnMusicToggle.setAttribute('aria-pressed', String(state.musicEnabled));
  const lbl = dom.btnMusicToggle.querySelector('.btn-label');
  if (lbl) lbl.textContent = state.musicEnabled ? 'เพลง: เปิด' : 'เพลง: ปิด';
});

dom.btnGfxToggle.addEventListener('click', () => {
  applyGraphicsMode(!state.lowGraphics);
});

dom.btnMicSetup.addEventListener('click', async () => {
  const ok = await requestMicrophoneAccess(false);
  if (ok) showToast('ไมโครโฟนพร้อมใช้งาน กดปุ่ม V หรือแตะปุ่มไมค์ค้างไว้เพื่อพูด');
});

dom.btnChatToggle.addEventListener('click', () => {
  const collapsed = dom.chatBody.classList.toggle('collapsed');
  dom.btnChatToggle.setAttribute('aria-expanded', String(!collapsed));
  dom.btnChatToggle.textContent = collapsed ? '▴' : '▾';
});

dom.chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = dom.chatInput.value.trim();
  if (!text || !socket) return;
  socket.emit('chat:send', { text });
  dom.chatInput.value = '';
});

// Wave Greeting (H key or button)
let lastWaveAt = 0;
function triggerSelfWave() {
  if (!state.joined) return;
  const now = performance.now();
  if (now - lastWaveAt < 900) return;
  lastWaveAt = now;

  const self = state.players.get(state.selfId);
  if (self && self.triggerWave) {
    self.triggerWave();
  }
  dom.btnWave.classList.add('waving');
  setTimeout(() => dom.btnWave.classList.remove('waving'), 600);
  if (socket) {
    socket.emit('player:wave');
  }
}

dom.btnWave.addEventListener('click', triggerSelfWave);

// Push-to-Talk Touch & Pointer Button
dom.btnPtt.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  setPushToTalk(true);
});
dom.btnPtt.addEventListener('pointerup', () => setPushToTalk(false));
dom.btnPtt.addEventListener('pointercancel', () => setPushToTalk(false));
dom.btnPtt.addEventListener('pointerleave', () => {
  if (state.isSpeaking) setPushToTalk(false);
});

// Keyboard Controls (PC)
window.addEventListener('keydown', (e) => {
  if (isTypingOrModalOpen()) return;
  const code = e.code;
  state.keys.add(code);

  if (code === 'KeyE' && state.activeZone) {
    e.preventDefault();
    openZoneDialog(state.activeZone);
  }
  if (code === 'KeyH' && !e.repeat) {
    triggerSelfWave();
  }
  if (code === 'KeyV' && !e.repeat) {
    setPushToTalk(true);
  }
});

window.addEventListener('keyup', (e) => {
  state.keys.delete(e.code);
  if (e.code === 'KeyV') {
    setPushToTalk(false);
  }
});

// Camera Drag Orbit, Mobile Pinch-to-Zoom & Wheel Zoom on World Canvas
let camDragging = false;
let camPointerId = null;
let camLastX = 0;
let camLastY = 0;
const activeCanvasPointers = new Map();
let lastPinchDist = null;

dom.worldCanvas.addEventListener('pointerdown', (e) => {
  if (!state.joined) return;
  activeCanvasPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (activeCanvasPointers.size === 2) {
    const pts = Array.from(activeCanvasPointers.values());
    lastPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    camDragging = false;
    camPointerId = null;
    return;
  }

  if (camPointerId !== null) return;
  camDragging = true;
  camPointerId = e.pointerId;
  camLastX = e.clientX;
  camLastY = e.clientY;
});

window.addEventListener('pointermove', (e) => {
  if (activeCanvasPointers.has(e.pointerId)) {
    activeCanvasPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  }
  if (activeCanvasPointers.size === 2 && lastPinchDist !== null) {
    const pts = Array.from(activeCanvasPointers.values());
    const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    const delta = lastPinchDist - dist;
    lastPinchDist = dist;
    state.cameraOrbit.distance = THREE.MathUtils.clamp(
      state.cameraOrbit.distance + delta * 0.025,
      4.0,
      16.0
    );
    return;
  }

  if (!camDragging || e.pointerId !== camPointerId) return;
  const dx = e.clientX - camLastX;
  const dy = e.clientY - camLastY;
  camLastX = e.clientX;
  camLastY = e.clientY;
  state.cameraOrbit.yaw -= dx * 0.0065;
  state.cameraOrbit.pitch = THREE.MathUtils.clamp(
    state.cameraOrbit.pitch + dy * 0.005,
    0.1,
    1.15
  );
});

function releaseCanvasPointer(e) {
  activeCanvasPointers.delete(e.pointerId);
  if (activeCanvasPointers.size < 2) {
    lastPinchDist = null;
  }
  if (e.pointerId === camPointerId) {
    camDragging = false;
    camPointerId = null;
  }
}
window.addEventListener('pointerup', releaseCanvasPointer);
window.addEventListener('pointercancel', releaseCanvasPointer);

dom.worldCanvas.addEventListener(
  'wheel',
  (e) => {
    if (!state.joined) return;
    e.preventDefault();
    state.cameraOrbit.distance = THREE.MathUtils.clamp(
      state.cameraOrbit.distance + e.deltaY * 0.006,
      4.0,
      16.0
    );
  },
  { passive: false }
);

// Mobile Virtual Joystick
let joyPointerId = null;
const JOY_MAX_R = 36;

function updateJoystickFromPointer(clientX, clientY) {
  const rect = dom.joystickZone.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let dx = clientX - cx;
  let dy = clientY - cy;
  const dist = Math.hypot(dx, dy);
  if (dist > JOY_MAX_R) {
    dx = (dx / dist) * JOY_MAX_R;
    dy = (dy / dist) * JOY_MAX_R;
  }
  dom.joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
  state.joystick.dx = dx / JOY_MAX_R;
  state.joystick.dy = dy / JOY_MAX_R;
}

dom.joystickZone.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  e.stopPropagation();
  joyPointerId = e.pointerId;
  state.joystick.active = true;
  dom.joystickZone.setPointerCapture(e.pointerId);
  updateJoystickFromPointer(e.clientX, e.clientY);
});

dom.joystickZone.addEventListener('pointermove', (e) => {
  if (!state.joystick.active || e.pointerId !== joyPointerId) return;
  updateJoystickFromPointer(e.clientX, e.clientY);
});

function resetJoystick(e) {
  if (e.pointerId !== joyPointerId) return;
  joyPointerId = null;
  state.joystick.active = false;
  state.joystick.dx = 0;
  state.joystick.dy = 0;
  dom.joystickKnob.style.transform = 'translate(0px, 0px)';
}
dom.joystickZone.addEventListener('pointerup', resetJoystick);
dom.joystickZone.addEventListener('pointercancel', resetJoystick);

dom.btnSprint.addEventListener('click', () => {
  state.sprintTouch = !state.sprintTouch;
  dom.btnSprint.setAttribute('aria-pressed', String(state.sprintTouch));
});

// ============================================================================
// 14. MAIN ANIMATION & SIMULATION LOOP
// ============================================================================

const clock = new THREE.Clock();
const dummyObj = new THREE.Object3D();
const tempVec = new THREE.Vector3();
const camTargetVec = new THREE.Vector3();
const camDesiredVec = new THREE.Vector3();
let lastNetSendAt = 0;
let lastMinimapAt = 0;
const lastNetSent = { x: NaN, z: NaN, rotY: NaN, isMoving: false, isRunning: false };

function updateLocalPlayer(dt) {
  const self = state.players.get(state.selfId);
  if (!self) return;

  let moveX = 0;
  let moveZ = 0;

  if (!isTypingOrModalOpen()) {
    if (state.keys.has('KeyW') || state.keys.has('ArrowUp')) moveZ -= 1;
    if (state.keys.has('KeyS') || state.keys.has('ArrowDown')) moveZ += 1;
    if (state.keys.has('KeyA') || state.keys.has('ArrowLeft')) moveX -= 1;
    if (state.keys.has('KeyD') || state.keys.has('ArrowRight')) moveX += 1;
  }

  if (state.joystick.active) {
    moveX += state.joystick.dx;
    moveZ += state.joystick.dy;
  }

  const inputLen = Math.hypot(moveX, moveZ);
  const isMoving = inputLen > 0.12;
  const isRunning =
    isMoving &&
    (state.keys.has('ShiftLeft') || state.keys.has('ShiftRight') || state.sprintTouch);

  if (isMoving) {
    const nx = moveX / Math.max(1, inputLen);
    const nz = moveZ / Math.max(1, inputLen);

    // Move relative to camera yaw
    const sinY = Math.sin(state.cameraOrbit.yaw);
    const cosY = Math.cos(state.cameraOrbit.yaw);
    const worldDirX = nx * cosY + nz * sinY;
    const worldDirZ = -nx * sinY + nz * cosY;

    const speed = isRunning ? 8.2 : 4.5;
    self.currentPos.x += worldDirX * speed * dt;
    self.currentPos.z += worldDirZ * speed * dt;

    resolvePlayerCollisions(self.currentPos, 0.48);

    // Character faces direction of travel (+Z local forward)
    const desiredRot = Math.atan2(worldDirX, worldDirZ);
    let diff = desiredRot - self.currentRotY;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    self.currentRotY += diff * Math.min(1, dt * 12);
  }

  self.isMoving = isMoving;
  self.isRunning = isRunning;
  self.group.position.copy(self.currentPos);
  self.group.rotation.y = self.currentRotY;

  // Third-person camera follow (reuses vectors to avoid per-frame GC churn)
  const { yaw, pitch, distance } = state.cameraOrbit;
  camTargetVec.set(
    self.currentPos.x,
    self.currentPos.y + Math.max(0.75, (self.headY || 1.45) * 0.72),
    self.currentPos.z
  );
  const camX = camTargetVec.x + Math.sin(yaw) * Math.cos(pitch) * distance;
  const camY = Math.max(0.9, camTargetVec.y + Math.sin(pitch) * distance);
  const camZ = camTargetVec.z + Math.cos(yaw) * Math.cos(pitch) * distance;

  camDesiredVec.set(camX, camY, camZ);
  camera.position.lerp(camDesiredVec, Math.min(1, dt * 14));
  camera.lookAt(camTargetVec);

  // Check nearby interactive zones
  let foundZone = null;
  let bestDist = Infinity;
  for (const z of INTERACT_ZONES) {
    const d = Math.hypot(self.currentPos.x - z.x, self.currentPos.z - z.z);
    if (d <= z.radius && d < bestDist) {
      bestDist = d;
      foundZone = z;
    }
  }
  state.activeZone = foundZone;
  if (foundZone) {
    dom.interactLabel.textContent = foundZone.label;
    dom.interactWrap.classList.remove('hidden');
  } else {
    dom.interactWrap.classList.add('hidden');
  }

  // Send delta movement update at 10 Hz ONLY when position, rotation, or motion state changed
  const now = performance.now();
  if (socket && now - lastNetSendAt > 100) {
    const nx = Number(self.currentPos.x.toFixed(2));
    const nz = Number(self.currentPos.z.toFixed(2));
    const nr = Number(self.currentRotY.toFixed(2));
    const changed =
      Math.abs(nx - lastNetSent.x) > 0.02 ||
      Math.abs(nz - lastNetSent.z) > 0.02 ||
      Math.abs(nr - lastNetSent.rotY) > 0.03 ||
      self.isMoving !== lastNetSent.isMoving ||
      self.isRunning !== lastNetSent.isRunning ||
      Number.isNaN(lastNetSent.x);

    if (changed) {
      lastNetSendAt = now;
      lastNetSent.x = nx;
      lastNetSent.z = nz;
      lastNetSent.rotY = nr;
      lastNetSent.isMoving = self.isMoving;
      lastNetSent.isRunning = self.isRunning;
      socket.emit('player:move', {
        x: nx,
        y: 0,
        z: nz,
        rotY: nr,
        isMoving: self.isMoving,
        isRunning: self.isRunning
      });
    }
  }

  updateSpatialConcertAudio(self.currentPos);
  updateProximityVoiceVolumes();
}

function updatePlayersAnimationAndLabels(dt, elapsed) {
  const nowPerf = performance.now();

  for (const [id, p] of state.players) {
    if (id !== state.selfId) {
      p.currentPos.lerp(p.targetPos, Math.min(1, dt * 12));
      let diff = p.targetRotY - p.currentRotY;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      p.currentRotY += diff * Math.min(1, dt * 12);
      p.group.position.copy(p.currentPos);
      p.group.rotation.y = p.currentRotY;
    }

    // Distance-culled AnimationMixer update (skip faraway remote avatars >42m for mobile FPS)
    const distToCam = p.currentPos.distanceTo(camera.position);
    if (p.updateAnim && (id === state.selfId || distToCam <= 42)) {
      p.updateAnim(dt, p.isMoving, p.isRunning);
    }

    // Chat bubble expiry
    if (p.chatExpireAt > 0 && nowPerf > p.chatExpireAt) {
      p.labelEls.bubble.classList.add('hidden');
      p.chatExpireAt = 0;
    }

    // Project 3D head label to screen (dynamically above tall/medium/chibi head)
    const labelOffset = (p.headY || 1.45) + 0.25;
    tempVec.set(p.currentPos.x, p.currentPos.y + labelOffset, p.currentPos.z);
    const dist = tempVec.distanceTo(camera.position);
    tempVec.project(camera);

    if (tempVec.z > 1 || dist > 48) {
      p.labelEls.wrap.style.display = 'none';
    } else {
      const sx = (tempVec.x * 0.5 + 0.5) * window.innerWidth;
      const sy = (-tempVec.y * 0.5 + 0.5) * window.innerHeight;
      p.labelEls.wrap.style.display = 'flex';
      p.labelEls.wrap.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -100%)`;
    }
  }

  // Update floating krathongs on pond (X: 37.8..54.2, Z: -26.2..+2.2)
  for (const [, item] of state.krathongs) {
    const k = item.data;
    const age = (Date.now() - k.createdAt) / 1000;
    const px = 38 + ((k.x - 38 + age * k.driftVx) % 15.5);
    const pz = -12 + Math.sin(age * 0.18 + k.z) * 11.5;
    const bob = Math.sin(elapsed * 2.1 + k.x) * 0.03;

    item.mesh.position.set(px, 0.08 + bob, pz);
    item.mesh.rotation.y = elapsed * 0.25;

    tempVec.set(px, 0.65 + bob, pz);
    const dist = tempVec.distanceTo(camera.position);
    tempVec.project(camera);
    if (tempVec.z > 1 || dist > 36) {
      item.labelEl.style.display = 'none';
    } else {
      const sx = (tempVec.x * 0.5 + 0.5) * window.innerWidth;
      const sy = (-tempVec.y * 0.5 + 0.5) * window.innerHeight;
      item.labelEl.style.display = 'flex';
      item.labelEl.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -100%)`;
    }
  }

  // Update player-released interactive sky lanterns rising into the night sky
  const nowMs = Date.now();
  for (const [id, item] of state.releasedLanterns) {
    const l = item.data;
    const ageMs = nowMs - l.createdAt;
    if (ageMs >= LANTERN_PLAZA_CONFIG.lifetimeMs) {
      scene.remove(item.mesh);
      item.labelEl.remove();
      state.releasedLanterns.delete(id);
      continue;
    }

    const ageSec = Math.max(0, ageMs / 1000);
    const py = 1.15 + ageSec * (l.riseSpeed || 0.82);
    const swayX = Math.sin(elapsed * 0.7 + l.x) * 0.55;
    const swayZ = Math.cos(elapsed * 0.6 + l.z) * 0.55;
    const px = l.x + ageSec * (l.driftVx || 0) + swayX;
    const pz = l.z + ageSec * (l.driftVz || 0) + swayZ;

    item.mesh.position.set(px, py, pz);
    item.mesh.rotation.y = elapsed * 0.25 + l.x;
    item.mesh.rotation.z = Math.sin(elapsed * 1.1 + l.z) * 0.05;

    // Gentle fade-out during the final 10 seconds
    const remaining = (LANTERN_PLAZA_CONFIG.lifetimeMs - ageMs) / 1000;
    if (remaining < 10 && item.mesh.userData.bodyMat) {
      item.mesh.userData.bodyMat.opacity = Math.max(0.05, (remaining / 10) * 0.94);
    }
    if (item.mesh.userData.flame) {
      const fPulse = 1 + Math.sin(elapsed * 9 + l.x) * 0.14;
      item.mesh.userData.flame.scale.set(0.85 * fPulse, 1.35 * fPulse, 0.85 * fPulse);
    }

    tempVec.set(px, py + 1.25, pz);
    const dist = tempVec.distanceTo(camera.position);
    tempVec.project(camera);
    if (tempVec.z > 1 || dist > 48 || remaining < 4) {
      item.labelEl.style.display = 'none';
    } else {
      const sx = (tempVec.x * 0.5 + 0.5) * window.innerWidth;
      const sy = (-tempVec.y * 0.5 + 0.5) * window.innerHeight;
      item.labelEl.style.display = 'flex';
      item.labelEl.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -100%)`;
    }
  }
}

let frameCounter = 0;
let fpsFrames = 0;
let fpsLastSampleAt = performance.now();
let measuredFps = 0;

function updateAtmosphere(dt, elapsed) {
  // Distance-culled GLB AnimationMixers (skip concert_stage/krathong_tables updates when far away)
  for (const entry of mixers) {
    if (camera.position.distanceTo(entry.pos) <= entry.maxDist) {
      entry.mixer.update(dt);
    }
  }

  const runHeavyAtmosphere = !state.lowGraphics || frameCounter % 2 === 0;
  const effDt = state.lowGraphics ? dt * 2 : dt;

  // Sky lanterns drift upward
  if (skyRefs.lanterns && runHeavyAtmosphere) {
    const activeCount = skyRefs.lanterns.count;
    for (let i = 0; i < activeCount; i++) {
      const m = skyRefs.lanternMeta[i];
      m.y += m.speed * effDt;
      if (m.y > 68) {
        m.y = 10;
      }
      const swayX = Math.sin(elapsed * 0.55 + m.swayPhase) * 0.9;
      const swayZ = Math.cos(elapsed * 0.45 + m.swayPhase) * 0.9;
      dummyObj.position.set(m.x + swayX, m.y, m.z + swayZ);
      dummyObj.rotation.set(0, elapsed * 0.2 + m.swayPhase, 0);
      dummyObj.scale.setScalar(m.scale);
      dummyObj.updateMatrix();
      skyRefs.lanterns.setMatrixAt(i, dummyObj.matrix);
    }
    skyRefs.lanterns.instanceMatrix.needsUpdate = true;
  }

  // Pond water shimmer
  if (skyRefs.pondWaterMat && !state.lowGraphics) {
    skyRefs.pondWaterMat.emissiveIntensity = 0.4 + Math.sin(elapsed * 1.4) * 0.08;
  }

  // Garden hanging lanterns & fireflies + central lantern plaza animations
  if (gardenState && runHeavyAtmosphere) {
    updateTempleGardens(gardenState, effDt, elapsed);
  }
  if (lanternPlazaState && runHeavyAtmosphere) {
    updateLanternPlaza(lanternPlazaState, effDt, elapsed);
  }
  if (frontRoadState && frontRoadState.root.visible) {
    updateFrontRoad(frontRoadState, dt);
  }
  updateMobileZoneCulling();
}

function animate() {
  requestAnimationFrame(animate);
  frameCounter++;
  fpsFrames++;
  const dt = Math.min(0.05, clock.getDelta());
  const elapsed = clock.elapsedTime;

  if (!state.joined) {
    // Gentle lobby preview turntable + Idle/Wave animation + background world preview
    if (previewAvatar) {
      if (!previewDragging) {
        previewYaw += dt * 0.55;
        previewAvatar.root.rotation.y = previewYaw;
      }
      previewAvatar.update(dt, false, false);
    }
    previewRenderer.render(previewScene, previewCamera);
    camera.position.set(
      Math.sin(elapsed * 0.12) * 14,
      11,
      58 + Math.cos(elapsed * 0.12) * 8
    );
    camera.lookAt(0, 2, 10);
  } else {
    updateLocalPlayer(dt);
    updatePlayersAnimationAndLabels(dt, elapsed);
    const nowMs = performance.now();
    if (nowMs - lastMinimapAt >= 120) {
      lastMinimapAt = nowMs;
      drawMinimap();
    }
  }

  updateAtmosphere(dt, elapsed);
  renderer.render(scene, camera);

  const nowFps = performance.now();
  if (nowFps - fpsLastSampleAt >= 1000) {
    measuredFps = Math.round((fpsFrames * 1000) / (nowFps - fpsLastSampleAt));
    fpsFrames = 0;
    fpsLastSampleAt = nowFps;
    const stats = {
      fps: measuredFps,
      calls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      geometries: renderer.info.memory.geometries,
      lowGraphics: state.lowGraphics
    };
    window.__RENDER_STATS__ = stats;
    document.body.dataset.renderStats = JSON.stringify(stats);
    if (dom.btnGfxToggle) {
      const lbl = dom.btnGfxToggle.querySelector('.btn-label');
      if (lbl) {
        lbl.textContent = `${state.lowGraphics ? 'ประหยัด' : 'ปกติ'} (${measuredFps} FPS)`;
      }
    }
  }
}

// ============================================================================
// 15. INITIALIZATION & RESIZE HANDLER
// ============================================================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  resizePreviewCanvas();
});

async function bootstrap() {
  applyGraphicsMode(state.lowGraphics);
  buildSkyAtmosphere();
  buildGroundAndRoads();
  buildCornerArchAndStringLights();
  buildMotorcycleParking();
  buildVendorStalls();
  buildSpecialZones();
  gardenState = buildTempleGardens(scene, addCollisionBox, state.lowGraphics);
  lanternPlazaState = buildLanternPlaza(scene, addCollisionBox, state.lowGraphics);
  // Batch static stone/bamboo/pillar geometry inside lantern plaza (~90 -> ~12 draw calls)
  mergeStaticMeshesByMaterial(
    lanternPlazaState.root,
    [],
    false,
    [
      ...lanternPlazaState.swayingLanterns.map((s) => s.pivot),
      lanternPlazaState.brazierFlame
    ]
  );
  frontRoadState = buildFrontRoad(scene, state.lowGraphics);
  setupWorldCollisions();

  // Start rendering loop right away
  animate();

  // Load all 7 GLB models with progress bar & wireframe fallback
  await loadAllModels();

  // Transition from loading screen to Lobby overlay
  dom.loadingScreen.classList.add('hidden');
  dom.lobbyOverlay.classList.remove('hidden');
  resizePreviewCanvas();
  renderAvatarCards();
  refreshPreviewAvatar();
  fetchRoomsStatus();
}

bootstrap();
