import * as THREE from 'three';

// ============================================================================
// TEMPLE FAIR GARDENS — CURATED LAYOUT DATA (SOUTHEAST & SOUTHWEST/MID-WEST)
// ============================================================================

export const GARDEN_LAYOUT = {
  // Hero branching big trees with trunk fairy lights & hanging temple lanterns
  heroTrees: [
    // Garden A: Southeast (สวนริมศาลา-สระน้ำ)
    { x: 30.0, z: 35.0, scale: 1.12, rotY: 0.4, garden: 'SE' },
    { x: 44.5, z: 42.5, scale: 1.06, rotY: 1.7, garden: 'SE' },
    { x: 47.5, z: 25.5, scale: 1.04, rotY: 2.8, garden: 'SE' },
    { x: 22.5, z: 45.5, scale: 0.96, rotY: 4.1, garden: 'SE' },
    { x: 47.5, z: 11.5, scale: 1.0, rotY: 5.2, garden: 'SE' },

    // Garden B: Southwest & Mid-West (สวนโคมไฟหลังตลาด)
    { x: -32.0, z: 43.0, scale: 1.08, rotY: 0.9, garden: 'SW' },
    { x: -33.0, z: 24.5, scale: 1.04, rotY: 2.2, garden: 'SW' },
    { x: -19.0, z: 19.0, scale: 1.1, rotY: 3.6, garden: 'SW' },
    { x: -35.5, z: 11.5, scale: 0.96, rotY: 5.0, garden: 'SW' },

    // Garden C: Northeast (สวนร่มรื่นข้างอุโบสถ-ริมสระน้ำ)
    { x: 32.5, z: -45.5, scale: 1.1, rotY: 0.6, garden: 'NE' },
    { x: 46.5, z: -47.0, scale: 1.08, rotY: 2.1, garden: 'NE' },
    { x: 34.0, z: -34.5, scale: 1.02, rotY: 3.4, garden: 'NE' },
    { x: 47.5, z: -35.5, scale: 1.06, rotY: 4.9, garden: 'NE' }
  ],

  // Medium ornamental temple trees with warm ground uplights
  mediumTrees: [
    // Garden A (SE)
    { x: 21.5, z: 24.5, scale: 0.95, rotY: 0.6 },
    { x: 37.5, z: 25.0, scale: 1.02, rotY: 1.5 },
    { x: 22.0, z: 34.5, scale: 0.92, rotY: 2.4 },
    { x: 36.5, z: 48.0, scale: 1.05, rotY: 3.1 },
    { x: 52.5, z: 34.5, scale: 0.98, rotY: 4.3 },
    { x: 52.5, z: 48.5, scale: 0.94, rotY: 5.1 },
    { x: 42.5, z: 17.0, scale: 0.9, rotY: 1.1 },
    { x: 53.0, z: 18.0, scale: 0.96, rotY: 2.9 },
    { x: 11.5, z: 36.0, scale: 0.88, rotY: 0.3 },
    { x: 11.5, z: 26.5, scale: 0.88, rotY: 3.7 },

    // Garden B (SW & Mid-West)
    { x: -38.0, z: 49.0, scale: 0.96, rotY: 0.8 },
    { x: -26.5, z: 50.0, scale: 0.92, rotY: 1.9 },
    { x: -38.5, z: 34.5, scale: 1.0, rotY: 2.7 },
    { x: -26.0, z: 33.0, scale: 0.94, rotY: 4.0 },
    { x: -12.5, z: 26.5, scale: 0.95, rotY: 4.9 },
    { x: -26.5, z: 12.5, scale: 0.98, rotY: 0.5 },
    { x: -12.0, z: 11.5, scale: 0.92, rotY: 2.1 },
    { x: -22.5, z: 27.5, scale: 0.9, rotY: 3.4 },
    { x: -38.5, z: 18.5, scale: 0.96, rotY: 5.5 },

    // Garden C (NE — ข้างอุโบสถ-ริมสระน้ำ)
    { x: 27.2, z: -52.5, scale: 0.96, rotY: 0.7 },
    { x: 39.5, z: -52.5, scale: 1.02, rotY: 1.9 },
    { x: 52.5, z: -52.5, scale: 0.94, rotY: 3.1 },
    { x: 27.5, z: -39.5, scale: 0.98, rotY: 4.2 },
    { x: 40.5, z: -41.0, scale: 1.04, rotY: 5.3 },
    { x: 53.0, z: -41.5, scale: 0.96, rotY: 1.2 },
    { x: 27.2, z: -32.2, scale: 0.92, rotY: 2.5 },
    { x: 40.5, z: -31.0, scale: 0.94, rotY: 3.8 }
  ],

  // Tropical coconut / palm trees along walls and pond edge
  palms: [
    // Garden A (SE & pond south strip)
    { x: 43.0, z: 6.8, scale: 1.05, rotY: 0.5 },
    { x: 48.5, z: 6.5, scale: 1.12, rotY: 2.1 },
    { x: 53.8, z: 7.5, scale: 0.98, rotY: 3.7 },
    { x: 54.0, z: 13.5, scale: 1.06, rotY: 4.8 },
    { x: 54.0, z: 23.5, scale: 1.04, rotY: 1.2 },
    { x: 54.0, z: 41.0, scale: 1.1, rotY: 2.9 },
    { x: 47.0, z: 51.0, scale: 1.0, rotY: 4.2 },
    { x: 30.0, z: 51.0, scale: 1.04, rotY: 0.8 },
    { x: 19.5, z: 51.0, scale: 0.96, rotY: 5.4 },

    // Garden B (SW wall & corner)
    { x: -39.2, z: 43.0, scale: 1.08, rotY: 1.4 },
    { x: -39.2, z: 28.0, scale: 1.02, rotY: 2.6 },
    { x: -39.2, z: 14.0, scale: 1.06, rotY: 4.1 },
    { x: -33.0, z: 51.0, scale: 1.0, rotY: 0.4 },
    { x: -25.5, z: 41.0, scale: 0.95, rotY: 3.3 },
    { x: -30.5, z: 9.2, scale: 0.94, rotY: 5.1 },

    // Garden C (NE — ริมสระน้ำฝั่งเหนือ & แนวกำแพงหลัง-ขวา)
    { x: 37.5, z: -29.8, scale: 1.06, rotY: 1.1 },
    { x: 44.0, z: -29.8, scale: 1.12, rotY: 2.4 },
    { x: 49.8, z: -29.8, scale: 1.04, rotY: 3.9 },
    { x: 54.2, z: -30.5, scale: 1.08, rotY: 5.2 },
    { x: 54.2, z: -36.5, scale: 1.05, rotY: 0.7 },
    { x: 54.2, z: -46.8, scale: 1.02, rotY: 2.0 },
    { x: 50.0, z: -55.2, scale: 1.04, rotY: 3.4 },
    { x: 43.5, z: -55.2, scale: 1.1, rotY: 4.7 },
    { x: 34.5, z: -55.2, scale: 1.0, rotY: 0.3 }
  ],

  // Wooden benches placed at photogenic angles beneath hero trees
  benches: [
    // Garden A (SE)
    { x: 33.4, z: 36.8, rotY: -Math.PI * 0.72 },
    { x: 44.2, z: 27.6, rotY: Math.PI * 0.82 },
    // Garden B (SW & Mid-West)
    { x: -29.2, z: 40.6, rotY: -Math.PI * 0.28 },
    { x: -16.6, z: 21.8, rotY: Math.PI * 0.75 }
  ],

  // Low shrubs + marigold flower accents
  bushes: [
    // Garden A (SE)
    { x: 28.4, z: 33.4, scale: 1.0, flowers: true },
    { x: 31.8, z: 33.6, scale: 0.85, flowers: true },
    { x: 42.8, z: 41.2, scale: 1.05, flowers: true },
    { x: 46.2, z: 44.0, scale: 0.9, flowers: false },
    { x: 49.0, z: 24.0, scale: 1.0, flowers: true },
    { x: 46.0, z: 23.6, scale: 0.85, flowers: true },
    { x: 21.0, z: 44.0, scale: 0.95, flowers: true },
    { x: 24.2, z: 47.0, scale: 0.85, flowers: false },
    { x: 46.0, z: 10.2, scale: 1.0, flowers: true },
    { x: 49.2, z: 12.6, scale: 0.9, flowers: true },
    { x: 54.2, z: 30.0, scale: 1.15, flowers: false },
    { x: 54.2, z: 38.0, scale: 1.1, flowers: true },
    { x: 54.2, z: 45.5, scale: 1.1, flowers: false },
    { x: 51.0, z: 51.2, scale: 1.15, flowers: true },
    { x: 41.5, z: 51.2, scale: 1.1, flowers: false },
    { x: 33.5, z: 51.2, scale: 1.05, flowers: true },
    { x: 25.5, z: 51.2, scale: 1.0, flowers: false },
    { x: 20.5, z: 27.0, scale: 0.9, flowers: true },
    { x: 25.5, z: 22.8, scale: 0.95, flowers: true },
    { x: 34.0, z: 23.0, scale: 0.9, flowers: false },
    { x: 40.8, z: 21.8, scale: 0.95, flowers: true },
    { x: 41.8, z: 14.2, scale: 0.85, flowers: true },
    { x: 45.5, z: 7.4, scale: 0.95, flowers: true },
    { x: 51.2, z: 7.4, scale: 1.0, flowers: false },
    { x: 35.5, z: 38.2, scale: 0.82, flowers: true },
    { x: 42.4, z: 29.2, scale: 0.85, flowers: true },
    { x: 19.5, z: 38.5, scale: 0.9, flowers: false },
    { x: 26.8, z: 42.2, scale: 0.88, flowers: true },

    // Garden B (SW & Mid-West)
    { x: -33.6, z: 41.6, scale: 1.0, flowers: true },
    { x: -30.5, z: 44.6, scale: 0.88, flowers: true },
    { x: -34.6, z: 23.2, scale: 1.0, flowers: true },
    { x: -31.4, z: 26.0, scale: 0.85, flowers: false },
    { x: -20.6, z: 17.6, scale: 1.05, flowers: true },
    { x: -17.4, z: 17.5, scale: 0.88, flowers: true },
    { x: -37.0, z: 10.2, scale: 0.95, flowers: true },
    { x: -39.5, z: 47.0, scale: 1.15, flowers: false },
    { x: -39.5, z: 39.0, scale: 1.1, flowers: true },
    { x: -39.5, z: 31.5, scale: 1.1, flowers: false },
    { x: -39.5, z: 23.5, scale: 1.15, flowers: true },
    { x: -39.5, z: 16.0, scale: 1.05, flowers: false },
    { x: -36.2, z: 51.2, scale: 1.1, flowers: true },
    { x: -29.8, z: 51.2, scale: 1.05, flowers: false },
    { x: -24.5, z: 47.2, scale: 0.9, flowers: true },
    { x: -24.8, z: 36.2, scale: 0.88, flowers: true },
    { x: -28.0, z: 29.8, scale: 0.95, flowers: false },
    { x: -15.5, z: 29.2, scale: 0.9, flowers: true },
    { x: -9.8, z: 23.5, scale: 0.92, flowers: true },
    { x: -9.8, z: 15.5, scale: 0.9, flowers: false },
    { x: -15.5, z: 9.8, scale: 0.95, flowers: true },
    { x: -22.5, z: 9.8, scale: 0.9, flowers: false },
    { x: -28.2, z: 15.8, scale: 0.88, flowers: true },
    { x: -27.5, z: 41.8, scale: 0.82, flowers: true },

    // Garden C (NE — ข้างอุโบสถ-ริมสระน้ำ)
    { x: 30.8, z: -44.0, scale: 1.0, flowers: true },
    { x: 34.2, z: -47.0, scale: 0.88, flowers: true },
    { x: 44.8, z: -45.6, scale: 1.02, flowers: true },
    { x: 48.2, z: -48.4, scale: 0.9, flowers: false },
    { x: 32.4, z: -33.0, scale: 0.95, flowers: true },
    { x: 35.8, z: -35.8, scale: 0.86, flowers: true },
    { x: 45.8, z: -34.2, scale: 0.98, flowers: true },
    { x: 49.2, z: -36.8, scale: 0.88, flowers: false },
    { x: 36.2, z: -29.6, scale: 0.95, flowers: true },
    { x: 41.0, z: -29.4, scale: 1.0, flowers: true },
    { x: 46.8, z: -29.4, scale: 0.95, flowers: true },
    { x: 52.2, z: -29.6, scale: 1.0, flowers: true },
    { x: 54.4, z: -33.5, scale: 1.1, flowers: false },
    { x: 54.4, z: -41.5, scale: 1.1, flowers: true },
    { x: 54.4, z: -50.5, scale: 1.12, flowers: false },
    { x: 52.8, z: -55.4, scale: 1.1, flowers: true },
    { x: 46.8, z: -55.4, scale: 1.08, flowers: false },
    { x: 39.2, z: -55.4, scale: 1.1, flowers: true },
    { x: 30.8, z: -55.4, scale: 1.05, flowers: true },
    { x: 26.2, z: -48.0, scale: 0.95, flowers: true },
    { x: 26.2, z: -35.5, scale: 0.95, flowers: false },
    { x: 31.5, z: -31.8, scale: 0.9, flowers: true }
  ],

  // Curved stepping-stone garden walkways
  steppingStones: [
    // Garden A (SE): curves from near Soidaw/parking -> central hero tree -> behind Sala -> near pond
    { x: 19.5, z: 28.0 }, { x: 21.2, z: 29.4 }, { x: 23.0, z: 30.8 },
    { x: 24.9, z: 32.1 }, { x: 26.8, z: 33.4 }, { x: 28.6, z: 34.8 },
    { x: 30.5, z: 36.3 }, { x: 32.5, z: 37.5 }, { x: 34.7, z: 38.2 },
    { x: 37.0, z: 38.4 }, { x: 39.2, z: 37.8 }, { x: 41.1, z: 36.5 },
    { x: 42.6, z: 34.6 }, { x: 43.6, z: 32.5 }, { x: 44.3, z: 30.2 },
    { x: 44.7, z: 27.9 }, { x: 44.8, z: 25.5 }, { x: 44.8, z: 23.1 },
    { x: 45.0, z: 20.7 }, { x: 45.2, z: 18.3 }, { x: 45.4, z: 15.9 },
    { x: 45.5, z: 13.5 }, { x: 45.4, z: 11.1 }, { x: 45.2, z: 8.8 },
    // Short spur toward south-east hero tree
    { x: 39.8, z: 39.6 }, { x: 41.3, z: 41.1 }, { x: 42.8, z: 42.6 },

    // Garden B (SW & Mid-West): curves from west of left parking -> SW hero tree -> into mid-west pocket lawn
    { x: -24.5, z: 45.0 }, { x: -26.2, z: 44.0 }, { x: -28.0, z: 42.8 },
    { x: -29.8, z: 41.2 }, { x: -31.1, z: 39.2 }, { x: -31.8, z: 37.0 },
    { x: -31.6, z: 34.6 }, { x: -30.8, z: 32.4 }, { x: -29.6, z: 30.3 },
    { x: -28.2, z: 28.3 }, { x: -26.6, z: 26.5 }, { x: -24.8, z: 24.9 },
    { x: -22.9, z: 23.5 }, { x: -20.8, z: 22.3 }, { x: -18.7, z: 21.1 },
    { x: -16.8, z: 19.6 }, { x: -15.3, z: 17.8 }, { x: -14.2, z: 15.7 },
    { x: -13.5, z: 13.5 }
  ],

  // 3 warm festive garden point lights (1 per garden: SE, SW, NE)
  gardenLights: [
    { x: 35.0, y: 4.8, z: 34.0, color: 0xffbe66, intensity: 34, distance: 34 },
    { x: -27.0, y: 4.8, z: 29.0, color: 0xffbe66, intensity: 34, distance: 34 },
    { x: 40.5, y: 4.8, z: -41.5, color: 0xffbe66, intensity: 34, distance: 34 }
  ]
};

