import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ============================================================================
// VENDOR MARKET — 77 Authentic Thai Temple Fair Stalls + 77 Animated Vendors
// + 3D Street Food / Game Props + Thai Shop Signs + Handheld Festival Items
// Engineered with InstancedMesh + Texture Atlas (~18 draw calls total!)
// ============================================================================

export const VENDOR_PROP_META = {
  meatball: { name: 'ลูกชิ้นปิ้ง', emoji: '🍢', edible: true, verb: 'กิน', verbEmoji: '😋', lines: ['😋 อร่อยจัง! ลูกชิ้นร้อน ๆ', '🍢 น้ำจิ้มแซ่บมาก!', '😋 อิ่มอร่อยหมดไม้แล้ว!'] },
  cotton_candy: { name: 'สายไหมพาสเทล', emoji: '🍭', edible: true, verb: 'กิน', verbEmoji: '😋', lines: ['🍭 หวานหอมละมุนลิ้น!', '😋 สายไหมฟูอร่อยมาก!', '✨ กินสายไหมหมดแล้ว!'] },
  drink: { name: 'ชานม-น้ำลำไย', emoji: '🧋', edible: true, verb: 'ดื่ม', verbEmoji: '🧋', lines: ['🧋 อึก ๆ เย็นชื่นใจ!', '😋 หอมหวานสดชื่นจัง!', '🧋 ดื่มหมดแก้วแล้ว สดชื่น!'] },
  glowstick: { name: 'แท่งไฟเชียร์', emoji: '✨', edible: false },
  balloon: { name: 'ลูกโป่งสวรรค์', emoji: '🎈', edible: false }
};

// 16 distinct Thai temple fair shop templates mapped into a 4x4 Sign Texture Atlas
const SHOP_TEMPLATES = [
  {
    id: 0,
    type: 'grill',
    signTitle: 'ลูกชิ้นปิ้ง 10.-',
    signSub: 'น้ำจิ้มมะขามแซ่บ',
    bg: '#991b1b',
    accent: '#fde047',
    prop: 'meatball',
    action: 'cook',
    callout: '🍢 ลูกชิ้นร้อน ๆ จ้า ไม้ละ 10 บาท!'
  },
  {
    id: 1,
    type: 'grill',
    signTitle: 'หมึกย่างสด ๆ',
    signSub: 'น้ำจิ้มซีฟู้ดรสเด็ด',
    bg: '#9a3412',
    accent: '#fef08a',
    prop: 'meatball',
    action: 'cook',
    callout: '🦑 หมึกย่างหอม ๆ น้ำจิ้มแซ่บเลยจ้า!'
  },
  {
    id: 2,
    type: 'cotton',
    signTitle: 'สายไหมพาสเทล',
    signSub: 'หวานหอม สีสวยสดใส',
    bg: '#be185d',
    accent: '#fbcfe8',
    prop: 'cotton_candy',
    action: 'wave',
    callout: '🍭 สายไหมหวาน ๆ ถือถ่ายรูปสวยมากจ้า!'
  },
  {
    id: 3,
    type: 'drink',
    signTitle: 'น้ำลำไยสด',
    signSub: 'เย็นชื่นใจ แก้วละ 20.-',
    bg: '#92400e',
    accent: '#fde68a',
    prop: 'drink',
    action: 'serve',
    callout: '🧋 น้ำลำไยสดหวานเย็น ชื่นใจคร้าบ!'
  },
  {
    id: 4,
    type: 'drink',
    signTitle: 'ชานมไข่มุก',
    signSub: 'โกโก้เหนียว • ชาไทย',
    bg: '#7c2d12',
    accent: '#fed7aa',
    prop: 'drink',
    action: 'serve',
    callout: '🧋 ชานมไข่มุก ชาไทยหอม ๆ แวะก่อนจ้า!'
  },
  {
    id: 5,
    type: 'dessert',
    signTitle: 'ขนมเบื้องโบราณ',
    signSub: 'ไส้หวาน-ไส้เค็ม กรอบ ๆ',
    bg: '#854d0e',
    accent: '#fef08a',
    prop: 'cotton_candy',
    action: 'cook',
    callout: '🥞 ขนมเบื้องกรอบ ๆ ทำร้อน ๆ เลยจ้า!'
  },
  {
    id: 6,
    type: 'dessert',
    signTitle: 'ขนมไทยโบราณ',
    signSub: 'ทองหยิบ • ฝอยทอง • ขนมชั้น',
    bg: '#065f46',
    accent: '#fde047',
    prop: 'cotton_candy',
    action: 'serve',
    callout: '🍮 ขนมไทยทำสดใหม่ หวานกำลังดีจ้า!'
  },
  {
    id: 7,
    type: 'grill',
    signTitle: 'หมูปิ้ง-ข้าวเหนียว',
    signSub: 'ย่างเตาถ่านหอมกรุ่น',
    bg: '#7f1d1d',
    accent: '#fcd34d',
    prop: 'meatball',
    action: 'cook',
    callout: '🍖 หมูปิ้งนมสดร้อน ๆ พร้อมข้าวเหนียวจ้า!'
  },
  {
    id: 8,
    type: 'balloon_game',
    signTitle: 'ปาโป่งชิงตุ๊กตา!',
    signSub: '3 ดอก 20.- แตกง่ายมาก',
    bg: '#1d4ed8',
    accent: '#fde047',
    prop: 'balloon',
    action: 'wave',
    callout: '🎯 ปาโป่งชิงตุ๊กตาตัวใหญ่เลยน้อง!'
  },
  {
    id: 9,
    type: 'scoop_game',
    signTitle: 'ตักไข่ลุ้นโชค',
    signSub: 'ช้อนปลางานวัด ลุ้นรางวัล',
    bg: '#0f766e',
    accent: '#fef08a',
    prop: 'balloon',
    action: 'wave',
    callout: '🥚 ตักไข่ลุ้นรางวัลใหญ่ แวะมาเล่นกันจ้า!'
  },
  {
    id: 10,
    type: 'fashion',
    signTitle: 'เสื้อลายดอก-กางเกงช้าง',
    signSub: 'ชุดเที่ยวงานวัดสุดฮิต',
    bg: '#6d28d9',
    accent: '#fde68a',
    prop: 'glowstick',
    action: 'wave',
    callout: '👕 กางเกงช้าง เสื้อลายดอก ใส่สบายจ้า!'
  },
  {
    id: 11,
    type: 'concert_prop',
    signTitle: 'แท่งไฟเชียร์เวที',
    signSub: 'แว่นไฟกะพริบ • ที่คาดผม',
    bg: '#86198f',
    accent: '#67e8f9',
    prop: 'glowstick',
    action: 'wave',
    callout: '✨ แท่งไฟเรืองแสง เอาไปโบกหน้าเวทีเลยคร้าบ!'
  },
  {
    id: 12,
    type: 'dessert',
    signTitle: 'ทาโกะยากิ-ไก่ทอด',
    signSub: 'เฟรนช์ฟรายส์ชีสเยิ้ม',
    bg: '#b45309',
    accent: '#fef08a',
    prop: 'meatball',
    action: 'cook',
    callout: '🍗 ไก่ทอดกรอบ ๆ เฟรนช์ฟรายส์ร้อน ๆ จ้า!'
  },
  {
    id: 13,
    type: 'drink',
    signTitle: 'น้ำจรวดโบราณ',
    signSub: 'ซ่าสะใจ • ไอติมกะทิสด',
    bg: '#0369a1',
    accent: '#fde047',
    prop: 'drink',
    action: 'serve',
    callout: '🥤 น้ำจรวดซ่า ๆ ไอติมกะทิสดเย็นชื่นใจจ้า!'
  },
  {
    id: 14,
    type: 'balloon_game',
    signTitle: 'ลูกโป่งสวรรค์',
    signSub: 'ของเล่นเด็ก • ปืนฟองสบู่',
    bg: '#be123c',
    accent: '#fef08a',
    prop: 'balloon',
    action: 'wave',
    callout: '🎈 ลูกโป่งสวรรค์เรืองแสง ถือถ่ายรูปน่ารักมาก!'
  },
  {
    id: 15,
    type: 'grill',
    signTitle: 'ยำแซ่บ-ผัดไทย',
    signSub: 'กระทะร้อนงานวัดทุ่งท่าช้าง',
    bg: '#15803d',
    accent: '#fef08a',
    prop: 'meatball',
    action: 'cook',
    callout: '🌶️ ยำแซ่บ ผัดไทยกระทะร้อน หอม ๆ เลยจ้า!'
  }
];

