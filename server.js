const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;
const REGISTRATIONS_PATH = path.join(__dirname, 'registrations.json');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  perMessageDeflate: false,
  httpCompression: false,
  pingInterval: 25000,
  pingTimeout: 20000
});

// Gzip/Deflate compression + CORS for Cloudflare Pages <-> Render hybrid split
app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Long cache for immutable 3D models & vendor bundles; fast revalidation for app code
app.use(
  '/models',
  express.static(path.join(__dirname, 'public', 'models'), {
    maxAge: '7d',
    etag: true
  })
);
app.use(
  '/vendor',
  express.static(path.join(__dirname, 'public', 'vendor'), {
    maxAge: '7d',
    etag: true
  })
);
app.use(
  '/audio',
  express.static(path.join(__dirname, 'public', 'audio'), {
    maxAge: '1d',
    etag: true
  })
);
app.use(
  '/audio-festival',
  express.static(path.join(__dirname, 'public', 'audio-festival'), {
    maxAge: '1d',
    etag: true
  })
);
// Never cache index.html or config.js so mobile/PC browsers always load the latest version
app.use((req, res, next) => {
  if (req.path === '/' || req.path.endsWith('.html') || req.path === '/config.js') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use('/vendor/three', express.static(path.join(__dirname, 'node_modules/three')));

// Load or initialize registrations.json
let registrations = [];
try {
  if (fs.existsSync(REGISTRATIONS_PATH)) {
    const raw = fs.readFileSync(REGISTRATIONS_PATH, 'utf8').trim();
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        registrations = parsed;
      }
    }
  } else {
    fs.writeFileSync(REGISTRATIONS_PATH, '[]', 'utf8');
  }
} catch (err) {
  console.error('Failed to read registrations.json, starting with empty list:', err.message);
  registrations = [];
}

let writeQueue = Promise.resolve();
function saveRegistration(entry) {
  registrations.push(entry);
  // Keep file bounded so free-tier disk stays tidy during large events
  if (registrations.length > 5000) {
    registrations = registrations.slice(-5000);
  }
  const payload = JSON.stringify(registrations, null, 2);
  writeQueue = writeQueue
    .then(() => fs.promises.writeFile(REGISTRATIONS_PATH, payload, 'utf8'))
    .catch((err) => {
      console.error('Error writing registrations.json:', err);
    });
  return writeQueue;
}

function sanitizeText(value, maxLen = 120) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLen);
}

const VALID_AVATAR_IDS = new Set([
  'Avatar_BoyCargo',
  'Avatar_BoySport',
  'Avatar_ManShirt',
  'Avatar_GirlPink',
  'Avatar_GirlBeret',
  'Avatar_WomanBoots',
  'Avatar_ChibiBoyRed',
  'Avatar_ChibiManSuit',
  'Avatar_ChibiGirlBun',
  'Avatar_ChibiGirlTwintails'
]);

function sanitizeAvatar(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const avatarId = VALID_AVATAR_IDS.has(src.avatarId) ? src.avatarId : 'Avatar_BoyCargo';
  return { avatarId };
}

