# Temple Fair Garden Trees Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two lush, photogenic festive temple-fair gardens (Southeast & Southwest/Mid-West) with 3 stylized tree species, warm lights, hanging lanterns, fireflies, stepping stones, wooden benches, trunk/bench collisions, and minimap rendering.

**Architecture:** Extract all garden layout data, instanced Three.js builders, animation loop hooks, graphics-mode toggle, and minimap drawing into a self-contained ES module `public/js/garden.js`. Wire `public/js/app.js` to invoke these 4 functions during bootstrap, graphics toggle, animation, and minimap rendering.

**Tech Stack:** Vanilla ES Modules, Three.js r170 (`InstancedMesh`, `Points`, `CanvasTexture`, `PointLight`), Node.js test verification script, live browser visual verification.

**Spec:** `docs/superpowers/specs/2026-11-22-temple-garden-trees-design.md`

## Global Constraints
- Must run natively in the browser via existing importmap (`import * as THREE from 'three'`) with zero bundler or extra npm packages.
- All tree trunks, palms, benches, and stepping stones must lie strictly inside temple perimeter walls (`-40.5 <= x <= 55.5`, `z <= 52.5`) and outside all occupied zones (parking lots, stalls, Soidaw, Sala Buddha, east walkway, pond).
- Keep draw calls low via `InstancedMesh` and limit added `PointLight`s to 2 total.
- Respect `lowGraphics` mode (disable shadow casting on instanced meshes, reduce firefly count from 90 to 30).
- Do not modify or relocate any existing buildings, stalls, parking lots, or server logic.

## Review Focus
- **Overlap with existing structures:** Any tree trunk or bench accidentally placed inside a parking pad, stall row, Sala Buddha, Soidaw, east walkway, or pond breaks walkability or clips visually -> pinned by automated coordinate-clearance verification test in Task 1.
- **Unwalkable bottleneck / trapped player:** Dense trunk collisions could block entry into the mid-west pocket lawn or between benches and trees -> verified by minimum trunk spacing & corridor checks in Task 1.
- **Low-graphics mode toggle at runtime:** Clicking `กราฟิก: ปกติ/ประหยัด` in HUD after world load must update garden shadow flags and firefly draw range without throwing -> verified in Task 2.
- **Runtime ES module / WebGL errors:** Any typo, missing import, or Three.js attribute mismatch breaks page load -> verified in Task 3 via live browser reload and visual inspection of both gardens.
- **Minimap alignment:** Garden markers on minimap must use the same world-to-minimap transform (`mapX`, `mapY`) as buildings -> verified in Task 2 & Task 3.

---

### Task 1: Create `public/js/garden.js` Layout Data, Clearance Rules & Instanced 3D Builders

**Files:**
- Create: `public/js/garden.js`
- Create: `scripts/verify-garden-layout.mjs` (Node verification test for coordinate bounds, obstacle clearance, and spacing)

**Interfaces:**
- Consumes: `THREE` (from `'three'`), `scene`, `addCollisionBox(minX, maxX, minZ, maxZ, tag)`, `lowGraphics` (boolean)
- Produces (named exports from `public/js/garden.js`):
  - `GARDEN_LAYOUT` (object containing `heroTrees`, `mediumTrees`, `palms`, `bushes`, `benches`, `steppingStones`, `gardenLights` arrays for testability and minimap rendering)
  - `buildTempleGardens(scene, addCollisionBox, lowGraphics)` -> returns `gardenState` handle
  - `setGardenGraphicsMode(gardenState, lowGraphics)` -> updates shadow casting & firefly drawRange
  - `updateTempleGardens(gardenState, dt, elapsed)` -> animates hanging lantern sway & firefly drift
  - `drawGardenMinimap(ctx, mapX, mapY)` -> draws tree canopy dots onto the 2D minimap canvas

- [ ] **Step 1: Write layout clearance verification script `scripts/verify-garden-layout.mjs`**

Assert that every entry in `GARDEN_LAYOUT.heroTrees`, `mediumTrees`, `palms`, `benches`, `bushes`, and `steppingStones`:
- Lies within inner perimeter walls (`x >= -40.5 && x <= 55.5 && z >= 5.5 && z <= 52.5`).
- Does not intersect any forbidden rectangle (right parking `6..17, 42.5..53.5`, right stalls `4..7, 13..42`, Soidaw `11..19, 12..20`, east walkway `3..27, 10..14.5`, Sala Buddha `22.5..39.5, 6.5..19.5`, pond `36..56, -28..4`, left parking `-23..-9, 40.5..51.5`, L-hook stalls `-19.5..-6.5, 32..40.5`, left road stalls `-7..-4, 5..32.5`, mid-left horizontal stalls `-32.5..-7, 3.5..7`, far-west stalls `-37..-33.5, -34..3`).
- Every pair of trees (`heroTrees` + `mediumTrees` + `palms`) maintains at least `2.4m` trunk-to-trunk separation, and every bench maintains at least `2.0m` clearance from every tree trunk.