// ----------------------------------------------------------------------------
// Procedural Textures (4x4 Thai Shop Sign Atlas & Checkered Tablecloth)
// ----------------------------------------------------------------------------

function createShopSignsAtlas() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const cols = 4;
  const rows = 4;
  const cellW = canvas.width / cols; // 256
  const cellH = canvas.height / rows; // 128

  SHOP_TEMPLATES.forEach((tpl, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = col * cellW;
    const y = row * cellH;

    // Colorful Thai vinyl banner background with gradient
    const g = ctx.createLinearGradient(x, y, x, y + cellH);
    g.addColorStop(0, tpl.bg);
    g.addColorStop(1, '#111827');
    ctx.fillStyle = g;
    ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);

    // Bright gold/neon border trim
    ctx.strokeStyle = tpl.accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(x + 6, y + 6, cellW - 12, cellH - 12);

    // Shop title
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 28px "Noto Sans Thai", sans-serif';
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.strokeText(tpl.signTitle, x + cellW * 0.5, y + cellH * 0.4);
    ctx.fillStyle = tpl.accent;
    ctx.fillText(tpl.signTitle, x + cellW * 0.5, y + cellH * 0.4);

    // Shop subtitle
    ctx.font = '600 18px "Noto Sans Thai", sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(tpl.signSub, x + cellW * 0.5, y + cellH * 0.74);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createTableclothTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Classic red-cream Thai night-market gingham tablecloth
  ctx.fillStyle = '#fff7ed';
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = 'rgba(220, 38, 38, 0.38)';
  for (let i = 0; i < 128; i += 32) {
    ctx.fillRect(i, 0, 16, 128);
    ctx.fillRect(0, i, 128, 16);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 1.5);
  return tex;
}

// ----------------------------------------------------------------------------
// Helper to merge sub-parts into clean vertex-colored InstancedMesh geometries
// ----------------------------------------------------------------------------

function buildMergedColoredGeo(specs) {
  const parts = [];
  for (const s of specs) {
    const g = s.geo.index ? s.geo.toNonIndexed() : s.geo.clone();
    s.geo.dispose();
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(s.x || 0, s.y || 0, s.z || 0),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(s.rx || 0, s.ry || 0, s.rz || 0)),
      new THREE.Vector3(s.sx || 1, s.sy || 1, s.sz || 1)
    );
    g.applyMatrix4(m);
    for (const k of Object.keys(g.attributes)) {
      if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
    }
    const count = g.attributes.position.count;
    const col = new THREE.Color(s.color ?? 0xffffff);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = col.r;
      arr[i * 3 + 1] = col.g;
      arr[i * 3 + 2] = col.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    parts.push(g);
  }
  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  return merged;
}

// ----------------------------------------------------------------------------
// Realistic Stylized Thai Vendor Geometries (Body, Apron, Head, Hair/Cap, Arm)
// ----------------------------------------------------------------------------

function buildVendorBodyGeo() {
  // Neutral white shirt torso (gets tinted per vendor via setColorAt!), dark slacks, shoes, left arm
  return buildMergedColoredGeo([
    // Shoes
    { geo: new THREE.BoxGeometry(0.11, 0.07, 0.17), x: -0.09, y: 0.035, z: 0.02, color: 0x1e293b },
    { geo: new THREE.BoxGeometry(0.11, 0.07, 0.17), x: 0.09, y: 0.035, z: 0.02, color: 0x1e293b },
    // Pants legs
    { geo: new THREE.CylinderGeometry(0.068, 0.056, 0.62, 7), x: -0.09, y: 0.38, z: 0, color: 0x334155 },
    { geo: new THREE.CylinderGeometry(0.068, 0.056, 0.62, 7), x: 0.09, y: 0.38, z: 0, color: 0x334155 },
    // Hips
    { geo: new THREE.BoxGeometry(0.32, 0.14, 0.2), x: 0, y: 0.72, z: 0, color: 0x334155 },
    // Shirt torso (bright base -> tinted cleanly by instanceColor!)
    { geo: new THREE.BoxGeometry(0.36, 0.46, 0.21), x: 0, y: 1.0, z: 0, color: 0xffffff },
    // Left sleeve & arm resting naturally near counter
    { geo: new THREE.CylinderGeometry(0.055, 0.048, 0.18, 7), x: -0.22, y: 1.11, z: 0.02, rz: 0.18, color: 0xffffff },
    { geo: new THREE.CylinderGeometry(0.044, 0.038, 0.26, 7), x: -0.24, y: 0.94, z: 0.09, rx: -0.55, color: 0xf1c29b },
    { geo: new THREE.SphereGeometry(0.045, 7, 6), x: -0.24, y: 0.84, z: 0.18, color: 0xf1c29b }
  ]);
}

function buildVendorApronGeo() {
  // Classic Thai street vendor apron: bib + waist skirt + front cash pocket + neck strap
  return buildMergedColoredGeo([
    { geo: new THREE.BoxGeometry(0.24, 0.28, 0.03), x: 0, y: 1.04, z: 0.115, color: 0xffffff },
    { geo: new THREE.BoxGeometry(0.35, 0.42, 0.03), x: 0, y: 0.71, z: 0.12, color: 0xffffff },
    // Front money pocket
    { geo: new THREE.BoxGeometry(0.22, 0.13, 0.025), x: 0, y: 0.73, z: 0.14, color: 0xe2e8f0 },
    // Waist tie band
    { geo: new THREE.BoxGeometry(0.38, 0.045, 0.23), x: 0, y: 0.9, z: 0, color: 0xffffff }
  ]);
}

function buildVendorHeadGeo() {
  // Pivot at neck base (y = 1.24) so head smoothly turns toward nearby customers!
  return buildMergedColoredGeo([
    // Neck
    { geo: new THREE.CylinderGeometry(0.052, 0.06, 0.09, 8), x: 0, y: 0.04, z: 0, color: 0xe6b48c },
    // Rounded head
    { geo: new THREE.SphereGeometry(0.145, 12, 10), x: 0, y: 0.18, z: 0, sy: 1.06, color: 0xf5c8a2 },
    // Friendly dark eyes
    { geo: new THREE.SphereGeometry(0.017, 6, 5), x: -0.052, y: 0.195, z: 0.132, color: 0x111827 },
    { geo: new THREE.SphereGeometry(0.017, 6, 5), x: 0.052, y: 0.195, z: 0.132, color: 0x111827 },
    // Warm rosy cheeks
    { geo: new THREE.SphereGeometry(0.018, 6, 5), x: -0.082, y: 0.165, z: 0.118, sz: 0.4, color: 0xfca5a5 },
    { geo: new THREE.SphereGeometry(0.018, 6, 5), x: 0.082, y: 0.165, z: 0.118, sz: 0.4, color: 0xfca5a5 },
    // Cheerful smile
    { geo: new THREE.BoxGeometry(0.052, 0.014, 0.012), x: 0, y: 0.138, z: 0.136, color: 0xb91c1c }
  ]);
}

