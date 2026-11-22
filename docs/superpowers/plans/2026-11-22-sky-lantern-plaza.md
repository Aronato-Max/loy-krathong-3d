# Sky Lantern Release Plaza Implementation Plan

**Goal:** Build the central Sky Lantern Release Plaza & "ลอยกระทง 2569" check-in photo arch with real-time multiplayer sky lantern release across `server.js`, `public/js/lantern-plaza.js`, `public/js/app.js`, `public/index.html`, and `public/css/style.css`.

**Architecture:** Mirror the `krathong:float` Socket.IO flow in `server.js` for `lantern:release`, isolate all 3D plaza geometry, lantern meshes, animations, and minimap rendering in `public/js/lantern-plaza.js`, and wire the native `<dialog>` and socket handlers in `public/js/app.js`.

**Spec:** `docs/superpowers/specs/2026-11-22-sky-lantern-plaza-design.md`

---

### Task 1: Backend Real-Time Sky Lantern Sync (`server.js`)
- Add `releasedLanterns = []`, `MAX_RELEASED_LANTERNS = 40`, `LANTERN_LIFETIME_MS = 90000`, `VALID_LANTERN_COLORS = new Set(['gold', 'pink', 'white'])`.
- Add `pruneExpiredLanterns()` helper called on `world:init`, `/api/health`, and `lantern:release`.
- Include `lanterns: releasedLanterns` in `world:init` payload and `activeLanterns` in `/api/health`.
- Handle `lantern:release` event: sanitize wish/color/coordinates (clamped around plaza `X: 16..27, Z: -11..-1`), emit `lantern:released`, announce in temple chat, and return ack `{ ok: true, lantern }`.

### Task 2: Frontend 3D Plaza & Rising Lantern Module (`public/js/lantern-plaza.js`)
- Export `LANTERN_PLAZA_CONFIG`, `LANTERN_COLORS`, `buildLanternPlaza(scene, addCollisionBox, createSignBoard, lowGraphics)`, `setLanternPlazaGraphicsMode(plazaState, lowGraphics)`, `createReleasedLanternMesh(color)`, `updateLanternPlaza(plazaState, dt, elapsed)`, and `drawLanternPlazaMinimap(ctx, mapX, mapY, mapW)`.
- Build circular 2-tier stone plaza, golden center medallion, bamboo check-in photo arch `"ลอยกระทง 2569"` with warm fairy lights & hanging Lanna lanterns, 8 perimeter lantern posts, central lantern release stand with warm flame glow, and 1 warm PointLight.

### Task 3: UI Dialog, Styling & Wiring (`public/index.html`, `public/css/style.css`, `public/js/app.js`)
- Add `<dialog id="dialog-release-lantern">` with 3 lantern color radio/cards (`gold`, `pink`, `white`) and wish textarea in `public/index.html`.
- Add concise styles for `.lantern-label` and `.lantern-choices` in `public/css/style.css`.
- Wire `lantern-plaza` interact zone (`x: 21.5, z: -6.0, radius: 4.5`), `lantern:release` emit, `lantern:released` & `world:init` listener, rising lantern animation & 3D wish label projection, graphics mode toggle, and minimap drawing in `public/js/app.js`.

### Task 4: Verification & Live Server Restart
- Restart the background `node server.js` daemon so the updated `server.js` is active.
- Run automated tests: Socket.IO `lantern:release` broadcast/ack/init test + syntax checks + garden layout test (including plaza clearance).