- [ ] **Step 2: Run verification script to verify it fails before implementation**

Run: `node scripts/verify-garden-layout.mjs`
Expected: FAIL (`ERR_MODULE_NOT_FOUND` for `../public/js/garden.js`)

- [ ] **Step 3: Implement `public/js/garden.js`**

Implement:
- `GARDEN_LAYOUT` with curated, collision-free placements across both Southeast (`Garden A`) and Southwest/Mid-West (`Garden B`) zones matching the user's two red-outlined screenshots.
- Pure-data export separation or lazy Three.js import so `GARDEN_LAYOUT` can be imported cleanly in both Node (for test verification) and browser.
- `buildTempleGardens(scene, addCollisionBox, lowGraphics)`:
  - **Hero branching big trees** (`InstancedMesh` trunks, angled branches, multi-cluster layered canopies in 3 rich greens, spiral warm-white trunk fairy-light bulbs, hanging colorful temple lanterns with warm glow & cords, warm ground uplight discs, trunk AABB collision `±0.45m`).
  - **Medium ornamental trees** (`InstancedMesh` tapered trunks, multi-lobe airy canopies, soft warm uplights, trunk AABB collision `±0.32m`).
  - **Coconut / palm trees** (`InstancedMesh` curved segmented trunks + radiating arched fronds, trunk AABB collision `±0.3m`).
  - **Low bushes & marigold clusters** (`InstancedMesh` rounded shrubs + golden marigold flower dots, no player collision so movement stays smooth).
  - **Curved stepping-stone paths** (`InstancedMesh` flat weathered stone cylinders resting at `y = 0.025`).
  - **Wooden benches** (`InstancedMesh` timber slats, backrest, and dark-metal legs + compact AABB collision).
  - **Animated fireflies** (`THREE.Points` with additive radial-glow `CanvasTexture`, 90 particles normal / 30 in `lowGraphics`).
  - **2 warm garden `PointLight`s** (1 per garden).
- `setGardenGraphicsMode(gardenState, lowGraphics)` toggling `castShadow` on shadow-casting instanced meshes and `fireflies.geometry.setDrawRange(0, lowGraphics ? 30 : 90)`.
- `updateTempleGardens(gardenState, dt, elapsed)` gently swaying hanging lanterns and drifting fireflies.
- `drawGardenMinimap(ctx, mapX, mapY)` painting subtle green tree circles on the minimap.

- [ ] **Step 4: Run verification script to verify all spatial & clearance assertions pass**

Run: `node scripts/verify-garden-layout.mjs`
Expected: PASS with 0 overlaps, 0 boundary violations, 0 spacing violations.

---

### Task 2: Integrate `public/js/garden.js` into `public/js/app.js`

**Files:**
- Modify: `public/js/app.js`

**Interfaces:**
- Consumes: `buildTempleGardens`, `setGardenGraphicsMode`, `updateTempleGardens`, `drawGardenMinimap` from `./garden.js`

- [ ] **Step 1: Import garden functions at top of `public/js/app.js`**

Add `import { buildTempleGardens, setGardenGraphicsMode, updateTempleGardens, drawGardenMinimap } from './garden.js';` right after existing Three.js imports.

- [ ] **Step 2: Wire lifecycle hooks in `public/js/app.js`**

- Hold `let gardenState = null;` near `skyRefs`.
- In `applyGraphicsMode(low)`: if `gardenState`, call `setGardenGraphicsMode(gardenState, state.lowGraphics)`.
- In `bootstrap()`: call `gardenState = buildTempleGardens(scene, addCollisionBox, state.lowGraphics);` right after `buildSpecialZones()` and before `setupWorldCollisions()`.
- In `updateAtmosphere(dt, elapsed)`: call `if (gardenState) updateTempleGardens(gardenState, dt, elapsed);`.
- In `drawMinimap()`: call `drawGardenMinimap(minimapCtx, mapX, mapY);` before drawing players.

- [ ] **Step 3: Syntax-check `public/js/app.js` and `public/js/garden.js`**

Run a Node syntax check confirming zero parse errors across both ES modules.
Expected: Exit code 0.

---

### Task 3: Live Browser End-to-End & Visual Verification

**Files:**
- Verify live app at `http://localhost:3000/` using the browser subagent

- [ ] **Step 1: Reload `http://localhost:3000/` and inspect console/network errors**

Confirm all 10 GLB models load (`status: "loaded"`), zero console errors, zero failed network requests.

- [ ] **Step 2: Visually inspect both Southeast and Southwest/Mid-West gardens**

Walk into Garden A (Southeast, near right parking & Sala Buddha) and Garden B (Southwest/Mid-West, near left parking & behind stalls):
- Verify all 3 tree types, trunk fairy lights, hanging lanterns, bushes/marigolds, stepping stones, benches, and fireflies render cleanly on the ground with no floating or clipping into stalls/parking/Sala/walls.
- Toggle `กราฟิก: ประหยัด` and back to `ปกติ` to verify no runtime errors.
- Confirm minimap displays the new green garden tree canopy markers.