function clampFinite(val, min, max, fallback) {
  const num = Number(val);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

// ============================================================================
// MULTI-ROOM SCALING STATE (4 Rooms x 50 Players = 200 Concurrent Players)
// ============================================================================

const MAX_PLAYERS_PER_ROOM = 50;
const MAX_KRATHONGS = 60;
const MAX_RELEASED_LANTERNS = 40;
const LANTERN_LIFETIME_MS = 90000;
const MAX_RECENT_CHATS = 30;
const VALID_KRATHONG_TYPES = new Set(['banana', 'lotus', 'bread']);
const VALID_PROP_TYPES = new Set(['meatball', 'cotton_candy', 'drink', 'glowstick', 'balloon', 'teddy']);
const EDIBLE_PROP_TYPES = new Set(['meatball', 'cotton_candy', 'drink']);
const VALID_LANTERN_COLORS = new Set(['gold', 'pink', 'white']);
const VALID_EMOTES = new Set(['wave', 'ramwong', 'cheer', 'wai']);
const VALID_CONTEST_ENTRIES = new Set(['banana', 'lotus', 'bread']);
const BALLOON_GAME_PRICE = 5;
const FESTIVAL_TIPS = [
  '💡 รู้ไหม? คลิกที่ตัวเพื่อนหรือป้ายชื่อเพื่อน เพื่อส่งหัวใจ ❤️ หรือมอบเหรียญ 💰 ให้กันได้นะ!',
  '💡 เหรียญหมดไม่ต้องห่วง! เดินลงไปว่ายน้ำเก็บเหรียญทองในสระลอยกระทงได้เลย 🏊',
  '💡 แวะไปเล่นซุ้มปาโป่งชิงรางวัล 🎈 (ฝั่งซ้ายถนนทางเข้า) ปาแตก 7 ลูกรับ +15 เหรียญ และตุ๊กตาหมีงานวัด 🧸!',
  '💡 ลองขึ้นบันไดหลังเวทีคอนเสิร์ตไปเต้นรำวง 💃 หรือโยกเชียร์ 🕺 กับเพื่อน ๆ หน้าเวทีได้เลย!',
  '💡 แวะโหวตกระทงสวยประจำงานได้ที่แท่นพรมแดงประกวดกระทง 🪷 และกดดูอันดับขวัญใจงานวัดได้ที่ปุ่ม 👑 อันดับ!',
  '💡 เสี่ยงเซียมซีที่ศาลาพระพุทธรูป 🎋 ถ้าได้ดวง "ดีมาก" รับโบนัสพิเศษ +5 เหรียญทันที!',
  '💡 คำเตือน! อย่าเผลอเดินลึกเข้าไปในป่าช้าหลังโบสถ์ยามวิกาล 👻 (ถ้าเจอดีให้รีบวิ่งเข้าเขตพระอุโบสถ!)'
];
const FIREWORK_STYLE_NAMES = {
  gold: '🌕 พลุทองมงคล',
  rainbow: '🌈 พลุสายรุ้ง',
  heart: '💖 พลุสีชมพู-หัวใจ',
  finale: '🎆 พลุชุดใหญ่ 5 นัด'
};
const FIREWORK_PRICES = { gold: 10, rainbow: 10, heart: 10, finale: 15 };
const STARTING_COINS = 20;
const PROP_PRICE = 5;
const LANTERN_PRICE = 5;
const MAX_POND_COINS = 16;
const TARGET_POND_COINS = 12;

function createRandomPondCoin(x = null, z = null, forcedValue = null) {
  const cx = x !== null ? clampFinite(x, 38.2, 54.0, 44) : Number((38.4 + Math.random() * 15.2).toFixed(2));
  const cz = z !== null ? clampFinite(z, -25.8, 2.0, -12) : Number((-25.6 + Math.random() * 27.2).toFixed(2));
  let val = forcedValue;
  if (!val) {
    const roll = Math.random();
    val = roll < 0.14 ? 5 : roll < 0.52 ? 2 : 1;
  }
  return {
    id: `coin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    x: cx,
    z: cz,
    value: val
  };
}
const AUDIO_DIR = path.join(__dirname, 'public', 'audio');
const FESTIVAL_AUDIO_DIR = path.join(__dirname, 'public', 'audio-festival');
const AUDIO_EXT_RE = /\.(mp3|ogg|m4a|wav)$/i;

function listAudioTracksInDir(dirPath, urlPrefix) {
  try {
    if (!fs.existsSync(dirPath)) return [];
    const files = fs
      .readdirSync(dirPath)
      .filter((name) => AUDIO_EXT_RE.test(name))
      .sort((a, b) => a.localeCompare(b, 'th'));
    return files.map((filename) => {
      const base = filename.replace(AUDIO_EXT_RE, '').replace(/_+/g, ' ').replace(/\s+/g, ' ').trim();
      return {
        id: filename,
        filename,
        title: base || filename,
        url: `${urlPrefix}/${encodeURIComponent(filename)}`
      };
    });
  } catch {
    return [];
  }
}

function listStageAudioTracks() {
  return listAudioTracksInDir(AUDIO_DIR, '/audio');
}

function listFestivalAudioTracks() {
  return listAudioTracksInDir(FESTIVAL_AUDIO_DIR, '/audio-festival');
}

function createInitialStageTrack() {
  const tracks = listStageAudioTracks();
  if (tracks.length === 0) return null;
  const t = tracks[0];
  return {
    index: 0,
    filename: t.filename,
    title: t.title,
    url: t.url,
    changedBy: 'เวทีคอนเสิร์ต',
    startedAt: Date.now()
  };
}

const ROOM_DEFS = [
  { id: 'room-1', name: 'ลานงาน 1' },
  { id: 'room-2', name: 'ลานงาน 2' },
  { id: 'room-3', name: 'ลานงาน 3' },
  { id: 'room-4', name: 'ลานงาน 4' }
];

const rooms = new Map();
for (const def of ROOM_DEFS) {
  const initialCoins = [];
  for (let i = 0; i < TARGET_POND_COINS; i++) {
    initialCoins.push(createRandomPondCoin());
  }
  rooms.set(def.id, {
    id: def.id,
    name: def.name,
    players: new Map(),
    dirtyMoves: new Map(),
    floatedKrathongs: [],
    releasedLanterns: [],
    pondCoins: initialCoins,
    contestVotes: new Map(),
    tipIndex: 0,
    recentChats: [],
    stageTrack: createInitialStageTrack()
  });
}

function getContestSummary(room) {
  const counts = { banana: 0, lotus: 0, bread: 0 };
  if (room?.contestVotes) {
    for (const entry of room.contestVotes.values()) {
      if (Object.prototype.hasOwnProperty.call(counts, entry)) {
        counts[entry]++;
      }
    }
  }
  const total = counts.banana + counts.lotus + counts.bread;
  return { counts, total };
}

function getRoomLeaderboard(room) {
  const list = Array.from(room.players.values()).map((p) => ({
    id: p.id,
    nickname: p.nickname,
    hearts: p.hearts || 0,
    coins: p.coins || 0
  }));
  const topHearts = [...list]
    .sort((a, b) => b.hearts - a.hearts || b.coins - a.coins)
    .slice(0, 3);
  const topCoins = [...list]
    .sort((a, b) => b.coins - a.coins || b.hearts - a.hearts)
    .slice(0, 3);
  return { topHearts, topCoins };
}

function getRoomForSocket(socket) {
  const roomId = socket?.data?.roomId;
  return roomId ? rooms.get(roomId) || null : null;
}

function chooseRoom(requestedId) {
  if (requestedId && requestedId !== 'auto' && rooms.has(requestedId)) {
    const target = rooms.get(requestedId);
    if (target.players.size < MAX_PLAYERS_PER_ROOM) {
      return target;
    }
  }
  // Auto-assign to first available room below cap
  for (const room of rooms.values()) {
    if (room.players.size < MAX_PLAYERS_PER_ROOM) {
      return room;
    }
  }
  // Overflow fallback: pick least-crowded room so nobody is ever blocked
  let best = rooms.get('room-1');
  for (const room of rooms.values()) {
    if (room.players.size < best.players.size) {
      best = room;
    }
  }
  return best;
}

function pruneExpiredLanterns(room) {
  const cutoff = Date.now() - LANTERN_LIFETIME_MS;
  while (room.releasedLanterns.length > 0 && room.releasedLanterns[0].createdAt < cutoff) {
    room.releasedLanterns.shift();
  }
}

function pushChat(room, msg) {
  room.recentChats.push(msg);
  if (room.recentChats.length > MAX_RECENT_CHATS) {
    room.recentChats.shift();
  }
  io.to(room.id).emit('chat:message', msg);
}

function getRoomsSummary() {
  return Array.from(rooms.values()).map((r) => ({
    id: r.id,
    name: r.name,
    count: r.players.size,
    max: MAX_PLAYERS_PER_ROOM
  }));
}

function getTotalOnlinePlayers() {
  let sum = 0;
  for (const r of rooms.values()) sum += r.players.size;
  return sum;
}

// ============================================================================
// HTTP API ENDPOINTS
// ============================================================================

app.get('/api/audio-check', (_req, res) => {
  const mp3Path = path.join(AUDIO_DIR, 'concert.mp3');
  res.json({ exists: fs.existsSync(mp3Path) });
});

app.get('/api/stage-tracks', (_req, res) => {
  res.json({ ok: true, tracks: listStageAudioTracks() });
});

app.get('/api/festival-tracks', (_req, res) => {
  res.json({ ok: true, tracks: listFestivalAudioTracks() });
});

app.get('/api/rooms', (_req, res) => {
  res.json({
    ok: true,
    totalOnline: getTotalOnlinePlayers(),
    rooms: getRoomsSummary()
  });
});

app.get('/api/health', (_req, res) => {
  let activeKrathongs = 0;
  let activeLanterns = 0;
  for (const room of rooms.values()) {
    pruneExpiredLanterns(room);
    activeKrathongs += room.floatedKrathongs.length;
    activeLanterns += room.releasedLanterns.length;
  }
  res.json({
    ok: true,
    onlinePlayers: getTotalOnlinePlayers(),
    rooms: getRoomsSummary(),
    totalRegistrations: registrations.length,
    activeKrathongs,
    activeLanterns
  });
});

// ============================================================================
// ~8.3 HZ (120ms) BATCHED MOVEMENT TICK PER ROOM (Smooth & low CPU for 50/room)
// ============================================================================

setInterval(() => {
  for (const room of rooms.values()) {
    if (room.dirtyMoves.size === 0) continue;
    const updates = Array.from(room.dirtyMoves.values());
    room.dirtyMoves.clear();
    io.to(room.id).emit('players:batch', updates);
  }
}, 120);

// Auto-replenish pond coins every 6 seconds so swimmers always have coins to collect
setInterval(() => {
  for (const room of rooms.values()) {
    if (room.players.size === 0) continue;
    if (room.pondCoins.length < TARGET_POND_COINS) {
      const coin = createRandomPondCoin();
      room.pondCoins.push(coin);
      io.to(room.id).emit('coin:spawned', coin);
    }
  }
}, 6000);

// Broadcast rotating helpful festival tips to active rooms every 75 seconds
setInterval(() => {
  for (const room of rooms.values()) {
    if (room.players.size === 0) continue;
    const tip = FESTIVAL_TIPS[room.tipIndex % FESTIVAL_TIPS.length];
    room.tipIndex++;
    pushChat(room, {
      id: `tip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderId: 'system',
      senderName: 'เคล็ดลับงานวัด',
      text: tip,
      type: 'system',
      timestamp: Date.now()
    });
  }
}, 75000);

