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
// MULTI-ROOM SCALING STATE (4 Rooms x 35 Players = 140+ Concurrent Players)
// ============================================================================

const MAX_PLAYERS_PER_ROOM = 35;
const MAX_KRATHONGS = 60;
const MAX_RELEASED_LANTERNS = 40;
const LANTERN_LIFETIME_MS = 90000;
const MAX_RECENT_CHATS = 30;
const VALID_KRATHONG_TYPES = new Set(['banana', 'lotus', 'bread']);
const VALID_LANTERN_COLORS = new Set(['gold', 'pink', 'white']);
const AUDIO_DIR = path.join(__dirname, 'public', 'audio');
const AUDIO_EXT_RE = /\.(mp3|ogg|m4a|wav)$/i;
const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;

function listStageAudioTracks() {
  try {
    if (!fs.existsSync(AUDIO_DIR)) return [];
    const files = fs
      .readdirSync(AUDIO_DIR)
      .filter((name) => AUDIO_EXT_RE.test(name))
      .sort((a, b) => a.localeCompare(b, 'th'));
    return files.map((filename) => {
      const base = filename.replace(AUDIO_EXT_RE, '').replace(/[_-]+/g, ' ').trim();
      return {
        id: filename,
        filename,
        title: base || filename,
        url: `/audio/${encodeURIComponent(filename)}`
      };
    });
  } catch {
    return [];
  }
}

function createDefaultStageMusic() {
  const tracks = listStageAudioTracks();
  const preferred = tracks.find((t) => t.filename.toLowerCase() === 'concert.mp3') || tracks[0];
  if (preferred) {
    return {
      mode: 'mp3',
      title: preferred.title,
      url: preferred.url,
      filename: preferred.filename,
      videoId: null,
      requestedBy: 'เวทีคอนเสิร์ต',
      startedAt: Date.now()
    };
  }
  return {
    mode: 'synth',
    title: 'ดนตรีงานวัดอัตโนมัติ (120 BPM)',
    url: null,
    filename: null,
    videoId: null,
    requestedBy: 'ระบบงานวัด',
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
  rooms.set(def.id, {
    id: def.id,
    name: def.name,
    players: new Map(),
    dirtyMoves: new Map(),
    floatedKrathongs: [],
    releasedLanterns: [],
    recentChats: [],
    stageMusic: createDefaultStageMusic()
  });
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
// 10 HZ BATCHED MOVEMENT TICK PER ROOM (Drops server CPU & packet load >90%)
// ============================================================================

setInterval(() => {
  for (const room of rooms.values()) {
    if (room.dirtyMoves.size === 0) continue;
    const updates = Array.from(room.dirtyMoves.values());
    room.dirtyMoves.clear();
    io.to(room.id).emit('players:batch', updates);
  }
}, 100);

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
      heldKrathong: null,
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
        roomMax: MAX_PLAYERS_PER_ROOM
      });
    }

    pruneExpiredLanterns(room);
    socket.emit('world:init', {
      selfId: socket.id,
      roomId: room.id,
      roomName: room.name,
      roomMax: MAX_PLAYERS_PER_ROOM,
      players: Array.from(room.players.values()),
      krathongs: room.floatedKrathongs,
      lanterns: room.releasedLanterns,
      recentChats: room.recentChats,
      stageMusic: room.stageMusic
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

    // Queue for next 10 Hz batched broadcast instead of immediate O(N^2) emit
    room.dirtyMoves.set(socket.id, {
      id: socket.id,
      x: player.x,
      y: player.y,
      z: player.z,
      rotY: player.rotY,
      isMoving: player.isMoving,
      isRunning: player.isRunning
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

  socket.on('stage:setMusic', (payload, ack) => {
    const room = getRoomForSocket(socket);
    const player = room?.players.get(socket.id);
    if (!player || !payload || typeof payload !== 'object') {
      if (typeof ack === 'function') ack({ ok: false, error: 'INVALID_PAYLOAD' });
      return;
    }

    const mode = payload.mode;
    let nextMusic = null;

    if (mode === 'synth') {
      nextMusic = {
        mode: 'synth',
        title: 'ดนตรีงานวัดอัตโนมัติ (120 BPM)',
        url: null,
        filename: null,
        videoId: null,
        requestedBy: player.nickname,
        startedAt: Date.now()
      };
    } else if (mode === 'mp3') {
      const tracks = listStageAudioTracks();
      const found = tracks.find(
        (t) => t.filename === payload.filename || t.url === payload.url
      );
      if (!found) {
        if (typeof ack === 'function') ack({ ok: false, error: 'TRACK_NOT_FOUND' });
        return;
      }
      nextMusic = {
        mode: 'mp3',
        title: found.title,
        url: found.url,
        filename: found.filename,
        videoId: null,
        requestedBy: player.nickname,
        startedAt: Date.now()
      };
    } else if (mode === 'youtube') {
      const videoId = sanitizeText(payload.videoId, 16);
      if (!YT_ID_RE.test(videoId)) {
        if (typeof ack === 'function') ack({ ok: false, error: 'INVALID_YOUTUBE_ID' });
        return;
      }
      const customTitle = sanitizeText(payload.title, 70);
      nextMusic = {
        mode: 'youtube',
        title: customTitle || `YouTube (${videoId})`,
        url: null,
        filename: null,
        videoId,
        requestedBy: player.nickname,
        startedAt: Date.now()
      };
    } else {
      if (typeof ack === 'function') ack({ ok: false, error: 'INVALID_MODE' });
      return;
    }

    room.stageMusic = nextMusic;
    io.to(room.id).emit('stage:musicUpdated', nextMusic);

    pushChat(room, {
      id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: 'system',
      senderName: 'เวทีคอนเสิร์ต',
      text: `${player.nickname} เปิดเพลงหน้าเวที: ${nextMusic.title} 🎵`,
      type: 'system',
      timestamp: Date.now()
    });

    if (typeof ack === 'function') {
      ack({ ok: true, stageMusic: nextMusic });
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
