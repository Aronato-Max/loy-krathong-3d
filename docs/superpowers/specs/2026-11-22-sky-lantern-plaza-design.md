# Sky Lantern Release Plaza & Check-in Photo Arch Design

## Intent & Goal
Fill the central courtyard (`X: 12..31, Z: -16..+4`) surrounded by the light tunnels, krathong pier, contest stage, and Sala Buddha with an iconic, open-sightline centerpiece: **ลานปล่อยโคมลอย + ซุ้มถ่ายรูปเช็คอิน "ลอยกระทง 2569"** featuring real-time multiplayer sky lantern release with wish labels.

## Approach Selected
- Dedicated frontend module `public/js/lantern-plaza.js` (mirroring `garden.js`) + Socket.IO real-time sync in `server.js` (mirroring `krathong:float`).
- Native `<dialog id="dialog-release-lantern">` in `public/index.html` with 3 lantern styles (`gold`, `pink`, `white`) and wish textarea.

## Spatial Layout (`center: X = 21.5, Z = -6.0`, radius `7.2m`)
- **Circular 2-tier stone plaza** (`r = 7.2m` outer curb + `r = 6.6m` stone deck + golden decorative ring + central glowing medallion).
- **Check-in Bamboo Photo Arch ("ลอยกระทง 2569")** on the north-west arc of the plaza (`X = 21.5, Z = -10.8`, facing south/southeast into the plaza) with twin bamboo pillar clusters, arched crossbeam wrapped in warm fairy lights, hanging colorful Lanna lanterns, and illuminated signboard `"ลอยกระทง 2569"`.
- **8 Perimeter Lanna Lantern Posts** spaced around the plaza edge (`r = 6.7m`, leaving wide open entry gaps on all 4 cardinal paths).
- **Central Release Brazier / Lantern Stand** at `(21.5, -6.0)` with stacked ready-to-launch lanterns and warm glowing brazier flame — triggers interact zone `E` (`ปล่อยโคมลอยอธิษฐาน 🏮`, radius `4.2m`).
- **1 Warm PointLight** (`0xffbe55`) illuminating the plaza & photo arch.
- **Collisions:** Only bamboo arch posts, 8 perimeter lantern posts, and the central lantern stand (`±0.65m`), leaving the plaza deck and photo spot freely walkable.
- **Minimap:** Gold-amber circle + ring at `(21.5, -6.0)` on the 2D minimap.

## Multiplayer Real-Time Sky Lanterns
- **Client → Server:** `lantern:release` `{ color: 'gold'|'pink'|'white', wish, x, z }` with ack.
- **Server → Clients:** `lantern:released` broadcasting `{ id, ownerId, ownerName, color, wish, x, z, driftVx, driftVz, riseSpeed, createdAt }`, plus system announcement in chat (`"ปล่อยโคมลอยอธิษฐานว่า \"...\" 🏮"`).
- **Persistence for Late Joiners:** `releasedLanterns` array in `server.js` included in `world:init`; auto-pruned after `90s` lifetime or capped at `40` active lanterns.
- **3D Rising Lantern & Label:** Warm paper cylinder with glowing inner flame & dark rim rising smoothly from `y = 1.1` upward with gentle wind sway, fading/removing after `90s`, plus projected floating 3D name + wish card (visible within 46m).