// ============================================================================
// SOCKET.IO MULTIPLAYER HANDLERS
// ============================================================================

io.on('connection', (socket) => {
  socket.on('player:join', (payload, ack) => {
    // Clean up if re-joining on an existing socket
    const prevRoom = getRoomForSocket(socket);
    if (prevRoom && prevRoom.players.has(socket.id)) {
      prevRoom.players.delete(socket.id);
      prevRoom.dirtyMoves.delete(socket.id);
      socket.leave(prevRoom.id);
      socket.to(prevRoom.id).emit('player:left', { id: socket.id });
    }

    const room = chooseRoom(payload?.roomId);
    const nickname = sanitizeText(payload?.nickname, 24) || `นักท่องเที่ยว-${socket.id.slice(0, 4)}`;
    const avatar = sanitizeAvatar(payload?.avatar);
    const lowGraphics = Boolean(payload?.lowGraphics);

    const registrationRecord = {
      id: socket.id,
      nickname,
      roomId: room.id,
      avatar,
      lowGraphics,
      registeredAt: new Date().toISOString()
    };
    saveRegistration(registrationRecord);

    // Spawn safely on the front temple forecourt (between gate at z=54 and highway curb at z=60.5)
    const offsetX = (Math.random() - 0.5) * 3.0;
    const playerState = {
      id: socket.id,
      nickname,
      avatar,
      x: Number(offsetX.toFixed(2)),
      y: 0,
      z: 59,
      rotY: Math.PI,
      isMoving: false,
      isRunning: false,
      isSwimming: false,
      heldKrathong: null,
      heldProp: null,
      propBites: 3,
      seatedChairId: null,
      coins: STARTING_COINS,
      hearts: 0,
      headAccessory: null,
      activeEmote: null,
      balloonSession: null,
      lastHeartSentAt: 0,
      lastEsiimsiBonusAt: 0,
      isSpeaking: false
    };

    socket.data.roomId = room.id;
    socket.join(room.id);
    room.players.set(socket.id, playerState);

    if (typeof ack === 'function') {
      ack({
        ok: true,
        selfId: socket.id,
        roomId: room.id,
        roomName: room.name,
        roomMax: MAX_PLAYERS_PER_ROOM,
        coins: playerState.coins
      });
    }

    pruneExpiredLanterns(room);
    const stageTracks = listStageAudioTracks();
    const festivalTracks = listFestivalAudioTracks();
    if (!room.stageTrack && stageTracks.length > 0) {
      room.stageTrack = createInitialStageTrack();
    }
    socket.emit('world:init', {
      selfId: socket.id,
      roomId: room.id,
      roomName: room.name,
      roomMax: MAX_PLAYERS_PER_ROOM,
      coins: playerState.coins,
      players: Array.from(room.players.values()),
      krathongs: room.floatedKrathongs,
      lanterns: room.releasedLanterns,
      pondCoins: room.pondCoins,
      contestSummary: getContestSummary(room),
      recentChats: room.recentChats,
      stageTracks,
      stageTrack: room.stageTrack,
      festivalTracks
    });

    socket.to(room.id).emit('player:joined', playerState);

    pushChat(room, {
      id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: 'system',
      senderName: 'ระบบงานวัด',
      text: `${nickname} เดินทางเข้าสู่${room.name} 🏮`,
      type: 'system',
      timestamp: Date.now()
    });
  });

  socket.on('player:move', (payload) => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    if (!player || !payload || typeof payload !== 'object') return;

    player.x = clampFinite(payload.x, -48, 60, player.x);
    player.y = clampFinite(payload.y, -2, 10, 0);
    player.z = clampFinite(payload.z, -64, 60.2, player.z);
    player.rotY = clampFinite(payload.rotY, -Math.PI * 4, Math.PI * 4, player.rotY);
    player.isMoving = Boolean(payload.isMoving);
    player.isRunning = Boolean(payload.isRunning);
    player.isSwimming = Boolean(payload.isSwimming);
    if (player.isMoving && player.seatedChairId) {
      player.seatedChairId = null;
      socket.to(room.id).emit('player:sat', { id: socket.id, chairId: null });
    }

    // Queue for next 10 Hz batched broadcast instead of immediate O(N^2) emit
    room.dirtyMoves.set(socket.id, {
      id: socket.id,
      x: player.x,
      y: player.y,
      z: player.z,
      rotY: player.rotY,
      isMoving: player.isMoving,
      isRunning: player.isRunning,
      isSwimming: player.isSwimming
    });
  });

  socket.on('player:krathong', (payload) => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    if (!player) return;

    const nextType = VALID_KRATHONG_TYPES.has(payload?.type) ? payload.type : null;
    player.heldKrathong = nextType;

    io.to(room.id).emit('player:krathongUpdated', {
      id: socket.id,
      heldKrathong: nextType
    });
  });

  socket.on('player:prop', (payload, ack) => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    if (!player) return;

    const nextProp = VALID_PROP_TYPES.has(payload?.type) ? payload.type : null;
    if (nextProp) {
      if ((player.coins || 0) < PROP_PRICE) {
        if (typeof ack === 'function') {
          ack({ ok: false, error: 'NOT_ENOUGH_COINS', required: PROP_PRICE, coins: player.coins || 0 });
        }
        return;
      }
      player.coins = (player.coins || 0) - PROP_PRICE;
      socket.emit('coins:updated', { coins: player.coins });
    }

    player.heldProp = nextProp;
    player.propBites = nextProp && EDIBLE_PROP_TYPES.has(nextProp) ? 3 : 0;

    io.to(room.id).emit('player:propUpdated', {
      id: socket.id,
      heldProp: nextProp,
      propBites: player.propBites
    });
    if (typeof ack === 'function') {
      ack({ ok: true, coins: player.coins, heldProp: nextProp });
    }
  });

  socket.on('player:eat', () => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    if (!player || !EDIBLE_PROP_TYPES.has(player.heldProp)) return;

    const propType = player.heldProp;
    const nextBites = Math.max(0, (player.propBites || 3) - 1);
    player.propBites = nextBites;
    if (nextBites <= 0) {
      player.heldProp = null;
    }

    io.to(room.id).emit('player:ate', {
      id: socket.id,
      propType,
      bitesLeft: nextBites
    });
  });

  socket.on('player:sit', (payload, ack) => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    if (!player) return;

    const chairId = typeof payload?.chairId === 'string' && payload.chairId.startsWith('chair-')
      ? payload.chairId.slice(0, 28)
      : null;

    if (chairId) {
      for (const [otherId, other] of room.players) {
        if (otherId !== socket.id && other.seatedChairId === chairId) {
          if (typeof ack === 'function') ack({ ok: false, error: 'OCCUPIED' });
          return;
        }
      }
      player.seatedChairId = chairId;
      player.x = clampFinite(payload?.x, -40, 0, player.x);
      player.z = clampFinite(payload?.z, -40, -15, player.z);
      player.rotY = clampFinite(payload?.rotY, -Math.PI * 4, Math.PI * 4, Math.PI);
      player.isMoving = false;
      player.isRunning = false;
    } else {
      player.seatedChairId = null;
    }

    io.to(room.id).emit('player:sat', {
      id: socket.id,
      chairId: player.seatedChairId,
      x: player.x,
      z: player.z,
      rotY: player.rotY
    });
    if (typeof ack === 'function') ack({ ok: true, chairId: player.seatedChairId });
  });

  socket.on('krathong:float', (payload, ack) => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    if (!player) return;

    // Require player to hold a krathong picked from the shop before floating
    if (!VALID_KRATHONG_TYPES.has(player.heldKrathong)) {
      if (typeof ack === 'function') {
        ack({ ok: false, error: 'NO_KRATHONG' });
      }
      return;
    }

    const requestedType = player.heldKrathong;
    const wish = sanitizeText(payload?.wish, 120) || 'ขอให้มีความสุข สุขภาพแข็งแรง 🌕';

    const launchX = clampFinite(payload?.x, 37.8, 42.5, 38.4 + Math.random() * 1.4);
    const launchZ = clampFinite(payload?.z, -24, 1, -12 + (Math.random() - 0.5) * 4);

    const krathongItem = {
      id: `k-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ownerId: socket.id,
      ownerName: player.nickname,
      type: requestedType,
      wish,
      x: Number(launchX.toFixed(2)),
      z: Number(launchZ.toFixed(2)),
      driftVx: Number((0.12 + Math.random() * 0.14).toFixed(3)),
      driftVz: Number(((Math.random() - 0.5) * 0.14).toFixed(3)),
      createdAt: Date.now()
    };

    room.floatedKrathongs.push(krathongItem);
    if (room.floatedKrathongs.length > MAX_KRATHONGS) {
      room.floatedKrathongs.shift();
    }

    player.heldKrathong = null;

    io.to(room.id).emit('krathong:floated', krathongItem);
    io.to(room.id).emit('player:krathongUpdated', {
      id: socket.id,
      heldKrathong: null
    });

    // Classic Thai Loy Krathong touch: floating a krathong spawns a +2 coin near it in the pond!
    if (room.pondCoins.length < MAX_POND_COINS) {
      const kCoin = createRandomPondCoin(launchX + 0.8 + Math.random() * 1.6, launchZ + (Math.random() - 0.5) * 1.4, 2);
      room.pondCoins.push(kCoin);
      io.to(room.id).emit('coin:spawned', kCoin);
    }

    pushChat(room, {
      id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: 'system',
      senderName: 'ท่าน้ำลอยกระทง',
      text: `${player.nickname} ลอยกระทงอธิษฐานว่า "${wish}" 🪷`,
      type: 'system',
      timestamp: Date.now()
    });

    if (typeof ack === 'function') {
      ack({ ok: true, krathong: krathongItem });
    }
  });

  socket.on('lantern:release', (payload, ack) => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    if (!player) return;

    if ((player.coins || 0) < LANTERN_PRICE) {
      if (typeof ack === 'function') {
        ack({ ok: false, error: 'NOT_ENOUGH_COINS', required: LANTERN_PRICE, coins: player.coins || 0 });
      }
      return;
    }
    player.coins = (player.coins || 0) - LANTERN_PRICE;
    socket.emit('coins:updated', { coins: player.coins });

    pruneExpiredLanterns(room);

    const color = VALID_LANTERN_COLORS.has(payload?.color) ? payload.color : 'gold';
    const wish = sanitizeText(payload?.wish, 120) || 'ขอให้ชีวิตสว่างไสวดุจโคมลอย 🏮';

    const launchX = clampFinite(payload?.x, 16.0, 27.0, 21.5 + (Math.random() - 0.5) * 2.6);
    const launchZ = clampFinite(payload?.z, -11.0, -1.0, -6.0 + (Math.random() - 0.5) * 2.6);

    const lanternItem = {
      id: `lan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ownerId: socket.id,
      ownerName: player.nickname,
      color,
      wish,
      x: Number(launchX.toFixed(2)),
      z: Number(launchZ.toFixed(2)),
      driftVx: Number(((Math.random() - 0.5) * 0.24).toFixed(3)),
      driftVz: Number(((Math.random() - 0.5) * 0.24).toFixed(3)),
      riseSpeed: Number((0.72 + Math.random() * 0.26).toFixed(3)),
      createdAt: Date.now()
    };

    room.releasedLanterns.push(lanternItem);
    if (room.releasedLanterns.length > MAX_RELEASED_LANTERNS) {
      room.releasedLanterns.shift();
    }

    io.to(room.id).emit('lantern:released', lanternItem);

    pushChat(room, {
      id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: 'system',
      senderName: 'ลานปล่อยโคมลอย',
      text: `${player.nickname} ปล่อยโคมลอยอธิษฐานว่า "${wish}" 🏮`,
      type: 'system',
      timestamp: Date.now()
    });

    if (typeof ack === 'function') {
      ack({ ok: true, lantern: lanternItem });
    }
  });

  socket.on('stage:selectTrack', (payload, ack) => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    const tracks = listStageAudioTracks();
    if (!player || tracks.length === 0) {
      if (typeof ack === 'function') ack({ ok: false, error: 'NO_TRACKS' });
      return;
    }

    let nextIndex = room.stageTrack ? room.stageTrack.index : 0;
    if (payload && typeof payload.filename === 'string') {
      const idx = tracks.findIndex((t) => t.filename === payload.filename);
      if (idx < 0) {
        if (typeof ack === 'function') ack({ ok: false, error: 'TRACK_NOT_FOUND' });
        return;
      }
      nextIndex = idx;
    } else if (payload && typeof payload.step === 'number') {
      const delta = payload.step >= 0 ? 1 : -1;
      nextIndex = ((nextIndex + delta) % tracks.length + tracks.length) % tracks.length;
    } else {
      nextIndex = (nextIndex + 1) % tracks.length;
    }

    const picked = tracks[nextIndex];
    room.stageTrack = {
      index: nextIndex,
      filename: picked.filename,
      title: picked.title,
      url: picked.url,
      changedBy: player.nickname,
      startedAt: Date.now()
    };

    io.to(room.id).emit('stage:trackChanged', room.stageTrack);
    pushChat(room, {
      id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: 'system',
      senderName: 'เวทีคอนเสิร์ต',
      text: `${player.nickname} เปลี่ยนเพลงหน้าเวทีเป็น "${picked.title}" 🎵`,
      type: 'system',
      timestamp: Date.now()
    });

    if (typeof ack === 'function') {
      ack({ ok: true, stageTrack: room.stageTrack });
    }
  });

  socket.on('chat:send', (payload) => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    if (!player) return;

    const text = sanitizeText(payload?.text, 160);
    if (!text) return;

    pushChat(room, {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: socket.id,
      senderName: player.nickname,
      text,
      type: 'player',
      timestamp: Date.now()
    });
  });

  socket.on('activity:announce', (payload) => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    if (!player) return;

    const detail = sanitizeText(payload?.text, 160);
    if (!detail) return;

    pushChat(room, {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: 'system',
      senderName: 'ประกาศงานวัด',
      text: `${player.nickname} ${detail}`,
      type: 'system',
      timestamp: Date.now()
    });
  });

  socket.on('voice:speaking', (payload) => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    if (!player) return;

    player.isSpeaking = Boolean(payload?.speaking);
    socket.to(room.id).emit('voice:speaking', {
      id: socket.id,
      speaking: player.isSpeaking
    });
  });

  socket.on('player:wave', () => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    if (!player) return;
    socket.to(room.id).emit('player:waved', { id: socket.id });
  });

  socket.on('fireworks:launch', (payload, ack) => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    if (!player) return;

    const now = Date.now();
    if (player.lastFireworkAt && now - player.lastFireworkAt < 3000) {
      if (typeof ack === 'function') ack({ ok: false, error: 'COOLDOWN' });
      return;
    }

    const style = Object.prototype.hasOwnProperty.call(FIREWORK_STYLE_NAMES, payload?.style)
      ? payload.style
      : 'gold';
    const price = FIREWORK_PRICES[style] || 10;
    if ((player.coins || 0) < price) {
      if (typeof ack === 'function') {
        ack({ ok: false, error: 'NOT_ENOUGH_COINS', required: price, coins: player.coins || 0 });
      }
      return;
    }

    player.coins = (player.coins || 0) - price;
    player.lastFireworkAt = now;
    socket.emit('coins:updated', { coins: player.coins });

    const fwEvent = {
      id: `fw-${now}-${Math.random().toString(36).slice(2, 6)}`,
      ownerId: socket.id,
      ownerName: player.nickname,
      style,
      createdAt: now
    };
    io.to(room.id).emit('fireworks:launched', fwEvent);

    pushChat(room, {
      id: `sys-${now}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: 'system',
      senderName: 'ลานจุดพลุเฉลิมฉลอง',
      text: `${player.nickname} จุด${FIREWORK_STYLE_NAMES[style]} สว่างไสวทั่วท้องฟ้าวัดทุ่งท่าช้าง!`,
      type: 'system',
      timestamp: now
    });

    if (typeof ack === 'function') ack({ ok: true, firework: fwEvent, coins: player.coins });
  });

  socket.on('coin:collect', (payload, ack) => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    if (!player || !payload?.coinId) return;

    const idx = room.pondCoins.findIndex((c) => c.id === payload.coinId);
    if (idx < 0) {
      if (typeof ack === 'function') ack({ ok: false, error: 'ALREADY_TAKEN' });
      return;
    }
    const [coin] = room.pondCoins.splice(idx, 1);
    player.coins = (player.coins || 0) + coin.value;
    socket.emit('coins:updated', { coins: player.coins });
    io.to(room.id).emit('coin:collected', {
      coinId: coin.id,
      collectorId: socket.id,
      collectorName: player.nickname,
      value: coin.value
    });
    if (typeof ack === 'function') ack({ ok: true, value: coin.value, coins: player.coins });
  });

  socket.on('esiimsi:bonus', (payload, ack) => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    if (!player || payload?.tier !== 'great') {
      if (typeof ack === 'function') ack({ ok: false });
      return;
    }
    const now = Date.now();
    if (player.lastEsiimsiBonusAt && now - player.lastEsiimsiBonusAt < 180000) {
      if (typeof ack === 'function') ack({ ok: false, error: 'COOLDOWN' });
      return;
    }
    player.lastEsiimsiBonusAt = now;
    player.coins = (player.coins || 0) + 5;
    socket.emit('coins:updated', { coins: player.coins });
    if (typeof ack === 'function') ack({ ok: true, bonus: 5, coins: player.coins });
  });

  socket.on('player:sendHeart', (payload, ack) => {
    const room = getRoomForSocket(socket);
    const sender = room?.players.get(socket.id);
    const targetId = typeof payload?.targetId === 'string' ? payload.targetId : '';
    const target = room?.players.get(targetId);
    if (!sender || !target || target.id === sender.id) {
      if (typeof ack === 'function') ack({ ok: false, error: 'INVALID_TARGET' });
      return;
    }
    const now = Date.now();
    if (sender.lastHeartSentAt && now - sender.lastHeartSentAt < 3000) {
      if (typeof ack === 'function') ack({ ok: false, error: 'COOLDOWN' });
      return;
    }
    sender.lastHeartSentAt = now;
    target.hearts = (target.hearts || 0) + 1;

    io.to(room.id).emit('player:heartReceived', {
      fromId: sender.id,
      fromName: sender.nickname,
      toId: target.id,
      toName: target.nickname,
      hearts: target.hearts
    });
    if (typeof ack === 'function') ack({ ok: true, hearts: target.hearts });
  });

  socket.on('player:giftCoins', (payload, ack) => {
    const room = getRoomForSocket(socket);
    const sender = room?.players.get(socket.id);
    const targetId = typeof payload?.targetId === 'string' ? payload.targetId : '';
    const target = room?.players.get(targetId);
    if (!sender || !target || target.id === sender.id) {
      if (typeof ack === 'function') ack({ ok: false, error: 'INVALID_TARGET' });
      return;
    }
    const amount = Math.floor(Number(payload?.amount));
    if (!Number.isFinite(amount) || amount < 1 || amount > 999) {
      if (typeof ack === 'function') ack({ ok: false, error: 'INVALID_AMOUNT' });
      return;
    }
    if ((sender.coins || 0) < amount) {
      if (typeof ack === 'function') {
        ack({ ok: false, error: 'NOT_ENOUGH_COINS', coins: sender.coins || 0, required: amount });
      }
      return;
    }

    sender.coins = (sender.coins || 0) - amount;
    target.coins = (target.coins || 0) + amount;

    socket.emit('coins:updated', { coins: sender.coins });
    io.to(target.id).emit('coins:updated', { coins: target.coins });
    io.to(room.id).emit('player:coinGifted', {
      fromId: sender.id,
      fromName: sender.nickname,
      toId: target.id,
      toName: target.nickname,
      amount
    });

    pushChat(room, {
      id: `gift-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderId: 'system',
      senderName: 'น้ำใจงานวัด',
      text: `${sender.nickname} มอบเงินทำบุญ ${amount} เหรียญ ให้ ${target.nickname}! 💰✨`,
      type: 'system',
      timestamp: Date.now()
    });

    if (typeof ack === 'function') ack({ ok: true, amount, coins: sender.coins });
  });

  // 4-Emote Dance & Gesture Sync (wave / ramwong / cheer / wai / null)
  socket.on('player:emote', (payload) => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    if (!player) return;
    const emote = VALID_EMOTES.has(payload?.emote) ? payload.emote : null;
    player.activeEmote = emote === 'wave' || emote === 'wai' ? null : emote;
    socket.to(room.id).emit('player:emoted', { id: socket.id, emote });
  });

  // Mini-game 1: Balloon Dart (5 coins -> pop >= 7 in 15s -> win +15 coins + Teddy Bear prop!)
  socket.on('minigame:balloonStart', (_payload, ack) => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    if (!player) return;
    if ((player.coins || 0) < BALLOON_GAME_PRICE) {
      if (typeof ack === 'function') {
        ack({ ok: false, error: 'NOT_ENOUGH_COINS', required: BALLOON_GAME_PRICE, coins: player.coins || 0 });
      }
      return;
    }
    player.coins = (player.coins || 0) - BALLOON_GAME_PRICE;
    player.balloonSession = { startedAt: Date.now() };
    socket.emit('coins:updated', { coins: player.coins });
    if (typeof ack === 'function') ack({ ok: true, coins: player.coins });
  });

  socket.on('minigame:balloonFinish', (payload, ack) => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    if (!player || !player.balloonSession) {
      if (typeof ack === 'function') ack({ ok: false, error: 'NO_SESSION' });
      return;
    }
    player.balloonSession = null;
    const popped = Math.max(0, Math.min(12, Math.floor(Number(payload?.popped) || 0)));
    const won = popped >= 7;
    if (won) {
      player.coins = (player.coins || 0) + 15;
      player.heldProp = 'teddy';
      player.propBites = 0;
      socket.emit('coins:updated', { coins: player.coins });
      io.to(room.id).emit('player:propUpdated', {
        id: socket.id,
        heldProp: 'teddy',
        propBites: 0
      });
      pushChat(room, {
        id: `bal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        senderId: 'system',
        senderName: 'ซุ้มปาโป่งงานวัด',
        text: `🏆 ${player.nickname} ปาโป่งแตก ${popped} ลูก! คว้ารางวัล +15 เหรียญ และตุ๊กตาหมีงานวัด 🧸`,
        type: 'system',
        timestamp: Date.now()
      });
      if (typeof ack === 'function') {
        ack({ ok: true, won: true, popped, reward: 15, prop: 'teddy', coins: player.coins });
      }
    } else {
      if (typeof ack === 'function') {
        ack({ ok: true, won: false, popped, reward: 0, coins: player.coins });
      }
    }
  });

  // Krathong Contest Live Voting
  socket.on('contest:vote', (payload, ack) => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    const entry = payload?.entry;
    if (!player || !VALID_CONTEST_ENTRIES.has(entry)) {
      if (typeof ack === 'function') ack({ ok: false });
      return;
    }
    room.contestVotes.set(socket.id, entry);
    const summary = getContestSummary(room);
    io.to(room.id).emit('contest:updated', summary);
    if (typeof ack === 'function') ack({ ok: true, entry, ...summary });
  });

  // Live Room Leaderboard (Top 3 Hearts & Top 3 Coins)
  socket.on('leaderboard:get', (_payload, ack) => {
    const room = getRoomForSocket(socket);
    if (!room) {
      if (typeof ack === 'function') ack({ ok: false });
      return;
    }
    if (typeof ack === 'function') ack({ ok: true, ...getRoomLeaderboard(room) });
  });

  // Proximity-scoped WebRTC Signaling (only within same room)
  socket.on('webrtc:offer', (payload) => {
    const room = getRoomForSocket(socket);
    if (!room || !payload?.to || !payload?.offer || !room.players.has(payload.to)) return;
    io.to(payload.to).emit('webrtc:offer', {
      from: socket.id,
      offer: payload.offer
    });
  });

  socket.on('webrtc:answer', (payload) => {
    const room = getRoomForSocket(socket);
    if (!room || !payload?.to || !payload?.answer || !room.players.has(payload.to)) return;
    io.to(payload.to).emit('webrtc:answer', {
      from: socket.id,
      answer: payload.answer
    });
  });

  socket.on('webrtc:ice', (payload) => {
    const room = getRoomForSocket(socket);
    if (!room || !payload?.to || !payload?.candidate || !room.players.has(payload.to)) return;
    io.to(payload.to).emit('webrtc:ice', {
      from: socket.id,
      candidate: payload.candidate
    });
  });

  socket.on('disconnect', () => {
    const room = getRoomForSocket(socket);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (!player) return;

    room.players.delete(socket.id);
    room.dirtyMoves.delete(socket.id);
    socket.to(room.id).emit('player:left', { id: socket.id });

    pushChat(room, {
      id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: 'system',
      senderName: 'ระบบงานวัด',
      text: `${player.nickname} ออกจากงานแล้ว`,
      type: 'system',
      timestamp: Date.now()
    });
  });
});

server.listen(PORT, () => {
  console.log(`Loy Krathong 3D Server running at http://localhost:${PORT}`);
});