function buildVendorCapGeo() {
  // Vendor hair base + visor cap (pivoted at head origin y=1.24)
  return buildMergedColoredGeo([
    // Back hair
    { geo: new THREE.SphereGeometry(0.15, 10, 8), x: 0, y: 0.2, z: -0.025, color: 0x1f1916 },
    // Cap dome (white -> tinted via instanceColor!)
    { geo: new THREE.SphereGeometry(0.155, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.55), x: 0, y: 0.22, z: 0, color: 0xffffff },
    // Cap visor brim pointing forward (+Z)
    { geo: new THREE.BoxGeometry(0.19, 0.02, 0.13), x: 0, y: 0.23, z: 0.15, rx: 0.14, color: 0xffffff }
  ]);
}

function buildVendorHairBunGeo() {
  // Thai female shopkeeper neat hair + back bun + colorful hair tie
  return buildMergedColoredGeo([
    { geo: new THREE.SphereGeometry(0.154, 10, 8), x: 0, y: 0.205, z: -0.018, color: 0x1c1512 },
    // Front bangs
    { geo: new THREE.BoxGeometry(0.18, 0.055, 0.07), x: 0, y: 0.285, z: 0.1, rx: 0.25, color: 0x1c1512 },
    // Neat hair bun at back
    { geo: new THREE.SphereGeometry(0.072, 8, 7), x: 0, y: 0.25, z: -0.165, color: 0x1c1512 },
    // Colorful ribbon hair band (tinted via instanceColor!)
    { geo: new THREE.TorusGeometry(0.058, 0.016, 6, 12), x: 0, y: 0.25, z: -0.145, color: 0xffffff }
  ]);
}

function buildVendorRightArmGeo() {
  // Pivoted at right shoulder (x=+0.22, y=1.18, z=0) so we can animate cooking / waving smoothly!
  return buildMergedColoredGeo([
    { geo: new THREE.CylinderGeometry(0.054, 0.046, 0.18, 7), x: 0, y: -0.08, z: 0, color: 0xffffff },
    { geo: new THREE.CylinderGeometry(0.043, 0.036, 0.28, 7), x: 0, y: -0.26, z: 0.05, rx: -0.32, color: 0xf1c29b },
    { geo: new THREE.SphereGeometry(0.045, 7, 6), x: 0, y: -0.4, z: 0.11, color: 0xf1c29b }
  ]);
}

// ----------------------------------------------------------------------------
// 3D Handheld Props Builder (Mounted in Player's Hand & Synced Real-time!)
// ----------------------------------------------------------------------------

export function createHandheldPropMesh(propType, bitesLeft = 3) {
  const g = new THREE.Group();
  g.name = `HandheldProp_${propType}`;
  const bites = Math.max(1, Math.min(3, Number(bitesLeft) || 3));

  if (propType === 'meatball') {
    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.008, 0.36, 6),
      new THREE.MeshStandardMaterial({ color: 0xd9b382, roughness: 0.8 })
    );
    stick.position.y = 0.14;
    g.add(stick);

    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xc26d38,
      roughness: 0.38,
      emissive: 0x3b1808,
      emissiveIntensity: 0.25
    });
    const sauceMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.25,
      emissive: 0x5c0c0c,
      emissiveIntensity: 0.35
    });
    // Visually shrinks as player eats: 4 balls (3 bites) -> 3 balls (2) -> 2 balls (1)!
    const ballCount = bites === 3 ? 4 : bites === 2 ? 3 : 2;
    for (let i = 0; i < ballCount; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 7), ballMat);
      b.position.y = 0.11 + i * 0.068;
      g.add(b);
      if (i >= 1) {
        const glaze = new THREE.Mesh(new THREE.SphereGeometry(0.038, 7, 5, 0, Math.PI * 2, 0, Math.PI * 0.45), sauceMat);
        glaze.position.y = 0.115 + i * 0.068;
        g.add(glaze);
      }
    }
    g.rotation.x = 0.25;
    return g;
  }

  if (propType === 'cotton_candy') {
    const cone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.008, 0.28, 6),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.85 })
    );
    cone.position.y = 0.1;
    g.add(cone);

    const allPuffs = [
      { y: 0.24, r: 0.095, c: 0xf472b6 },
      { y: 0.33, r: 0.088, c: 0x7dd3fc },
      { y: 0.41, r: 0.072, c: 0xfef08a },
      { x: 0.045, y: 0.29, r: 0.068, c: 0xf9a8d4 },
      { x: -0.045, y: 0.31, r: 0.065, c: 0xc4b5fd }
    ];
    const puffLimit = bites === 3 ? 5 : bites === 2 ? 3 : 1;
    for (let i = 0; i < puffLimit; i++) {
      const p = allPuffs[i];
      const m = new THREE.Mesh(
        new THREE.DodecahedronGeometry(p.r * (bites === 1 ? 0.85 : 1), 1),
        new THREE.MeshStandardMaterial({
          color: p.c,
          roughness: 0.7,
          emissive: p.c,
          emissiveIntensity: 0.35
        })
      );
      m.position.set(p.x || 0, p.y, 0);
      g.add(m);
    }
    g.rotation.x = 0.2;
    return g;
  }

  if (propType === 'drink') {
    // Milk tea / iced longan cup + liquid level drops cleanly with each sip!
    const fillRatio = bites === 3 ? 1.0 : bites === 2 ? 0.68 : 0.38;
    const outerCup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.068, 0.048, 0.19, 12),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.32, roughness: 0.15 })
    );
    outerCup.position.y = 0.08;
    g.add(outerCup);

    const liqH = 0.18 * fillRatio;
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.047 + 0.017 * fillRatio, 0.046, liqH, 12),
      new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.25,
        emissive: 0x6b3504,
        emissiveIntensity: 0.42
      })
    );
    cup.position.y = -0.01 + liqH * 0.5;
    g.add(cup);

    const bobaBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.052, 0.047, 0.045, 10),
      new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.4 })
    );
    bobaBand.position.y = 0.01;
    g.add(bobaBand);

    const lid = new THREE.Mesh(
      new THREE.SphereGeometry(0.068, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.72, roughness: 0.15 })
    );
    lid.position.y = 0.175;
    g.add(lid);

    const straw = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.009, 0.16, 6),
      new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0x831843, emissiveIntensity: 0.35 })
    );
    straw.position.set(0.018, 0.24, 0);
    straw.rotation.z = -0.15;
    g.add(straw);
    return g;
  }

  if (propType === 'glowstick') {
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.016, 0.12, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
    );
    handle.position.y = 0.03;
    g.add(handle);

    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.34, 10),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    rod.position.y = 0.25;
    g.add(rod);

    const halo = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 0.36, 10),
      new THREE.MeshBasicMaterial({
        color: 0xec4899,
        transparent: true,
        opacity: 0.36,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    halo.position.y = 0.25;
    g.add(halo);
    g.rotation.x = 0.28;
    return g;
  }

  // 'balloon' — Festive glowing floating balloon on a white ribbon string!
  const string = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 0.72, 5),
    new THREE.MeshBasicMaterial({ color: 0xf8fafc })
  );
  string.position.y = 0.36;
  g.add(string);

  const balloon = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 14, 12),
    new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.22,
      metalness: 0.1,
      emissive: 0x9f1239,
      emissiveIntensity: 0.55
    })
  );
  balloon.scale.set(0.92, 1.15, 0.92);
  balloon.position.y = 0.86;
  g.add(balloon);

  const knot = new THREE.Mesh(
    new THREE.ConeGeometry(0.026, 0.04, 6),
    new THREE.MeshStandardMaterial({ color: 0xf43f5e })
  );
  knot.position.y = 0.65;
  g.add(knot);
  return g;
}

