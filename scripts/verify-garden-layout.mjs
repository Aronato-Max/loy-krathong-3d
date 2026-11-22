import assert from 'node:assert/strict';
import { GARDEN_LAYOUT } from '../public/js/garden.js';

const FORBIDDEN_ZONES = [
  { name: 'right-parking', minX: 6.0, maxX: 17.0, minZ: 42.5, maxZ: 53.5 },
  { name: 'right-stalls', minX: 4.0, maxX: 7.0, minZ: 13.0, maxZ: 42.0 },
  { name: 'east-walkway', minX: 3.0, maxX: 27.0, minZ: 10.0, maxZ: 14.5 },
  { name: 'sala-buddha', minX: 22.5, maxX: 39.5, minZ: 6.5, maxZ: 19.5 },
  { name: 'pond', minX: 36.0, maxX: 56.0, minZ: -28.5, maxZ: 4.5 },
  { name: 'ubosot', minX: 6.0, maxX: 24.5, minZ: -57.0, maxZ: -30.0 },
  { name: 'krathong-tables', minX: 16.5, maxX: 23.5, minZ: -27.5, maxZ: -24.0 },
  { name: 'command-tent', minX: 6.0, maxX: 11.0, minZ: -28.5, maxZ: -23.8 },
  { name: 'tunnel18', minX: 8.5, maxX: 25.5, minZ: -22.5, maxZ: -18.5 },
  { name: 'tunnel24', minX: 6.0, maxX: 10.0, minZ: -20.0, maxZ: 6.0 },
  { name: 'concert-stage', minX: -33.0, maxX: -9.0, minZ: -57.0, maxZ: -48.0 },
  { name: 'left-parking', minX: -23.0, maxX: -9.0, minZ: 40.5, maxZ: 51.5 },
  { name: 'l-hook-stalls', minX: -19.5, maxX: -6.5, minZ: 32.0, maxZ: 40.5 },
  { name: 'left-road-stalls', minX: -7.0, maxX: -4.0, minZ: 5.0, maxZ: 32.5 },
  { name: 'mid-left-stalls', minX: -32.5, maxX: -7.0, minZ: 3.5, maxZ: 7.0 },
  { name: 'far-west-stalls', minX: -37.0, maxX: -33.5, minZ: -34.0, maxZ: 3.0 },
  { name: 'main-road', minX: -4.0, maxX: 4.0, minZ: -60.0, maxZ: 64.0 }
];

const INNER_BOUNDS = { minX: -40.5, maxX: 55.5, minZ: -56.5, maxZ: 52.5 };

const violations = [];

function checkList(label, items, pad = 0) {
  assert.ok(Array.isArray(items) && items.length > 0, `${label} must be a non-empty array`);
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (
      it.x < INNER_BOUNDS.minX ||
      it.x > INNER_BOUNDS.maxX ||
      it.z < INNER_BOUNDS.minZ ||
      it.z > INNER_BOUNDS.maxZ
    ) {
      violations.push(`${label}[${i}] (${it.x}, ${it.z}) is outside inner temple walls`);
    }
    for (const z of FORBIDDEN_ZONES) {
      if (
        it.x >= z.minX - pad &&
        it.x <= z.maxX + pad &&
        it.z >= z.minZ - pad &&
        it.z <= z.maxZ + pad
      ) {
        violations.push(`${label}[${i}] (${it.x}, ${it.z}) overlaps ${z.name}`);
      }
    }
  }
}

checkList('heroTrees', GARDEN_LAYOUT.heroTrees, 0.8);
checkList('mediumTrees', GARDEN_LAYOUT.mediumTrees, 0.5);
checkList('palms', GARDEN_LAYOUT.palms, 0.4);
checkList('benches', GARDEN_LAYOUT.benches, 0.6);
checkList('bushes', GARDEN_LAYOUT.bushes, 0.0);
checkList('steppingStones', GARDEN_LAYOUT.steppingStones, 0.0);

const allTrees = [
  ...GARDEN_LAYOUT.heroTrees.map((t, i) => ({ ...t, tag: `hero[${i}]` })),
  ...GARDEN_LAYOUT.mediumTrees.map((t, i) => ({ ...t, tag: `medium[${i}]` })),
  ...GARDEN_LAYOUT.palms.map((t, i) => ({ ...t, tag: `palm[${i}]` }))
];

for (let i = 0; i < allTrees.length; i++) {
  for (let j = i + 1; j < allTrees.length; j++) {
    const d = Math.hypot(allTrees[i].x - allTrees[j].x, allTrees[i].z - allTrees[j].z);
    if (d < 2.4) {
      violations.push(`Tree spacing too tight (${d.toFixed(2)}m) between ${allTrees[i].tag} and ${allTrees[j].tag}`);
    }
  }
}

for (let i = 0; i < GARDEN_LAYOUT.benches.length; i++) {
  const b = GARDEN_LAYOUT.benches[i];
  for (const t of allTrees) {
    const d = Math.hypot(b.x - t.x, b.z - t.z);
    if (d < 2.0) {
      violations.push(`Bench[${i}] (${b.x}, ${b.z}) too close (${d.toFixed(2)}m) to ${t.tag}`);
    }
  }
}

assert.equal(
  violations.length,
  0,
  `Garden layout violations:\n- ${violations.join('\n- ')}`
);

console.log(
  `PASS: ${GARDEN_LAYOUT.heroTrees.length} hero trees, ${GARDEN_LAYOUT.mediumTrees.length} medium trees, ${GARDEN_LAYOUT.palms.length} palms, ${GARDEN_LAYOUT.bushes.length} bushes, ${GARDEN_LAYOUT.benches.length} benches, ${GARDEN_LAYOUT.steppingStones.length} stepping stones verified with 0 violations.`
);