// ============================================================================
// SOFT GLOW CANVAS TEXTURES (UPLIGHTS & FIREFLIES)
// ============================================================================

function createRadialGlowTexture(innerRgba, midRgba, outerRgba) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, innerRgba);
  grad.addColorStop(0.45, midRgba);
  grad.addColorStop(1, outerRgba);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ============================================================================
// INSTANCED GARDEN BUILDER
// ============================================================================

export function buildTempleGardens(scene, addCollisionBox, lowGraphics = false) {
  const root = new THREE.Group();
  root.name = 'TempleFairGardens';
  const shadowCasters = [];
  const dummy = new THREE.Object3D();

  // Shared PBR materials
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x4e3524, roughness: 0.92 });
  const palmBarkMat = new THREE.MeshStandardMaterial({ color: 0x6b4f3a, roughness: 0.9 });
  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x071f10,
    emissiveIntensity: 0.42,
    roughness: 0.78
  });
  const palmFrondMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x082111,
    emissiveIntensity: 0.35,
    roughness: 0.72,
    side: THREE.DoubleSide
  });
  const bushMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x072010,
    emissiveIntensity: 0.35,
    roughness: 0.82
  });
  const flowerMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xd97706,
    emissiveIntensity: 0.55,
    roughness: 0.55
  });
  const fairyBulbMat = new THREE.MeshBasicMaterial({ color: 0xffe49e });
  const lanternBodyMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const lanternCapMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.8 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.92 });
  const woodBenchMat = new THREE.MeshStandardMaterial({ color: 0x854d27, roughness: 0.8 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.55, roughness: 0.5 });

  const foliageShades = [
    new THREE.Color(0x1b6335),
    new THREE.Color(0x237a43),
    new THREE.Color(0x2c8c4f),
    new THREE.Color(0x16522d),
    new THREE.Color(0x329655)
  ];
  const lanternPalette = [
    new THREE.Color(0xffca3a), // warm gold
    new THREE.Color(0xfb7185), // lotus pink
    new THREE.Color(0xfb923c), // marigold orange
    new THREE.Color(0xfef08a)  // cream lantern
  ];
  const flowerPalette = [
    new THREE.Color(0xfacc15),
    new THREE.Color(0xf97316),
    new THREE.Color(0xfde047)
  ];

  // --------------------------------------------------------------------------
  // 1. HERO BIG BRANCHING TREES (Trunks + Branches + Multi-Lobe Canopy + Fairy Lights + Hanging Lanterns)
  // --------------------------------------------------------------------------
  const heroTrees = GARDEN_LAYOUT.heroTrees;
  const heroCount = heroTrees.length;

  const heroTrunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.24, 0.42, 3.2, 8), barkMat, heroCount);
  const heroRoots = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.36, 0.58, 0.5, 7), barkMat, heroCount);
  const heroBranches = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1, 0.19, 2.2, 6), barkMat, heroCount * 4);
  const heroCanopies = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1.0, 1), foliageMat, heroCount * 7);

  const FAIRY_PER_TREE = 18;
  const heroFairyLights = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.055, 6, 6),
    fairyBulbMat,
    heroCount * FAIRY_PER_TREE
  );

  const LANTERNS_PER_TREE = 4;
  const lanternCount = heroCount * LANTERNS_PER_TREE;
  const lanternCords = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.012, 0.012, 0.72, 4), lanternCapMat, lanternCount);
  const lanternBodies = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.15, 0.12, 0.34, 8), lanternBodyMat, lanternCount);
  const lanternCaps = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 8), lanternCapMat, lanternCount * 2);
  const lanternMeta = [];

  const canopyOffsets = [
    { x: 0.0, y: 4.95, z: 0.0, rx: 2.35, ry: 1.42, rz: 2.35 },
    { x: 1.55, y: 4.35, z: 0.65, rx: 1.65, ry: 1.1, rz: 1.65 },
    { x: -1.5, y: 4.4, z: 0.75, rx: 1.7, ry: 1.12, rz: 1.6 },
    { x: 0.45, y: 4.3, z: -1.6, rx: 1.68, ry: 1.08, rz: 1.65 },
    { x: -1.25, y: 4.25, z: -1.2, rx: 1.55, ry: 1.05, rz: 1.55 },
    { x: 1.25, y: 4.55, z: -0.95, rx: 1.4, ry: 1.0, rz: 1.4 },
    { x: -0.35, y: 5.45, z: 0.25, rx: 1.65, ry: 1.05, rz: 1.65 }
  ];

  let branchIdx = 0;
  let canopyIdx = 0;
  let fairyIdx = 0;
  let lanIdx = 0;

  heroTrees.forEach((t, i) => {
    const s = t.scale || 1.0;

    // Trunk collision (only trunk core, canopy remains walkable)
    addCollisionBox(t.x - 0.45 * s, t.x + 0.45 * s, t.z - 0.45 * s, t.z + 0.45 * s, `garden-hero-${i}`);

    // Trunk
    dummy.position.set(t.x, 1.6 * s, t.z);
    dummy.rotation.set(0, t.rotY, 0);
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    heroTrunks.setMatrixAt(i, dummy.matrix);

    // Root flare
    dummy.position.set(t.x, 0.24 * s, t.z);
    dummy.rotation.set(0, t.rotY + 0.3, 0);
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    heroRoots.setMatrixAt(i, dummy.matrix);

    // 4 angled branches
    for (let b = 0; b < 4; b++) {
      const ang = t.rotY + (b / 4) * Math.PI * 2 + 0.25;
      const dist = 0.65 * s;
      dummy.position.set(t.x + Math.cos(ang) * dist, 3.35 * s, t.z + Math.sin(ang) * dist);
      dummy.rotation.set(0, -ang, 0);
      dummy.rotateZ(-0.62);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      heroBranches.setMatrixAt(branchIdx++, dummy.matrix);
    }

    // 7 layered canopy puffs
    const cosR = Math.cos(t.rotY);
    const sinR = Math.sin(t.rotY);
    for (let c = 0; c < canopyOffsets.length; c++) {
      const o = canopyOffsets[c];
      const wx = t.x + (o.x * cosR - o.z * sinR) * s;
      const wz = t.z + (o.x * sinR + o.z * cosR) * s;
      dummy.position.set(wx, o.y * s, wz);
      dummy.rotation.set(c * 0.4, t.rotY + c * 0.9, c * 0.2);
      dummy.scale.set(o.rx * s, o.ry * s, o.rz * s);
      dummy.updateMatrix();
      heroCanopies.setMatrixAt(canopyIdx, dummy.matrix);
      heroCanopies.setColorAt(canopyIdx, foliageShades[(i + c) % foliageShades.length]);
      canopyIdx++;
    }

    // Spiral warm-white fairy light wrap around trunk
    for (let f = 0; f < FAIRY_PER_TREE; f++) {
      const u = f / (FAIRY_PER_TREE - 1);
      const y = (0.55 + u * 2.55) * s;
      const r = (0.43 - u * 0.16) * s;
      const theta = t.rotY + u * Math.PI * 6.5;
      dummy.position.set(t.x + Math.cos(theta) * r, y, t.z + Math.sin(theta) * r);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      heroFairyLights.setMatrixAt(fairyIdx++, dummy.matrix);
    }

    // 4 hanging temple-fair lanterns suspended under outer canopy
    for (let l = 0; l < LANTERNS_PER_TREE; l++) {
      const ang = t.rotY + (l / LANTERNS_PER_TREE) * Math.PI * 2 + 0.55;
      const rad = (1.75 + (l % 2) * 0.45) * s;
      const anchorX = t.x + Math.cos(ang) * rad;
      const anchorZ = t.z + Math.sin(ang) * rad;
      const anchorY = (3.65 + (l % 2) * 0.2) * s;
      const color = lanternPalette[(i + l) % lanternPalette.length];

      lanternMeta.push({
        idx: lanIdx,
        anchorX,
        anchorY,
        anchorZ,
        phase: i * 1.3 + l * 1.7,
        scale: s
      });

      lanternBodies.setColorAt(lanIdx, color);
      lanIdx++;
    }
  });

  heroTrunks.instanceMatrix.needsUpdate = true;
  heroRoots.instanceMatrix.needsUpdate = true;
  heroBranches.instanceMatrix.needsUpdate = true;
  heroCanopies.instanceMatrix.needsUpdate = true;
  if (heroCanopies.instanceColor) heroCanopies.instanceColor.needsUpdate = true;
  heroFairyLights.instanceMatrix.needsUpdate = true;
  if (lanternBodies.instanceColor) lanternBodies.instanceColor.needsUpdate = true;

  root.add(
    heroTrunks,
    heroRoots,
    heroBranches,
    heroCanopies,
    heroFairyLights,
    lanternCords,
    lanternBodies,
    lanternCaps
  );
  shadowCasters.push(heroTrunks, heroBranches, heroCanopies);

  // --------------------------------------------------------------------------
  // 2. MEDIUM ORNAMENTAL TEMPLE TREES
  // --------------------------------------------------------------------------
  const mediumTrees = GARDEN_LAYOUT.mediumTrees;
  const medCount = mediumTrees.length;

  const medTrunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.13, 0.24, 2.35, 7), barkMat, medCount);
  const medCanopies = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.0, 1), foliageMat, medCount * 4);

  const medOffsets = [
    { x: 0.0, y: 3.15, z: 0.0, rx: 1.45, ry: 1.15, rz: 1.45 },
    { x: 0.85, y: 2.75, z: 0.45, rx: 1.0, ry: 0.82, rz: 1.0 },
    { x: -0.82, y: 2.8, z: 0.35, rx: 0.98, ry: 0.8, rz: 0.98 },
    { x: 0.05, y: 2.75, z: -0.85, rx: 1.02, ry: 0.82, rz: 1.0 }
  ];

  let medCanopyIdx = 0;
  mediumTrees.forEach((t, i) => {
    const s = t.scale || 1.0;
    addCollisionBox(t.x - 0.32 * s, t.x + 0.32 * s, t.z - 0.32 * s, t.z + 0.32 * s, `garden-med-${i}`);

    dummy.position.set(t.x, 1.175 * s, t.z);
    dummy.rotation.set(0, t.rotY, 0);
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    medTrunks.setMatrixAt(i, dummy.matrix);

    const cosR = Math.cos(t.rotY);
    const sinR = Math.sin(t.rotY);
    for (let c = 0; c < medOffsets.length; c++) {
      const o = medOffsets[c];
      dummy.position.set(
        t.x + (o.x * cosR - o.z * sinR) * s,
        o.y * s,
        t.z + (o.x * sinR + o.z * cosR) * s
      );
      dummy.rotation.set(c * 0.3, t.rotY + c * 1.1, 0);
      dummy.scale.set(o.rx * s, o.ry * s, o.rz * s);
      dummy.updateMatrix();
      medCanopies.setMatrixAt(medCanopyIdx, dummy.matrix);
      medCanopies.setColorAt(medCanopyIdx, foliageShades[(i + c + 1) % foliageShades.length]);
      medCanopyIdx++;
    }
  });

  medTrunks.instanceMatrix.needsUpdate = true;
  medCanopies.instanceMatrix.needsUpdate = true;
  if (medCanopies.instanceColor) medCanopies.instanceColor.needsUpdate = true;
  root.add(medTrunks, medCanopies);
  shadowCasters.push(medTrunks, medCanopies);

  // --------------------------------------------------------------------------
  // 3. TROPICAL COCONUT / PALM TREES
  // --------------------------------------------------------------------------
  const palms = GARDEN_LAYOUT.palms;
  const palmCount = palms.length;
  const SEGMENTS = 5;
  const FRONDS = 7;

  const palmTrunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.11, 0.17, 1.18, 7), palmBarkMat, palmCount * SEGMENTS);
  const palmCoconuts = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.14, 7, 7),
    new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.75 }),
    palmCount * 3
  );
  // Two-piece arched palm frond (inner + outer tip)
  const palmFrondsInner = new THREE.InstancedMesh(new THREE.ConeGeometry(0.32, 1.8, 4), palmFrondMat, palmCount * FRONDS);
  const palmFrondsOuter = new THREE.InstancedMesh(new THREE.ConeGeometry(0.24, 1.5, 4), palmFrondMat, palmCount * FRONDS);

  let segIdx = 0;
  let nutIdx = 0;
  let frondIdx = 0;

  palms.forEach((p, i) => {
    const s = p.scale || 1.0;
    addCollisionBox(p.x - 0.3 * s, p.x + 0.3 * s, p.z - 0.3 * s, p.z + 0.3 * s, `garden-palm-${i}`);

    const leanDirX = Math.cos(p.rotY);
    const leanDirZ = Math.sin(p.rotY);
    let curX = p.x;
    let curY = 0;
    let curZ = p.z;

    for (let seg = 0; seg < SEGMENTS; seg++) {
      const tilt = (seg + 0.5) * 0.045;
      const segLen = 1.08 * s;
      const nextX = curX + leanDirX * Math.sin(tilt) * segLen;
      const nextY = curY + Math.cos(tilt) * segLen;
      const nextZ = curZ + leanDirZ * Math.sin(tilt) * segLen;

      dummy.position.set((curX + nextX) * 0.5, (curY + nextY) * 0.5, (curZ + nextZ) * 0.5);
      dummy.rotation.set(0, -p.rotY, 0);
      dummy.rotateZ(-tilt);
      const taper = 1 - seg * 0.08;
      dummy.scale.set(s * taper, s, s * taper);
      dummy.updateMatrix();
      palmTrunks.setMatrixAt(segIdx++, dummy.matrix);

      curX = nextX;
      curY = nextY;
      curZ = nextZ;
    }

    // 3 coconuts clustered beneath crown
    for (let n = 0; n < 3; n++) {
      const na = p.rotY + (n / 3) * Math.PI * 2;
      dummy.position.set(curX + Math.cos(na) * 0.16 * s, curY - 0.15 * s, curZ + Math.sin(na) * 0.16 * s);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      palmCoconuts.setMatrixAt(nutIdx++, dummy.matrix);
    }

    // 7 arching palm fronds
    for (let f = 0; f < FRONDS; f++) {
      const fa = p.rotY + (f / FRONDS) * Math.PI * 2;
      const fx = Math.cos(fa);
      const fz = Math.sin(fa);
      const frondColor = foliageShades[(i + f + 2) % foliageShades.length];

      // Inner arch (rises slightly outward)
      dummy.position.set(curX + fx * 0.85 * s, curY + 0.18 * s, curZ + fz * 0.85 * s);
      dummy.rotation.set(0, -fa, 0);
      dummy.rotateZ(-1.32);
      dummy.scale.set(s * 0.35, s, s);
      dummy.updateMatrix();
      palmFrondsInner.setMatrixAt(frondIdx, dummy.matrix);
      palmFrondsInner.setColorAt(frondIdx, frondColor);

      // Outer droop (curves downward gracefully)
      dummy.position.set(curX + fx * 2.05 * s, curY - 0.16 * s, curZ + fz * 2.05 * s);
      dummy.rotation.set(0, -fa, 0);
      dummy.rotateZ(-2.05);
      dummy.scale.set(s * 0.3, s, s);
      dummy.updateMatrix();
      palmFrondsOuter.setMatrixAt(frondIdx, dummy.matrix);
      palmFrondsOuter.setColorAt(frondIdx, frondColor);
      frondIdx++;
    }
  });

  palmTrunks.instanceMatrix.needsUpdate = true;
  palmCoconuts.instanceMatrix.needsUpdate = true;
  palmFrondsInner.instanceMatrix.needsUpdate = true;
  if (palmFrondsInner.instanceColor) palmFrondsInner.instanceColor.needsUpdate = true;
  palmFrondsOuter.instanceMatrix.needsUpdate = true;
  if (palmFrondsOuter.instanceColor) palmFrondsOuter.instanceColor.needsUpdate = true;
  root.add(palmTrunks, palmCoconuts, palmFrondsInner, palmFrondsOuter);
  shadowCasters.push(palmTrunks, palmFrondsInner, palmFrondsOuter);

  // --------------------------------------------------------------------------
  // 4. WARM GROUND UPLIGHTS (Hero + Medium Trees)
  // --------------------------------------------------------------------------
  const uplightTex = createRadialGlowTexture(
    'rgba(255, 224, 130, 0.55)',
    'rgba(245, 158, 11, 0.22)',
    'rgba(245, 158, 11, 0)'
  );
  const uplightMat = new THREE.MeshBasicMaterial({
    map: uplightTex,
    color: 0xffd580,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const uplightSources = [
    ...heroTrees.map((t) => ({ x: t.x, z: t.z, r: 3.1 * (t.scale || 1) })),
    ...mediumTrees.map((t) => ({ x: t.x, z: t.z, r: 1.9 * (t.scale || 1) }))
  ];
  const uplights = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), uplightMat, uplightSources.length);
  uplightSources.forEach((u, i) => {
    dummy.position.set(u.x, 0.032, u.z);
    dummy.rotation.set(-Math.PI / 2, 0, 0);
    dummy.scale.set(u.r * 2, u.r * 2, 1);
    dummy.updateMatrix();
    uplights.setMatrixAt(i, dummy.matrix);
  });
  uplights.instanceMatrix.needsUpdate = true;
  root.add(uplights);

  // --------------------------------------------------------------------------
  // 5. LOW BUSHES & MARIGOLD FLOWER CLUSTERS
  // --------------------------------------------------------------------------
  const bushes = GARDEN_LAYOUT.bushes;
  const bushMesh = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.62, 1), bushMat, bushes.length * 2);
  const flowerBushes = bushes.filter((b) => b.flowers);
  const flowerMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.095, 6, 6), flowerMat, flowerBushes.length * 4);

  let bushIdx = 0;
  let flwIdx = 0;
  bushes.forEach((b, i) => {
    const s = b.scale || 1.0;
    // Main shrub puff
    dummy.position.set(b.x, 0.36 * s, b.z);
    dummy.rotation.set(0, i * 0.9, 0);
    dummy.scale.set(1.15 * s, 0.72 * s, 1.05 * s);
    dummy.updateMatrix();
    bushMesh.setMatrixAt(bushIdx, dummy.matrix);
    bushMesh.setColorAt(bushIdx, foliageShades[i % foliageShades.length]);
    bushIdx++;

    // Companion smaller puff
    const ox = Math.cos(i * 1.7) * 0.45 * s;
    const oz = Math.sin(i * 1.7) * 0.45 * s;
    dummy.position.set(b.x + ox, 0.28 * s, b.z + oz);
    dummy.rotation.set(0.2, i * 1.4, 0);
    dummy.scale.set(0.8 * s, 0.58 * s, 0.78 * s);
    dummy.updateMatrix();
    bushMesh.setMatrixAt(bushIdx, dummy.matrix);
    bushMesh.setColorAt(bushIdx, foliageShades[(i + 2) % foliageShades.length]);
    bushIdx++;

    if (b.flowers) {
      for (let f = 0; f < 4; f++) {
        const fa = i * 0.7 + (f / 4) * Math.PI * 2;
        const fr = 0.28 * s;
        dummy.position.set(
          b.x + Math.cos(fa) * fr,
          (0.62 + (f % 2) * 0.08) * s,
          b.z + Math.sin(fa) * fr
        );
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        flowerMesh.setMatrixAt(flwIdx, dummy.matrix);
        flowerMesh.setColorAt(flwIdx, flowerPalette[(i + f) % flowerPalette.length]);
        flwIdx++;
      }
    }
  });
  bushMesh.instanceMatrix.needsUpdate = true;
  if (bushMesh.instanceColor) bushMesh.instanceColor.needsUpdate = true;
  flowerMesh.instanceMatrix.needsUpdate = true;
  if (flowerMesh.instanceColor) flowerMesh.instanceColor.needsUpdate = true;
  root.add(bushMesh, flowerMesh);

  // --------------------------------------------------------------------------
  // 6. CURVED STEPPING-STONE WALKWAYS
  // --------------------------------------------------------------------------
  const stones = GARDEN_LAYOUT.steppingStones;
  const stoneMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.42, 0.47, 0.06, 8), stoneMat, stones.length);
  stones.forEach((st, i) => {
    const sx = 1.0 + Math.sin(i * 2.1) * 0.14;
    const sz = 0.88 + Math.cos(i * 1.7) * 0.14;
    dummy.position.set(st.x, 0.025, st.z);
    dummy.rotation.set(0, i * 0.65, 0);
    dummy.scale.set(sx, 1, sz);
    dummy.updateMatrix();
    stoneMesh.setMatrixAt(i, dummy.matrix);
  });
  stoneMesh.instanceMatrix.needsUpdate = true;
  stoneMesh.receiveShadow = true;
  root.add(stoneMesh);

  // --------------------------------------------------------------------------
  // 7. WOODEN GARDEN BENCHES (Photo Spots)
  // --------------------------------------------------------------------------
  const benches = GARDEN_LAYOUT.benches;
  const benchCount = benches.length;
  const benchSeats = new THREE.InstancedMesh(new THREE.BoxGeometry(1.75, 0.08, 0.52), woodBenchMat, benchCount);
  const benchBacks = new THREE.InstancedMesh(new THREE.BoxGeometry(1.75, 0.42, 0.07), woodBenchMat, benchCount);
  const benchLegs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.46, 0.48), ironMat, benchCount * 2);

  benches.forEach((b, i) => {
    // Compact collision box around bench
    addCollisionBox(b.x - 0.85, b.x + 0.85, b.z - 0.6, b.z + 0.6, `garden-bench-${i}`);

    const cosR = Math.cos(b.rotY);
    const sinR = Math.sin(b.rotY);

    // Seat plank
    dummy.position.set(b.x, 0.46, b.z);
    dummy.rotation.set(0, b.rotY, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    benchSeats.setMatrixAt(i, dummy.matrix);

    // Backrest angled slightly behind seat
    dummy.position.set(b.x - sinR * 0.24, 0.74, b.z - cosR * 0.24);
    dummy.rotation.set(0, b.rotY, 0);
    dummy.rotateX(-0.18);
    dummy.updateMatrix();
    benchBacks.setMatrixAt(i, dummy.matrix);

    // Left & right iron legs
    for (let side = 0; side < 2; side++) {
      const lx = side === 0 ? -0.72 : 0.72;
      dummy.position.set(b.x + lx * cosR, 0.23, b.z - lx * sinR);
      dummy.rotation.set(0, b.rotY, 0);
      dummy.updateMatrix();
      benchLegs.setMatrixAt(i * 2 + side, dummy.matrix);
    }
  });
  benchSeats.instanceMatrix.needsUpdate = true;
  benchBacks.instanceMatrix.needsUpdate = true;
  benchLegs.instanceMatrix.needsUpdate = true;
  root.add(benchSeats, benchBacks, benchLegs);
  shadowCasters.push(benchSeats, benchBacks);

  // --------------------------------------------------------------------------
  // 8. ANIMATED FIREFLIES (Points with Radial Glow)
  // --------------------------------------------------------------------------
  const MAX_FIREFLIES = 125;
  const fireflyBase = [];
  const fireflyPos = new Float32Array(MAX_FIREFLIES * 3);

  for (let i = 0; i < MAX_FIREFLIES; i++) {
    // Spread across Garden A (SE), Garden B (SW/Mid-West), and Garden C (NE)
    let fx;
    let fz;
    if (i < 50) {
      if (i < 38) {
        fx = 19.5 + Math.random() * 34.5;
        fz = 22.0 + Math.random() * 29.0;
      } else {
        fx = 41.5 + Math.random() * 12.5;
        fz = 7.0 + Math.random() * 14.5;
      }
    } else if (i < 72) {
      fx = -39.0 + Math.random() * 13.5;
      fz = 9.0 + Math.random() * 41.5;
    } else if (i < 90) {
      fx = -30.5 + Math.random() * 19.5;
      fz = 10.0 + Math.random() * 19.5;
    } else {
      fx = 26.5 + Math.random() * 27.5;
      fz = -55.0 + Math.random() * 25.0;
    }
    const fy = 0.7 + Math.random() * 3.1;
    fireflyBase.push({
      x: fx,
      y: fy,
      z: fz,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 0.7,
      radius: 0.45 + Math.random() * 0.65
    });
    fireflyPos[i * 3] = fx;
    fireflyPos[i * 3 + 1] = fy;
    fireflyPos[i * 3 + 2] = fz;
  }

  const fireflyGeo = new THREE.BufferGeometry();
  fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPos, 3));
  const fireflyTex = createRadialGlowTexture(
    'rgba(255, 250, 190, 1.0)',
    'rgba(250, 204, 21, 0.55)',
    'rgba(250, 204, 21, 0)'
  );
  const fireflyMat = new THREE.PointsMaterial({
    map: fireflyTex,
    color: 0xfef08a,
    size: 0.42,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
  fireflies.frustumCulled = false;
  root.add(fireflies);

  // --------------------------------------------------------------------------
  // 9. WARM ATMOSPHERE NOTE: Uplight decals + fairy lights + lanterns illuminate
  //    the gardens at zero dynamic PointLight shader cost for high mobile FPS.
  // --------------------------------------------------------------------------

  scene.add(root);

  const gardenState = {
    root,
    shadowCasters,
    lanternCords,
    lanternBodies,
    lanternCaps,
    lanternMeta,
    fireflies,
    fireflyBase,
    fireflyMat,
    maxFireflies: MAX_FIREFLIES,
    dummy: new THREE.Object3D()
  };

  // Position hanging lanterns at t = 0 and apply initial graphics mode
  updateTempleGardens(gardenState, 0, 0);
  setGardenGraphicsMode(gardenState, lowGraphics);

  return gardenState;
}

// ============================================================================
// RUNTIME GRAPHICS MODE, ANIMATION & MINIMAP HOOKS
// ============================================================================

export function setGardenGraphicsMode(gardenState, lowGraphics) {
  if (!gardenState) return;
  const low = Boolean(lowGraphics);
  for (const mesh of gardenState.shadowCasters) {
    mesh.castShadow = !low;
    mesh.receiveShadow = true;
  }
  if (gardenState.fireflies) {
    gardenState.fireflies.geometry.setDrawRange(0, low ? 40 : gardenState.maxFireflies);
  }
}

export function updateTempleGardens(gardenState, _dt, elapsed) {
  if (!gardenState) return;
  const { dummy, lanternMeta, lanternCords, lanternBodies, lanternCaps } = gardenState;

  // Gentle breeze sway on hanging temple-fair lanterns
  for (let i = 0; i < lanternMeta.length; i++) {
    const m = lanternMeta[i];
    const s = m.scale;
    const swayX = Math.sin(elapsed * 1.15 + m.phase) * 0.08 * s;
    const swayZ = Math.cos(elapsed * 0.95 + m.phase) * 0.06 * s;

    // Cord from canopy down to lantern
    dummy.position.set(m.anchorX + swayX * 0.5, m.anchorY - 0.36 * s, m.anchorZ + swayZ * 0.5);
    dummy.rotation.set(swayZ * 0.8, 0, -swayX * 0.8);
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    lanternCords.setMatrixAt(m.idx, dummy.matrix);

    // Glowing lantern body
    const bodyX = m.anchorX + swayX;
    const bodyY = m.anchorY - 0.84 * s;
    const bodyZ = m.anchorZ + swayZ;
    dummy.position.set(bodyX, bodyY, bodyZ);
    dummy.rotation.set(swayZ * 0.8, elapsed * 0.25 + m.phase, -swayX * 0.8);
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    lanternBodies.setMatrixAt(m.idx, dummy.matrix);

    // Top & bottom lantern caps
    dummy.position.set(bodyX, bodyY + 0.18 * s, bodyZ);
    dummy.updateMatrix();
    lanternCaps.setMatrixAt(m.idx * 2, dummy.matrix);

    dummy.position.set(bodyX, bodyY - 0.18 * s, bodyZ);
    dummy.updateMatrix();
    lanternCaps.setMatrixAt(m.idx * 2 + 1, dummy.matrix);
  }
  lanternCords.instanceMatrix.needsUpdate = true;
  lanternBodies.instanceMatrix.needsUpdate = true;
  lanternCaps.instanceMatrix.needsUpdate = true;

  // Soft firefly floating & warm twinkle
  if (gardenState.fireflies) {
    const posAttr = gardenState.fireflies.geometry.attributes.position;
    const drawCount = gardenState.fireflies.geometry.drawRange.count;
    const count = Number.isFinite(drawCount)
      ? Math.min(drawCount, gardenState.fireflyBase.length)
      : gardenState.fireflyBase.length;

    for (let i = 0; i < count; i++) {
      const b = gardenState.fireflyBase[i];
      const t = elapsed * b.speed + b.phase;
      posAttr.setXYZ(
        i,
        b.x + Math.sin(t) * b.radius,
        b.y + Math.sin(t * 1.45) * 0.35,
        b.z + Math.cos(t * 0.85) * b.radius
      );
    }
    posAttr.needsUpdate = true;
    gardenState.fireflyMat.opacity = 0.72 + Math.sin(elapsed * 2.4) * 0.22;
  }
}

export function drawGardenMinimap(ctx, mapX, mapY) {
  ctx.save();

  // Medium trees & palms (soft forest green)
  ctx.fillStyle = 'rgba(34, 197, 94, 0.55)';
  for (const t of GARDEN_LAYOUT.mediumTrees) {
    ctx.beginPath();
    ctx.arc(mapX(t.x), mapY(t.z), 2.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(74, 222, 128, 0.55)';
  for (const p of GARDEN_LAYOUT.palms) {
    ctx.beginPath();
    ctx.arc(mapX(p.x), mapY(p.z), 2.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hero lit trees (larger emerald canopy + tiny gold lantern core)
  for (const h of GARDEN_LAYOUT.heroTrees) {
    const sx = mapX(h.x);
    const sy = mapY(h.z);
    ctx.fillStyle = 'rgba(22, 163, 74, 0.85)';
    ctx.beginPath();
    ctx.arc(sx, sy, 3.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(sx, sy, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