// ----------------------------------------------------------------------------
// Build All 77 Vendor Stalls, Merchandise Props & 77 Live Animated Shopkeepers
// ----------------------------------------------------------------------------

export function buildVendorMarket(scene, addCollisionBox, labelsLayer) {
  const stalls = [];

  // Zone 1) ขวาถนนเมน X=5.5 (Z: +41 ถึง +16.3) -> 12 stalls (Street food)
  const zone1Seq = [0, 3, 2, 1, 5, 4, 7, 6, 12, 13, 15, 2];
  for (let i = 0; i < 12; i++) {
    stalls.push({ x: 5.5, z: 40.5 - i * 2.2, rotY: -Math.PI / 2, tplIdx: zone1Seq[i % zone1Seq.length] });
  }

  // Zone 2) ซ้ายถนนเมน X=-5.5 (Z: +32 ถึง +6) -> 12 stalls (Street food) + bottom L-hook -> 8 stalls (Thai sweets & fashion)
  const zone2MainSeq = [1, 4, 0, 2, 15, 3, 5, 12, 7, 13, 6, 4];
  for (let i = 0; i < 12; i++) {
    stalls.push({ x: -5.5, z: 31.2 - i * 2.25, rotY: Math.PI / 2, tplIdx: zone2MainSeq[i % zone2MainSeq.length] });
  }
  const zone2HookSeq = [6, 10, 5, 10, 14, 6, 10, 2];
  for (let i = 0; i < 5; i++) {
    stalls.push({ x: -8.5 - i * 2.3, z: 34.0, rotY: Math.PI, tplIdx: zone2HookSeq[i] });
  }
  for (let i = 0; i < 3; i++) {
    stalls.push({ x: -8.5 - i * 2.3, z: 38.8, rotY: 0, tplIdx: zone2HookSeq[5 + i] });
  }

  // Zone 3) แนวนอนกลางฝั่งซ้าย Z=+5 (X: -8.5 ถึง -31) -> 11 stalls (Carnival games & toys!)
  const zone3Seq = [8, 9, 14, 8, 2, 9, 14, 8, 11, 9, 14];
  for (let i = 0; i < 11; i++) {
    stalls.push({ x: -8.5 - i * 2.25, z: 5.0, rotY: Math.PI, tplIdx: zone3Seq[i % zone3Seq.length] });
  }

  // Zone 4) ขอบซ้ายสุด X=-35 (Z: +2 ถึง -33) -> 16 stalls (Concert snacks & drinks)
  const zone4Seq = [0, 3, 12, 4, 1, 13, 7, 2, 15, 11, 0, 4, 12, 3, 11, 13];
  for (let i = 0; i < 16; i++) {
    stalls.push({ x: -35.0, z: 1.5 - i * 2.3, rotY: Math.PI / 2, tplIdx: zone4Seq[i % zone4Seq.length] });
  }

  // Zone 5) กลุ่มตัว U หน้าลานเก้าอี้คอนเสิร์ต -> 17 stalls (Concert glowsticks, drinks & quick bites)
  const zone5Seq = [11, 3, 0, 11, 4, 12, 2, 11, 13, 7, 1, 11, 3, 14, 12, 4, 11];
  let z5 = 0;
  for (let i = 0; i < 6; i++) {
    stalls.push({ x: -5.5, z: -5.2 - i * 2.25, rotY: -Math.PI / 2, tplIdx: zone5Seq[z5++] });
  }
  for (let i = 0; i < 6; i++) {
    stalls.push({ x: -8.2 - i * 2.55, z: -4.5, rotY: Math.PI, tplIdx: zone5Seq[z5++] });
  }
  for (let i = 0; i < 5; i++) {
    stalls.push({ x: -23.5, z: -6.8 - i * 2.25, rotY: Math.PI / 2, tplIdx: zone5Seq[z5++] });
  }

  const count = stalls.length; // 77 stalls
  const group = new THREE.Group();
  group.name = 'VendorMarketAll77';

  // ---- 1. TENT ROOFS, POSTS, CHECKERED TABLECLOTHS & NEON COUNTER STRIPS (4 Draw Calls) ----
  const roofGeo = new THREE.ConeGeometry(1.55, 0.95, 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.65 });
  const roofMesh = new THREE.InstancedMesh(roofGeo, roofMat, count);

  const tableclothTex = createTableclothTexture();
  const tableGeo = new THREE.BoxGeometry(1.88, 0.78, 0.74);
  const tableMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: tableclothTex,
    roughness: 0.78,
    emissive: 0x2a180d,
    emissiveIntensity: 0.25
  });
  const tableMesh = new THREE.InstancedMesh(tableGeo, tableMat, count);

  const postGeo = new THREE.CylinderGeometry(0.035, 0.035, 2.2, 6);
  const postMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.5 });
  const postMesh = new THREE.InstancedMesh(postGeo, postMat, count * 4);

  // Warm glowing fluorescent light tubes mounted under front awning illuminating the goods & vendor!
  const neonGeo = new THREE.BoxGeometry(1.42, 0.06, 0.07);
  const neonMat = new THREE.MeshBasicMaterial({ color: 0xfff8d6 });
  const neonMesh = new THREE.InstancedMesh(neonGeo, neonMat, count);

  // ---- 2. THAI SHOP SIGNBOARDS (Merged into 1 Single Draw Call using 4x4 Texture Atlas!) ----
  const signAtlasTex = createShopSignsAtlas();
  const signMat = new THREE.MeshBasicMaterial({ map: signAtlasTex, side: THREE.DoubleSide });
  const signGeos = [];

  // ---- 3. 3D MERCHANDISE PROPS (Instanced per archetype — ~8 Draw Calls!) ----
  const grillItems = [];
  const cottonItems = [];
  const drinkItems = [];
  const dessertItems = [];
  const balloonGameItems = [];
  const scoopGameItems = [];
  const fashionItems = [];
  const concertPropItems = [];

  const tentColors = [
    new THREE.Color(0xef4444),
    new THREE.Color(0xf59e0b),
    new THREE.Color(0xec4899),
    new THREE.Color(0x14b8a6),
    new THREE.Color(0x3b82f6),
    new THREE.Color(0x8b5cf6)
  ];
  const shirtPalette = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0xec4899, 0x8b5cf6, 0x06b6d4, 0xf97316, 0xfef08a, 0xe2e8f0];
  const apronPalette = [0x991b1b, 0x0f766e, 0x1e3a8a, 0x15803d, 0x86198f, 0xb45309, 0xbe123c, 0x334155];
  const hatPalette = [0xdc2626, 0x2563eb, 0xf59e0b, 0x059669, 0xdb2777, 0x1e293b, 0xf8fafc];

  // Vendor animation metadata (77 live vendors!)
  const vendors = [];
  const capVendorIndices = [];
  const bunVendorIndices = [];

  const dummy = new THREE.Object3D();

  stalls.forEach((s, i) => {
    const tpl = SHOP_TEMPLATES[s.tplIdx];
    const sinR = Math.sin(s.rotY);
    const cosR = Math.cos(s.rotY);

    // Tent roof
    dummy.position.set(s.x, 2.65, s.z);
    dummy.rotation.set(0, s.rotY + Math.PI / 4, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    roofMesh.setMatrixAt(i, dummy.matrix);
    roofMesh.setColorAt(i, tentColors[i % tentColors.length]);

    // Front counter table
    const frontOffset = 0.52;
    const tx = s.x + sinR * frontOffset;
    const tz = s.z + cosR * frontOffset;
    dummy.position.set(tx, 0.39, tz);
    dummy.rotation.set(0, s.rotY, 0);
    dummy.updateMatrix();
    tableMesh.setMatrixAt(i, dummy.matrix);

    // Warm neon light tube tucked neatly inside front eave
    dummy.position.set(s.x + sinR * 0.78, 2.18, s.z + cosR * 0.78);
    dummy.rotation.set(0, s.rotY, 0);
    dummy.updateMatrix();
    neonMesh.setMatrixAt(i, dummy.matrix);

    // 4 Corner tent posts
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

    // Hanging Thai Shop Signboard mounted cleanly along top front eave (keeps shopkeeper's face 100% visible!)
    const sg = new THREE.PlaneGeometry(1.68, 0.38);
    const uvAttr = sg.attributes.uv;
    const col = tpl.id % 4;
    const row = Math.floor(tpl.id / 4);
    const u0 = col * 0.25 + 0.004;
    const u1 = (col + 1) * 0.25 - 0.004;
    // Canvas y=0 is top -> Three.js v=1 is top
    const v1 = 1 - row * 0.25 - 0.004;
    const v0 = 1 - (row + 1) * 0.25 + 0.004;
    for (let uvi = 0; uvi < uvAttr.count; uvi++) {
      const u = uvAttr.getX(uvi);
      const v = uvAttr.getY(uvi);
      uvAttr.setXY(uvi, u < 0.5 ? u0 : u1, v < 0.5 ? v0 : v1);
    }
    const signM = new THREE.Matrix4().compose(
      new THREE.Vector3(s.x + sinR * 0.96, 2.15, s.z + cosR * 0.96),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, s.rotY, 0)),
      new THREE.Vector3(1, 1, 1)
    );
    sg.applyMatrix4(signM);
    signGeos.push(sg);

    // Collect prop placement transform on the front counter (y = 0.78)
    const propSpot = { x: tx, y: 0.78, z: tz, rotY: s.rotY, stallX: s.x, stallZ: s.z, idx: i };
    if (tpl.type === 'grill') grillItems.push(propSpot);
    else if (tpl.type === 'cotton') cottonItems.push(propSpot);
    else if (tpl.type === 'drink') drinkItems.push(propSpot);
    else if (tpl.type === 'dessert') dessertItems.push(propSpot);
    else if (tpl.type === 'balloon_game') balloonGameItems.push(propSpot);
    else if (tpl.type === 'scoop_game') scoopGameItems.push(propSpot);
    else if (tpl.type === 'fashion') fashionItems.push(propSpot);
    else concertPropItems.push(propSpot);

    // Shopkeeper standing right behind the counter facing customers!
    const vx = s.x - sinR * 0.24;
    const vz = s.z - cosR * 0.24;
    const isCap = i % 2 === 0;
    const vEntry = {
      idx: i,
      x: vx,
      z: vz,
      frontX: s.x + sinR * 1.45,
      frontZ: s.z + cosR * 1.45,
      baseRotY: s.rotY,
      headYaw: 0,
      phase: i * 1.37,
      tpl,
      isCap,
      hatSubIdx: isCap ? capVendorIndices.length : bunVendorIndices.length,
      shirtColor: shirtPalette[(i * 3) % shirtPalette.length],
      apronColor: apronPalette[(i * 5 + 1) % apronPalette.length],
      hatColor: hatPalette[(i * 7 + 2) % hatPalette.length]
    };
    if (isCap) capVendorIndices.push(vEntry);
    else bunVendorIndices.push(vEntry);
    vendors.push(vEntry);

    addCollisionBox(s.x - 1.0, s.x + 1.0, s.z - 1.0, s.z + 1.0, `stall-${i}`);
  });

  roofMesh.instanceMatrix.needsUpdate = true;
  if (roofMesh.instanceColor) roofMesh.instanceColor.needsUpdate = true;
  tableMesh.instanceMatrix.needsUpdate = true;
  postMesh.instanceMatrix.needsUpdate = true;
  neonMesh.instanceMatrix.needsUpdate = true;
  group.add(roofMesh, tableMesh, postMesh, neonMesh);

  // Add merged Thai Shop Signboards (1 draw call for all 77 signs!)
  const mergedSigns = mergeGeometries(signGeos, false);
  signGeos.forEach((g) => g.dispose());
  if (mergedSigns) {
    group.add(new THREE.Mesh(mergedSigns, signMat));
  }

  // ---- Helper to create 1 InstancedMesh from a colored merged prop geometry ----
  function addPropInstanced(geo, spots, emissiveHex = 0x221a12, emissiveInt = 0.35) {
    if (spots.length === 0) {
      geo.dispose();
      return null;
    }
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.55,
      emissive: new THREE.Color(emissiveHex),
      emissiveIntensity: emissiveInt
    });
    const inst = new THREE.InstancedMesh(geo, mat, spots.length);
    spots.forEach((sp, k) => {
      dummy.position.set(sp.x, sp.y, sp.z);
      dummy.rotation.set(0, sp.rotY, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      inst.setMatrixAt(k, dummy.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
    group.add(inst);
    return inst;
  }

  // 3A. Grill Props (Charcoal grill + glowing orange embers + meatball skewers + chili sauce jar!)
  const grillGeo = buildMergedColoredGeo([
    { geo: new THREE.BoxGeometry(0.86, 0.16, 0.42), x: -0.22, y: 0.08, z: 0, color: 0x334155 },
    { geo: new THREE.BoxGeometry(0.76, 0.04, 0.32), x: -0.22, y: 0.16, z: 0, color: 0xff5500 }, // glowing charcoal!
    // 5 skewers on grill
    { geo: new THREE.CylinderGeometry(0.025, 0.025, 0.3, 6), x: -0.46, y: 0.2, z: 0, rx: Math.PI / 2, color: 0xc26d38 },
    { geo: new THREE.CylinderGeometry(0.025, 0.025, 0.3, 6), x: -0.34, y: 0.2, z: 0, rx: Math.PI / 2, color: 0xb45309 },
    { geo: new THREE.CylinderGeometry(0.025, 0.025, 0.3, 6), x: -0.22, y: 0.2, z: 0, rx: Math.PI / 2, color: 0xd97706 },
    { geo: new THREE.CylinderGeometry(0.025, 0.025, 0.3, 6), x: -0.1, y: 0.2, z: 0, rx: Math.PI / 2, color: 0xc26d38 },
    { geo: new THREE.CylinderGeometry(0.025, 0.025, 0.3, 6), x: 0.02, y: 0.2, z: 0, rx: Math.PI / 2, color: 0xb91c1c },
    // Steel display tray + red dipping sauce bowl
    { geo: new THREE.BoxGeometry(0.46, 0.04, 0.38), x: 0.52, y: 0.02, z: 0, color: 0xcbd5e1 },
    { geo: new THREE.CylinderGeometry(0.11, 0.09, 0.16, 10), x: 0.54, y: 0.1, z: 0.02, color: 0xdc2626 }
  ]);
  addPropInstanced(grillGeo, grillItems, 0x451a03, 0.42);

  // Subtle animated grill smoke puffs (1 InstancedMesh shared across all grill stalls!)
  const smokeMeta = [];
  const smokeInst =
    grillItems.length > 0
      ? new THREE.InstancedMesh(
          new THREE.DodecahedronGeometry(0.11, 0),
          new THREE.MeshBasicMaterial({
            color: 0xe2e8f0,
            transparent: true,
            opacity: 0.24,
            depthWrite: false
          }),
          grillItems.length * 2
        )
      : null;
  if (smokeInst) {
    grillItems.forEach((sp, gi) => {
      for (let p = 0; p < 2; p++) {
        smokeMeta.push({
          x: sp.x - Math.cos(sp.rotY) * 0.22,
          z: sp.z + Math.sin(sp.rotY) * 0.22,
          phase: gi * 1.1 + p * 0.5
        });
      }
    });
    group.add(smokeInst);
  }

  // 3B. Cotton Candy Props (Fluffy pink/sky/yellow/lavender cones standing tall on display stand!)
  const cottonGeo = buildMergedColoredGeo([
    { geo: new THREE.CylinderGeometry(0.24, 0.22, 0.18, 12), x: -0.45, y: 0.09, z: 0, color: 0xe2e8f0 },
    { geo: new THREE.BoxGeometry(0.92, 0.06, 0.22), x: 0.28, y: 0.03, z: 0.06, color: 0x78350f },
    { geo: new THREE.DodecahedronGeometry(0.14, 1), x: -0.05, y: 0.36, z: 0.05, color: 0xf472b6 },
    { geo: new THREE.DodecahedronGeometry(0.14, 1), x: 0.18, y: 0.42, z: 0.05, color: 0x38bdf8 },
    { geo: new THREE.DodecahedronGeometry(0.14, 1), x: 0.41, y: 0.38, z: 0.05, color: 0xfef08a },
    { geo: new THREE.DodecahedronGeometry(0.13, 1), x: 0.62, y: 0.34, z: 0.05, color: 0xc084fc }
  ]);
  addPropInstanced(cottonGeo, cottonItems, 0x4a1d3e, 0.45);

  // 3C. Drink Props (3 Colorful Beverage Dispensers: golden longan, milk tea, pink sala + cup stack!)
  const drinkGeo = buildMergedColoredGeo([
    { geo: new THREE.CylinderGeometry(0.15, 0.14, 0.38, 12), x: -0.52, y: 0.22, z: 0, color: 0xf59e0b },
    { geo: new THREE.CylinderGeometry(0.16, 0.16, 0.04, 12), x: -0.52, y: 0.42, z: 0, color: 0xf8fafc },
    { geo: new THREE.CylinderGeometry(0.15, 0.14, 0.38, 12), x: -0.14, y: 0.22, z: 0, color: 0xec4899 },
    { geo: new THREE.CylinderGeometry(0.16, 0.16, 0.04, 12), x: -0.14, y: 0.42, z: 0, color: 0xf8fafc },
    { geo: new THREE.CylinderGeometry(0.15, 0.14, 0.38, 12), x: 0.24, y: 0.22, z: 0, color: 0x22c55e },
    { geo: new THREE.CylinderGeometry(0.16, 0.16, 0.04, 12), x: 0.24, y: 0.42, z: 0, color: 0xf8fafc },
    // Ice cooler + stacked plastic cups
    { geo: new THREE.BoxGeometry(0.38, 0.26, 0.34), x: 0.64, y: 0.13, z: 0, color: 0x0284c7 },
    { geo: new THREE.CylinderGeometry(0.055, 0.045, 0.22, 8), x: 0.62, y: 0.36, z: 0.04, color: 0xf8fafc }
  ]);
  addPropInstanced(drinkGeo, drinkItems, 0x3b2608, 0.46);

  // 3D. Thai Dessert & Griddle Props (Golden Foy-Thong / Thong-Yip / Pandan trays + glass display)
  const dessertGeo = buildMergedColoredGeo([
    { geo: new THREE.BoxGeometry(0.46, 0.05, 0.36), x: -0.52, y: 0.03, z: 0, color: 0xd1d5db },
    { geo: new THREE.SphereGeometry(0.14, 8, 6), x: -0.52, y: 0.09, z: 0, sy: 0.45, color: 0xfacc15 },
    { geo: new THREE.BoxGeometry(0.46, 0.05, 0.36), x: 0.0, y: 0.03, z: 0, color: 0xd1d5db },
    { geo: new THREE.SphereGeometry(0.14, 8, 6), x: 0.0, y: 0.09, z: 0, sy: 0.45, color: 0x4ade80 },
    { geo: new THREE.BoxGeometry(0.46, 0.05, 0.36), x: 0.52, y: 0.03, z: 0, color: 0xd1d5db },
    { geo: new THREE.SphereGeometry(0.14, 8, 6), x: 0.52, y: 0.09, z: 0, sy: 0.45, color: 0xfb923c }
  ]);
  addPropInstanced(dessertGeo, dessertItems, 0x3d2e08, 0.42);

  // 3E. Balloon Dart Game & Plush Prizes (Colorful dart balloons on rear board + cute bear prizes!)
  const bSpecs = [
    // Dart cup on counter
    { geo: new THREE.CylinderGeometry(0.08, 0.07, 0.14, 8), x: 0, y: 0.07, z: 0.12, color: 0xfacc15 },
    // Rear wooden balloon board behind the vendor (local z = -1.25)
    { geo: new THREE.BoxGeometry(1.7, 1.15, 0.06), x: 0, y: 0.72, z: -1.32, color: 0x1e293b }
  ];
  const bCols = [0xef4444, 0xfacc15, 0x38bdf8, 0xec4899, 0x4ade80, 0xf97316];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      bSpecs.push({
        geo: new THREE.SphereGeometry(0.11, 8, 7),
        x: -0.62 + col * 0.31,
        y: 0.42 + row * 0.28,
        z: -1.23,
        color: bCols[(row * 5 + col) % bCols.length]
      });
    }
  }
  // 2 cute hanging plush teddy bears under front canopy
  for (const bx of [-0.55, 0.55]) {
    bSpecs.push({ geo: new THREE.SphereGeometry(0.12, 8, 7), x: bx, y: 0.92, z: 0.22, color: 0xd97706 });
    bSpecs.push({ geo: new THREE.SphereGeometry(0.09, 8, 7), x: bx, y: 1.07, z: 0.22, color: 0xf59e0b });
  }
  addPropInstanced(buildMergedColoredGeo(bSpecs), balloonGameItems, 0x30182a, 0.48);

  // 3F. Egg Scoop / Goldfish Tub Game (Glowing aqua tub with floating colorful capsules!)
  const scoopGeo = buildMergedColoredGeo([
    { geo: new THREE.CylinderGeometry(0.54, 0.48, 0.22, 16), x: 0, y: 0.11, z: 0, color: 0x0284c7 },
    { geo: new THREE.CylinderGeometry(0.49, 0.49, 0.03, 16), x: 0, y: 0.21, z: 0, color: 0x67e8f9 },
    { geo: new THREE.SphereGeometry(0.055, 7, 6), x: -0.22, y: 0.24, z: 0.12, color: 0xfef08a },
    { geo: new THREE.SphereGeometry(0.055, 7, 6), x: 0.18, y: 0.24, z: -0.14, color: 0xf472b6 },
    { geo: new THREE.SphereGeometry(0.055, 7, 6), x: 0.04, y: 0.24, z: 0.2, color: 0x4ade80 },
    { geo: new THREE.SphereGeometry(0.055, 7, 6), x: -0.14, y: 0.24, z: -0.16, color: 0xfb923c },
    { geo: new THREE.SphereGeometry(0.055, 7, 6), x: 0.26, y: 0.24, z: 0.08, color: 0xc084fc }
  ]);
  addPropInstanced(scoopGeo, scoopGameItems, 0x0b3a4a, 0.48);

  // 3G. Thai Fashion / Elephant Pants / Floral Shirts Display (Folded colorful stacks!)
  const fashionGeo = buildMergedColoredGeo([
    { geo: new THREE.BoxGeometry(0.38, 0.14, 0.34), x: -0.52, y: 0.07, z: 0, color: 0xec4899 },
    { geo: new THREE.BoxGeometry(0.36, 0.12, 0.32), x: -0.52, y: 0.19, z: 0, color: 0xfacc15 },
    { geo: new THREE.BoxGeometry(0.38, 0.16, 0.34), x: 0.0, y: 0.08, z: 0, color: 0x1e3a8a },
    { geo: new THREE.BoxGeometry(0.36, 0.12, 0.32), x: 0.0, y: 0.21, z: 0, color: 0x38bdf8 },
    { geo: new THREE.BoxGeometry(0.38, 0.15, 0.34), x: 0.52, y: 0.075, z: 0, color: 0x16a34a },
    { geo: new THREE.BoxGeometry(0.36, 0.11, 0.32), x: 0.52, y: 0.2, z: 0, color: 0xf97316 }
  ]);
  addPropInstanced(fashionGeo, fashionItems, 0x241838, 0.38);

  // 3H. Concert Glowstick & Neon Headband Props (Bright glowing neon rods standing in cups!)
  const glowSpecs = [
    { geo: new THREE.CylinderGeometry(0.14, 0.12, 0.18, 10), x: -0.45, y: 0.09, z: 0, color: 0x1e293b },
    { geo: new THREE.CylinderGeometry(0.14, 0.12, 0.18, 10), x: 0.0, y: 0.09, z: 0, color: 0x1e293b },
    { geo: new THREE.CylinderGeometry(0.14, 0.12, 0.18, 10), x: 0.45, y: 0.09, z: 0, color: 0x1e293b }
  ];
  const neonCols = [0x22d3ee, 0xf472b6, 0xfacc15, 0x4ade80, 0xc084fc];
  for (let cupIdx = 0; cupIdx < 3; cupIdx++) {
    const cx = -0.45 + cupIdx * 0.45;
    for (let r = 0; r < 4; r++) {
      glowSpecs.push({
        geo: new THREE.CylinderGeometry(0.018, 0.018, 0.34, 6),
        x: cx + (r - 1.5) * 0.045,
        y: 0.28,
        z: ((r % 2) - 0.5) * 0.05,
        rz: (r - 1.5) * 0.12,
        color: neonCols[(cupIdx * 2 + r) % neonCols.length]
      });
    }
  }
  addPropInstanced(buildMergedColoredGeo(glowSpecs), concertPropItems, 0x422066, 0.72);

  // ---- 4. 77 LIVE ANIMATED THAI VENDORS (Only 6 InstancedMeshes = 6 Draw Calls!) ----
  const vendorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.65,
    emissive: 0x221c18,
    emissiveIntensity: 0.3
  });
  const vendorHeadMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.6,
    emissive: 0x291e16,
    emissiveIntensity: 0.32
  });

  const bodyInst = new THREE.InstancedMesh(buildVendorBodyGeo(), vendorMat, count);
  const apronInst = new THREE.InstancedMesh(buildVendorApronGeo(), vendorMat, count);
  const headInst = new THREE.InstancedMesh(buildVendorHeadGeo(), vendorHeadMat, count);
  const armInst = new THREE.InstancedMesh(buildVendorRightArmGeo(), vendorMat, count);
  const capInst = new THREE.InstancedMesh(buildVendorCapGeo(), vendorMat, Math.max(1, capVendorIndices.length));
  const bunInst = new THREE.InstancedMesh(buildVendorHairBunGeo(), vendorMat, Math.max(1, bunVendorIndices.length));

  const tmpCol = new THREE.Color();

  vendors.forEach((v) => {
    // Body + Apron (stationary grounded base)
    dummy.position.set(v.x, 0, v.z);
    dummy.rotation.set(0, v.baseRotY, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    bodyInst.setMatrixAt(v.idx, dummy.matrix);
    apronInst.setMatrixAt(v.idx, dummy.matrix);
    bodyInst.setColorAt(v.idx, tmpCol.setHex(v.shirtColor));
    apronInst.setColorAt(v.idx, tmpCol.setHex(v.apronColor));

    // Initial Head + Hat/Hair at neck pivot (y = 1.24)
    dummy.position.set(v.x, 1.24, v.z);
    dummy.rotation.set(0, v.baseRotY, 0);
    dummy.updateMatrix();
    headInst.setMatrixAt(v.idx, dummy.matrix);
    if (v.isCap) {
      capInst.setMatrixAt(v.hatSubIdx, dummy.matrix);
      capInst.setColorAt(v.hatSubIdx, tmpCol.setHex(v.hatColor));
    } else {
      bunInst.setMatrixAt(v.hatSubIdx, dummy.matrix);
      bunInst.setColorAt(v.hatSubIdx, tmpCol.setHex(v.hatColor));
    }

    // Initial Right Arm at right shoulder pivot
    const cosR = Math.cos(v.baseRotY);
    const sinR = Math.sin(v.baseRotY);
    const sx = v.x + cosR * 0.22;
    const sz = v.z - sinR * 0.22;
    v.shoulderX = sx;
    v.shoulderZ = sz;
    dummy.position.set(sx, 1.18, sz);
    dummy.rotation.set(-0.35, v.baseRotY, 0);
    dummy.updateMatrix();
    armInst.setMatrixAt(v.idx, dummy.matrix);
    armInst.setColorAt(v.idx, tmpCol.setHex(v.shirtColor));
  });

  [bodyInst, apronInst, headInst, armInst, capInst, bunInst].forEach((m) => {
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    group.add(m);
  });

  scene.add(group);

  // ---- 5. SINGLE REUSABLE FLOATING VENDOR CALLOUT BUBBLE (Zero DOM Bloat!) ----
  let calloutEl = null;
  let calloutTextEl = null;
  if (labelsLayer) {
    calloutEl = document.createElement('div');
    calloutEl.className = 'floating-label vendor-callout-wrap';
    calloutEl.style.display = 'none';
    const bubble = document.createElement('div');
    bubble.className = 'vendor-callout-bubble';
    calloutTextEl = bubble;
    calloutEl.appendChild(bubble);
    labelsLayer.appendChild(calloutEl);
  }

  return {
    root: group,
    vendors,
    headInst,
    armInst,
    capInst,
    bunInst,
    smokeInst,
    smokeMeta,
    calloutEl,
    calloutTextEl,
    activeCalloutVendor: null
  };
}

