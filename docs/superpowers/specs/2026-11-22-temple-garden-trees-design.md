# Temple Fair Garden Trees & Festive Lighting Design

## Intent & Goal
Fill the two large empty grass lawns inside the Loy Krathong 3D temple grounds (Southeast lawn next to right parking / Sala Buddha / Pond, and Southwest + Mid-West lawn next to left parking / behind vendor stalls) with a **lush, shady temple-fair garden with festive warm lighting** ("สวนร่มรื่น + ต้นไม้ประดับไฟงานวัด") that feels relaxing and photogenic for players walking through.

## Approaches Considered
1. **Approach 1 (Selected): Stylized Multi-Species Procedural Three.js (`InstancedMesh`) + Festive Lighting**
   - Build 3 distinct tree species (branching big canopy tree, medium ornamental temple tree, curved coconut/palm tree), low bushes with marigold accents, warm trunk fairy-light wraps, hanging temple-fair lanterns, ground uplights, fireflies, curved stepping-stone paths, and wooden benches using instanced/merged Three.js geometry in a dedicated module (`public/js/garden.js`).
   - *Trade-off:* Stylized low-poly look (matching the anime/chibi avatars) rather than photorealistic foliage, in exchange for zero extra download size, instant iteration, high FPS via instancing, and automatic `lowGraphics` scaling.
2. **Approach 2 (Rejected for now): Custom Blender `.glb` Pack (`public/models/trees.glb`)**
   - Requires connecting Blender or supplying external `.glb` assets and adds 1–3 MB to initial page load. Deferred; modular layout allows swapping meshes later if desired.

## Constraints & Non-Goals
- **Zero backend changes** and zero extra network asset requests.
- **No overlapping** with existing temple perimeter walls (`X: -42..57, Z: -58.5..54`), motorcycle parking lots, vendor stalls, Soidaw, Sala Buddha, east walkway, or the pond.
- **Walkable canopies:** Collision boxes cover only large tree trunks and benches so players can walk freely underneath tree canopies and along stepping-stone paths.
- **Performance budget:** Use `InstancedMesh` for repeated trunks, foliage clusters, palm fronds, bushes, fairy-light bulbs, hanging lanterns, stepping stones, and uplights; limit dynamic lights to 2 warm `PointLight`s total (1 per garden); scale shadows and firefly count with `lowGraphics`.
- **Minimap sync:** Render garden tree dots on the existing 2D canvas minimap.

## Spatial Zones
- **Garden A (Southeast — สวนริมศาลา-สระน้ำ):**
  - Main SE lawn: `X: 18.5..54.5, Z: 21.5..51.5`
  - Behind Sala / South of Pond strip: `X: 41.5..54.5, Z: 6.5..21.5`
  - 5 Hero branching big trees (with trunk fairy lights + hanging lanterns), ~10 medium ornamental trees (with uplights), ~9 palms along east/south walls and near pond, ~28 bush/marigold clusters, curved stepping-stone path, 2 wooden benches, 1 warm `PointLight`.
- **Garden B (Southwest & Mid-West — สวนโคมไฟหลังตลาด):**
  - West corridor: `X: -39.5..-25.0, Z: 8.5..51.5`
  - Mid-west pocket lawn: `X: -31.0..-10.0, Z: 9.5..30.0` (preserving wide entryways from parking and market paths)
  - 4 Hero branching big trees (with trunk fairy lights + hanging lanterns), ~9 medium ornamental trees (with uplights), ~6 palms along west/southwest walls, ~24 bush/marigold clusters, curved stepping-stone path, 2 wooden benches, 1 warm `PointLight`.
- **Atmosphere:** ~90 animated fireflies (30 in `lowGraphics`) drifting softly across both gardens, plus gentle hanging-lantern sway.