// ----------------------------------------------------------------------------
// Per-Frame Update (Distance-Culled Vendor Animations + Nearest Callout + Smoke)
// ----------------------------------------------------------------------------

const _vDummy = new THREE.Object3D();
const _vProj = new THREE.Vector3();

export function findNearestVendorStall(marketState, playerPos, maxRadius = 2.8) {
  if (!marketState || !playerPos) return null;
  let best = null;
  let bestDistSq = maxRadius * maxRadius;
  const list = marketState.vendors;
  for (let i = 0; i < list.length; i++) {
    const v = list[i];
    const dx = playerPos.x - v.frontX;
    const dz = playerPos.z - v.frontZ;
    const dSq = dx * dx + dz * dz;
    if (dSq < bestDistSq) {
      bestDistSq = dSq;
      best = v;
    }
  }
  return best;
}

export function updateVendorMarket(marketState, playerPos, camera, elapsed, hideCallout = false) {
  if (!marketState) return;
  const { vendors, headInst, armInst, capInst, bunInst, smokeInst, smokeMeta, calloutEl, calloutTextEl } = marketState;

  let headDirty = false;
  let armDirty = false;
  let capDirty = false;
  let bunDirty = false;

  let closestForCallout = null;
  let closestDistSq = 6.2 * 6.2;

  const camX = camera.position.x;
  const camZ = camera.position.z;

  for (let i = 0; i < vendors.length; i++) {
    const v = vendors[i];
    const dCamX = v.x - camX;
    const dCamZ = v.z - camZ;
    const dCamSq = dCamX * dCamX + dCamZ * dCamZ;
    if (dCamSq > 24 * 24) continue; // Distance-cull animations beyond 24m for 60 FPS mobile!

    // Check distance to local player for head-tracking & callout speech bubble
    let desiredHeadYaw = Math.sin(elapsed * 0.9 + v.phase) * 0.18;
    if (playerPos) {
      const pdx = playerPos.x - v.x;
      const pdz = playerPos.z - v.z;
      const pDistSq = pdx * pdx + pdz * pdz;
      if (pDistSq < 8.5 * 8.5) {
        const toPlayer = Math.atan2(pdx, pdz);
        let rel = toPlayer - v.baseRotY;
        while (rel > Math.PI) rel -= Math.PI * 2;
        while (rel < -Math.PI) rel += Math.PI * 2;
        desiredHeadYaw = THREE.MathUtils.clamp(rel, -0.75, 0.75);
      }
      if (pDistSq < closestDistSq) {
        closestDistSq = pDistSq;
        closestForCallout = v;
      }
    }

    // Smooth head turn + subtle cheerful bob
    v.headYaw += (desiredHeadYaw - v.headYaw) * 0.12;
    const headBobY = 1.24 + Math.sin(elapsed * 2.4 + v.phase) * 0.012;
    const finalHeadYRot = v.baseRotY + v.headYaw;

    _vDummy.position.set(v.x, headBobY, v.z);
    _vDummy.rotation.set(Math.sin(elapsed * 1.6 + v.phase) * 0.04, finalHeadYRot, 0);
    _vDummy.scale.set(1, 1, 1);
    _vDummy.updateMatrix();
    headInst.setMatrixAt(v.idx, _vDummy.matrix);
    headDirty = true;

    if (v.isCap) {
      capInst.setMatrixAt(v.hatSubIdx, _vDummy.matrix);
      capDirty = true;
    } else {
      bunInst.setMatrixAt(v.hatSubIdx, _vDummy.matrix);
      bunDirty = true;
    }

    // Animated right arm based on shop archetype (cook / serve / beckon wave!)
    let armRx = -0.35;
    let armRz = 0;
    if (v.tpl.action === 'wave') {
      // Friendly overhead / chest-high beckoning wave!
      const waveCycle = Math.sin(elapsed * 3.8 + v.phase);
      armRx = -1.75 + Math.sin(elapsed * 1.1 + v.phase) * 0.35;
      armRz = 0.25 + waveCycle * 0.34;
    } else if (v.tpl.action === 'cook') {
      // Rhythmic grill flipping / fanning motion
      armRx = -0.82 + Math.sin(elapsed * 4.6 + v.phase) * 0.26;
      armRz = Math.cos(elapsed * 2.3 + v.phase) * 0.14;
    } else {
      // Serving / scooping drink motion
      armRx = -0.72 + Math.sin(elapsed * 2.8 + v.phase) * 0.22;
      armRz = 0.08;
    }

    _vDummy.position.set(v.shoulderX, 1.18, v.shoulderZ);
    _vDummy.rotation.set(0, v.baseRotY, 0);
    _vDummy.rotateX(armRx);
    _vDummy.rotateZ(armRz);
    _vDummy.updateMatrix();
    armInst.setMatrixAt(v.idx, _vDummy.matrix);
    armDirty = true;
  }

  if (headDirty) headInst.instanceMatrix.needsUpdate = true;
  if (armDirty) armInst.instanceMatrix.needsUpdate = true;
  if (capDirty) capInst.instanceMatrix.needsUpdate = true;
  if (bunDirty) bunInst.instanceMatrix.needsUpdate = true;

  // Rising BBQ smoke puffs above grill stalls
  if (smokeInst && smokeMeta.length > 0) {
    for (let i = 0; i < smokeMeta.length; i++) {
      const sm = smokeMeta[i];
      const t = (elapsed * 0.42 + sm.phase) % 1;
      const py = 1.02 + t * 0.92;
      const sway = Math.sin(elapsed * 1.8 + sm.phase * 4) * 0.08;
      const sc = 0.45 + t * 1.15;
      _vDummy.position.set(sm.x + sway, py, sm.z + sway * 0.6);
      _vDummy.rotation.set(t * 2, t * 3, 0);
      _vDummy.scale.setScalar(sc * (1 - t * 0.45));
      _vDummy.updateMatrix();
      smokeInst.setMatrixAt(i, _vDummy.matrix);
    }
    smokeInst.instanceMatrix.needsUpdate = true;
  }

  // Project the 1 nearest vendor's cheerful Thai speech callout bubble!
  if (calloutEl && calloutTextEl) {
    if (!closestForCallout || hideCallout) {
      if (calloutEl._vis !== false) {
        calloutEl.style.display = 'none';
        calloutEl._vis = false;
      }
    } else {
      if (marketState.activeCalloutVendor !== closestForCallout.idx) {
        marketState.activeCalloutVendor = closestForCallout.idx;
        calloutTextEl.textContent = closestForCallout.tpl.callout;
      }
      _vProj.set(closestForCallout.x, 1.82, closestForCallout.z);
      _vProj.project(camera);
      if (_vProj.z > 1) {
        if (calloutEl._vis !== false) {
          calloutEl.style.display = 'none';
          calloutEl._vis = false;
        }
      } else {
        const sx = Math.round((_vProj.x * 0.5 + 0.5) * window.innerWidth);
        const sy = Math.round((-_vProj.y * 0.5 + 0.5) * window.innerHeight);
        if (calloutEl._vis !== true) {
          calloutEl.style.display = 'flex';
          calloutEl._vis = true;
        }
        calloutEl.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -100%)`;
      }
    }
  }
}
