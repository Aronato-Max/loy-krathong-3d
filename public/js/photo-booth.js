import * as THREE from 'three';

// ============================================================================
// PHOTO BOOTH — "#งานวัดไฮโซ โอ้โห ท่าช้าง" (Authentic Thai Temple Fair Backdrop)
// Positioned along the north walkway behind the Krathong Shop, facing South (+Z)
// ============================================================================

export const PHOTO_BOOTH_CONFIG = {
  x: 28.8,
  z: -27.2,
  rotY: 0,
  width: 7.4,
  depth: 1.2,
  interactX: 28.8,
  interactZ: -25.1,
  interactRadius: 4.4
};

// ----------------------------------------------------------------------------
// High-Resolution Procedural Canvas Textures (Bamboo Weave, ผ้าขาวม้า, Sign)
// ----------------------------------------------------------------------------

function createWovenBambooTexture(repeatX = 4, repeatY = 2.2) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Warm woven bamboo base
  ctx.fillStyle = '#c8a16b';
  ctx.fillRect(0, 0, 512, 512);

  // Diagonal herringbone twill weave (ลายสองไม้ไผ่สาน)
  const step = 16;
  for (let row = -32; row < 64; row++) {
    for (let col = -32; col < 64; col++) {
      const parity = ((row + col) % 4 + 4) % 4;
      const x = col * step;
      const y = row * step;
      const isOver = parity < 2;

      const shade = ((row * 17 + col * 31) & 15) - 7;
      const r = Math.min(255, Math.max(0, (isOver ? 220 : 186) + shade));
      const g = Math.min(255, Math.max(0, (isOver ? 186 : 146) + shade));
      const b = Math.min(255, Math.max(0, (isOver ? 132 : 96) + shade));

      ctx.save();
      ctx.translate(x + step * 0.5, y + step * 0.5);
      ctx.rotate(isOver ? Math.PI / 4 : -Math.PI / 4);

      const grad = ctx.createLinearGradient(-step * 0.7, 0, step * 0.7, 0);
      grad.addColorStop(0, `rgb(${Math.max(0, r - 38)},${Math.max(0, g - 34)},${Math.max(0, b - 28)})`);
      grad.addColorStop(0.25, `rgb(${r},${g},${b})`);
      grad.addColorStop(0.55, `rgb(${Math.min(255, r + 18)},${Math.min(255, g + 16)},${Math.min(255, b + 12)})`);
      grad.addColorStop(1, `rgb(${Math.max(0, r - 42)},${Math.max(0, g - 38)},${Math.max(0, b - 30)})`);

      ctx.fillStyle = grad;
      ctx.fillRect(-step * 0.78, -step * 0.36, step * 1.56, step * 0.72);
      ctx.strokeStyle = 'rgba(72, 46, 18, 0.36)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-step * 0.78, -step * 0.36, step * 1.56, step * 0.72);
      ctx.restore();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  return tex;
}

function createWovenBasketTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Dark interior lattice backdrop (open-work bamboo basket feel)
  ctx.fillStyle = '#3c2712';
  ctx.fillRect(0, 0, 256, 256);

  // Diagonal woven bamboo lattice strips
  ctx.strokeStyle = '#d7b079';
  ctx.lineWidth = 5;
  for (let i = -256; i < 512; i += 14) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 256, 256);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i, 256);
    ctx.lineTo(i + 256, 0);
    ctx.stroke();
  }

  // Concentric horizontal ribs
  ctx.strokeStyle = '#e7c691';
  ctx.lineWidth = 3;
  for (let y = 16; y < 256; y += 26) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1.5);
  return tex;
}

function createPhaKhaoMaTexture(variant = 'blue') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (variant === 'blue') {
    // Left sash: classic blue / navy / white / crimson plaid ผ้าขาวม้า
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, 256, 512);

    const vStripes = [
      { x: 0, w: 34, c: '#1e3a8a' },
      { x: 42, w: 18, c: '#3b82f6' },
      { x: 68, w: 12, c: '#991b1b' },
      { x: 92, w: 38, c: '#1d4ed8' },
      { x: 140, w: 16, c: '#7f1d1d' },
      { x: 168, w: 34, c: '#1e3a8a' },
      { x: 212, w: 14, c: '#dc2626' },
      { x: 234, w: 22, c: '#2563eb' }
    ];
    for (const s of vStripes) {
      ctx.fillStyle = s.c;
      ctx.fillRect(s.x, 0, s.w, 512);
    }

    // Horizontal cross-checks
    for (let y = 0; y < 512; y += 24) {
      ctx.fillStyle = y % 72 === 0 ? 'rgba(185, 28, 28, 0.55)' : 'rgba(30, 58, 138, 0.36)';
      ctx.fillRect(0, y, 256, 9);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
      ctx.fillRect(0, y + 12, 256, 4);
    }
  } else {
    // Right sash: burgundy-red / cream / forest-green striped ผ้าขาวม้า
    ctx.fillStyle = '#f5ede0';
    ctx.fillRect(0, 0, 256, 512);

    const vStripes = [
      { x: 0, w: 28, c: '#166534' },
      { x: 36, w: 14, c: '#14532d' },
      { x: 58, w: 36, c: '#991b1b' },
      { x: 102, w: 16, c: '#b91c1c' },
      { x: 126, w: 22, c: '#15803d' },
      { x: 158, w: 40, c: '#7f1d1d' },
      { x: 206, w: 14, c: '#166534' },
      { x: 228, w: 28, c: '#991b1b' }
    ];
    for (const s of vStripes) {
      ctx.fillStyle = s.c;
      ctx.fillRect(s.x, 0, s.w, 512);
    }

    for (let y = 0; y < 512; y += 28) {
      ctx.fillStyle = y % 84 === 0 ? 'rgba(22, 101, 52, 0.45)' : 'rgba(127, 29, 29, 0.3)';
      ctx.fillRect(0, y, 256, 8);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createPleatedSilkTexture(baseHex, accentHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 128, 256);

  // Crisp vertical pleats with silk sheen
  for (let x = 0; x < 128; x += 16) {
    const g = ctx.createLinearGradient(x, 0, x + 16, 0);
    g.addColorStop(0, 'rgba(0,0,0,0.42)');
    g.addColorStop(0.45, accentHex);
    g.addColorStop(0.75, 'rgba(255,255,255,0.22)');
    g.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, 16, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createDieCutSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 1024, 512);

  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // ---- TOP LINE: "#งานวัดไฮโซ โอ้โห" (Colorful segments with thick white die-cut edge) ----
  const topSegments = [
    { text: '#', color: '#1d4ed8' },
    { text: 'งาน', color: '#db2777' },
    { text: 'วัด', color: '#e11d48' },
    { text: 'ไฮ', color: '#059669' },
    { text: 'โซ', color: '#1e3a8a' },
    { text: ' ', color: '#ffffff' },
    { text: 'โอ้', color: '#dc2626' },
    { text: 'โห', color: '#1d4ed8' }
  ];

  const topFont = '900 116px "Noto Sans Thai", "Sarabun", sans-serif';
  ctx.font = topFont;
  let totalTopW = 0;
  const segWidths = topSegments.map((s) => {
    const w = ctx.measureText(s.text).width;
    totalTopW += w;
    return w;
  });

  const startX = (1024 - totalTopW) / 2;
  const topY = 150;

  // Pass 1: Subtle drop shadow behind the white die-cut sticker
  ctx.save();
  ctx.shadowColor = 'rgba(24, 14, 4, 0.55)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 8;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 34;
  let curX = startX;
  for (let i = 0; i < topSegments.length; i++) {
    ctx.strokeText(topSegments[i].text, curX, topY);
    curX += segWidths[i];
  }
  ctx.restore();

  // Pass 2: Clean crisp white outer die-cut border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 30;
  curX = startX;
  for (let i = 0; i < topSegments.length; i++) {
    ctx.strokeText(topSegments[i].text, curX, topY);
    curX += segWidths[i];
  }

  // Pass 3: Dark thin inner contour + bright colored letter fills
  curX = startX;
  for (let i = 0; i < topSegments.length; i++) {
    const seg = topSegments[i];
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 7;
    ctx.strokeText(seg.text, curX, topY);
    ctx.fillStyle = seg.color;
    ctx.fillText(seg.text, curX, topY);
    curX += segWidths[i];
  }

  // ---- BOTTOM LINE: "ท่าช้าง" (Huge bright yellow letters, black inner outline, thick white die-cut) ----
  const botText = 'ท่าช้าง';
  ctx.font = '900 178px "Noto Sans Thai", "Sarabun", sans-serif';
  ctx.textAlign = 'center';
  const botX = 512;
  const botY = 344;

  // Outer shadow + thick white die-cut border
  ctx.save();
  ctx.shadowColor = 'rgba(24, 14, 4, 0.58)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 9;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 42;
  ctx.strokeText(botText, botX, botY);
  ctx.restore();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 38;
  ctx.strokeText(botText, botX, botY);

  // Bold black outline
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 16;
  ctx.strokeText(botText, botX, botY);

  // Vivid golden-yellow gradient fill
  const yGrad = ctx.createLinearGradient(0, botY - 85, 0, botY + 85);
  yGrad.addColorStop(0, '#fef08a');
  yGrad.addColorStop(0.5, '#facc15');
  yGrad.addColorStop(1, '#eab308');
  ctx.fillStyle = yGrad;
  ctx.fillText(botText, botX, botY);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ----------------------------------------------------------------------------
// 3D Photo Booth Builder
// ----------------------------------------------------------------------------

export function buildPhotoBooth(scene, addCollisionBox, lowGraphics = false) {
  const root = new THREE.Group();
  root.name = 'PhotoBoothThachang';
  root.position.set(PHOTO_BOOTH_CONFIG.x, 0, PHOTO_BOOTH_CONFIG.z);
  root.rotation.y = PHOTO_BOOTH_CONFIG.rotY;

  // Shared Textures & Materials (slightly self-illuminated so night photos look clear even in Low Graphics)
  const bambooWallTex = createWovenBambooTexture(4.6, 2.4);
  const bambooRollTex = createWovenBambooTexture(1.5, 2.4);
  const bambooTrayTex = createWovenBambooTexture(1.8, 1.8);
  const basketLatticeTex = createWovenBasketTexture();
  const phaBlueTex = createPhaKhaoMaTexture('blue');
  const phaRedTex = createPhaKhaoMaTexture('red');
  const silkLeftTex = createPleatedSilkTexture('#6b103f', '#a61c5b');
  const silkRightTex = createPleatedSilkTexture('#7e1674', '#d946ef');
  const signTex = createDieCutSignTexture();

  const bambooWallMat = new THREE.MeshStandardMaterial({
    map: bambooWallTex,
    roughness: 0.85,
    emissive: new THREE.Color(0x3a2814),
    emissiveIntensity: 0.34
  });
  const bambooRollMat = new THREE.MeshStandardMaterial({
    map: bambooRollTex,
    roughness: 0.84,
    emissive: new THREE.Color(0x3a2814),
    emissiveIntensity: 0.36
  });
  const bambooTrayMat = new THREE.MeshStandardMaterial({
    map: bambooTrayTex,
    roughness: 0.82,
    emissive: new THREE.Color(0x3c2914),
    emissiveIntensity: 0.35
  });
  const basketMat = new THREE.MeshStandardMaterial({
    map: basketLatticeTex,
    roughness: 0.86,
    side: THREE.DoubleSide,
    emissive: new THREE.Color(0x342310),
    emissiveIntensity: 0.36
  });
  const strawHatMat = new THREE.MeshStandardMaterial({
    color: 0xe9d3a7,
    map: bambooTrayTex,
    roughness: 0.84,
    side: THREE.DoubleSide,
    emissive: new THREE.Color(0x3a2a15),
    emissiveIntensity: 0.36
  });
  const rimBambooMat = new THREE.MeshStandardMaterial({
    color: 0x9c6e3b,
    roughness: 0.85,
    emissive: new THREE.Color(0x2b1c0b),
    emissiveIntensity: 0.25
  });
  const woodFrameMat = new THREE.MeshStandardMaterial({
    color: 0x5c3d22,
    roughness: 0.9
  });
  const turfMat = new THREE.MeshStandardMaterial({
    color: 0x166534,
    roughness: 0.96,
    emissive: new THREE.Color(0x092b15),
    emissiveIntensity: 0.32
  });

  // 1. Lush Dark-Green Artificial Grass Turf Pad (base + standing photo area)
  const turf = new THREE.Mesh(new THREE.BoxGeometry(7.9, 0.08, 2.3), turfMat);
  turf.position.set(0.12, 0.04, 0.82);
  root.add(turf);

  // 2. Main Woven Bamboo Backdrop Wall (5.9m x 2.95m) + sturdy back support frame
  const wall = new THREE.Mesh(new THREE.BoxGeometry(5.9, 2.95, 0.16), bambooWallMat);
  wall.position.set(0, 1.54, 0);
  root.add(wall);

  // Rear wooden support legs so it looks solid from the back too
  for (const px of [-2.4, 0, 2.4]) {
    const brace = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.9, 0.12), woodFrameMat);
    brace.position.set(px, 1.48, -0.14);
    root.add(brace);
  }

  // 3. Stepped Vertical Woven Bamboo Rolls on BOTH Flanks (Exact count: 2 Left, 3 Right!)
  const rollSpecs = [
    // Left flank (2 rolls stepping UP outward)
    { x: -2.86, r: 0.23, h: 2.36, bottomY: 0.68 },
    { x: -3.32, r: 0.24, h: 2.38, bottomY: 0.94 },
    // Right flank (3 rolls stepping UP outward)
    { x: 2.86, r: 0.22, h: 2.34, bottomY: 0.68 },
    { x: 3.30, r: 0.23, h: 2.38, bottomY: 0.88 },
    { x: 3.74, r: 0.24, h: 2.42, bottomY: 1.12 }
  ];
  const rollCapMat = new THREE.MeshStandardMaterial({ color: 0x432b16, roughness: 0.95 });
  for (const rs of rollSpecs) {
    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(rs.r, rs.r, rs.h, 16, 1, false),
      [bambooRollMat, rollCapMat, rollCapMat]
    );
    cyl.position.set(rs.x, rs.bottomY + rs.h * 0.5, 0.12);
    root.add(cyl);
  }

  // 4. Top Arched Row of 10 Woven Open-Lattice Bamboo Domes (ฝาชี/สุ่ม) + 2 Corner Ngob Hats (งอบ)
  const domeGeo = new THREE.SphereGeometry(0.28, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.46);
  const domeRimGeo = new THREE.TorusGeometry(0.275, 0.022, 6, 18);
  const domeCount = 10;
  for (let i = 0; i < domeCount; i++) {
    const u = i / (domeCount - 1); // 0..1
    const dx = -1.96 + u * 3.92;
    const archLift = Math.sin(u * Math.PI) * 0.16;
    const dy = 2.74 + archLift;

    const domeGroup = new THREE.Group();
    domeGroup.position.set(dx, dy, 0.13);
    domeGroup.rotation.x = Math.PI * 0.52;

    const domeMesh = new THREE.Mesh(domeGeo, basketMat);
    domeMesh.scale.set(1, 0.72, 1);
    domeGroup.add(domeMesh);

    const rim = new THREE.Mesh(domeRimGeo, rimBambooMat);
    rim.rotation.x = Math.PI / 2;
    domeGroup.add(rim);

    // Small woven crown ring at peak
    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.016, 6, 12), rimBambooMat);
    crown.rotation.x = Math.PI / 2;
    crown.position.y = 0.2;
    domeGroup.add(crown);

    root.add(domeGroup);
  }

  // 2 Pale Woven Corner Ngob Hats (งอบใบใหญ่ปิดมุมซ้าย-ขวา)
  const ngobGeo = new THREE.ConeGeometry(0.31, 0.16, 16, 1, true);
  for (const nx of [-2.44, 2.42]) {
    const hatGroup = new THREE.Group();
    hatGroup.position.set(nx, 2.66, 0.15);
    hatGroup.rotation.x = Math.PI * 0.5;

    const cone = new THREE.Mesh(ngobGeo, strawHatMat);
    hatGroup.add(cone);
    const hatRim = new THREE.Mesh(new THREE.TorusGeometry(0.305, 0.018, 6, 18), rimBambooMat);
    hatRim.rotation.x = Math.PI / 2;
    hatRim.position.y = -0.07;
    hatGroup.add(hatRim);
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.04, 10), rimBambooMat);
    tip.position.y = 0.08;
    hatGroup.add(tip);

    root.add(hatGroup);
  }

  // 5. Center Die-Cut Sign ("#งานวัดไฮโซ โอ้โห" / "ท่าช้าง") in crisp 3D relief
  const signMat = new THREE.MeshBasicMaterial({
    map: signTex,
    transparent: true,
    alphaTest: 0.06,
    side: THREE.DoubleSide
  });
  const signPlane = new THREE.Mesh(new THREE.PlaneGeometry(2.85, 1.42), signMat);
  signPlane.position.set(0, 2.02, 0.21);
  root.add(signPlane);

  // 6. Diagonal ผ้าขาวม้า Sashes (Left Blue-Red Plaid & Right Red-Green Striped with Knot Tail)
  const leftSashMat = new THREE.MeshStandardMaterial({
    map: phaBlueTex,
    roughness: 0.78,
    side: THREE.DoubleSide,
    emissive: new THREE.Color(0x1e2640),
    emissiveIntensity: 0.32
  });
  const leftSash = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 1.85), leftSashMat);
  leftSash.position.set(-2.14, 1.82, 0.11);
  leftSash.rotation.z = 0.28;
  root.add(leftSash);

  const rightSashMat = new THREE.MeshStandardMaterial({
    map: phaRedTex,
    roughness: 0.78,
    side: THREE.DoubleSide,
    emissive: new THREE.Color(0x321616),
    emissiveIntensity: 0.32
  });
  const rightSash = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 1.75), rightSashMat);
  rightSash.position.set(2.14, 1.82, 0.11);
  rightSash.rotation.z = -0.22;
  root.add(rightSash);

  // Flared green-red tail fanning out below the right sash knot (just like Photo 3!)
  const rightTail = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.58, 4), rightSashMat);
  rightTail.scale.set(1.0, 1.0, 0.15);
  rightTail.position.set(1.78, 0.76, 0.12);
  rightTail.rotation.z = -0.58;
  root.add(rightTail);

  // 7. Two Vertical Pleated Burgundy / Magenta Silk Ribbons with Top & Bottom Rosette Bows
  function createRosetteBow(colorHex, accentHex) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.55,
      emissive: new THREE.Color(accentHex),
      emissiveIntensity: 0.35
    });
    const petalGeo = new THREE.ConeGeometry(0.055, 0.17, 5);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const p = new THREE.Mesh(petalGeo, mat);
      p.position.set(Math.cos(a) * 0.085, Math.sin(a) * 0.085, 0.02);
      p.rotation.z = a - Math.PI / 2;
      p.scale.set(1, 1, 0.35);
      g.add(p);
    }
    const centerKnot = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 8), mat);
    centerKnot.position.z = 0.04;
    g.add(centerKnot);
    return g;
  }

  const ribbonSpecs = [
    { x: -0.78, topY: 2.18, botY: 0.72, tex: silkLeftTex, bowColor: 0xbe123c, bowAccent: 0x5c0b22 },
    { x: 0.76, topY: 2.16, botY: 0.78, tex: silkRightTex, bowColor: 0xdb2777, bowAccent: 0x6b1146 }
  ];
  for (const rb of ribbonSpecs) {
    const h = rb.topY - rb.botY;
    const stripMat = new THREE.MeshStandardMaterial({
      map: rb.tex,
      roughness: 0.58,
      emissive: new THREE.Color(rb.bowAccent),
      emissiveIntensity: 0.35
    });
    const strip = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, h, 8), stripMat);
    strip.scale.set(1.25, 1, 0.35);
    strip.position.set(rb.x, rb.botY + h * 0.5, 0.13);
    root.add(strip);

    const topBow = createRosetteBow(rb.bowColor, rb.bowAccent);
    topBow.position.set(rb.x, rb.topY, 0.16);
    root.add(topBow);

    const botBow = createRosetteBow(rb.bowColor, rb.bowAccent);
    botBow.position.set(rb.x, rb.botY, 0.16);
    root.add(botBow);
  }

  // 8. Two Large Woven Winnowing Trays (กระด้งสาน) + Crescent Rose Bouquets
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.82,
    emissive: new THREE.Color(0x093518),
    emissiveIntensity: 0.28
  });
  const roseColors = [0xfef08a, 0xfacc15, 0xf472b6, 0xef4444, 0xffffff];
  const roseMats = roseColors.map(
    (hex) =>
      new THREE.MeshStandardMaterial({
        color: hex,
        roughness: 0.55,
        emissive: new THREE.Color(hex),
        emissiveIntensity: 0.22
      })
  );
  const flowerGeo = new THREE.DodecahedronGeometry(0.058, 0);
  const leafGeo = new THREE.SphereGeometry(0.068, 6, 5);

  const traySpecs = [
    { x: -1.46, y: 1.88, r: 0.45, arcStart: -Math.PI * 0.62, arcEnd: Math.PI * 0.08 },
    { x: 1.44, y: 1.92, r: 0.44, arcStart: Math.PI * 0.92, arcEnd: Math.PI * 1.62 }
  ];
  for (const tr of traySpecs) {
    const trayGroup = new THREE.Group();
    trayGroup.position.set(tr.x, tr.y, 0.13);

    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(tr.r, tr.r * 0.96, 0.05, 24),
      bambooTrayMat
    );
    disc.rotation.x = Math.PI / 2;
    trayGroup.add(disc);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(tr.r, 0.026, 8, 26), rimBambooMat);
    rim.position.z = 0.025;
    trayGroup.add(rim);

    // Crescent flower arrangement hugging the inner lower curve of the tray
    const bloomCount = 13;
    for (let i = 0; i < bloomCount; i++) {
      const t = i / (bloomCount - 1);
      const ang = tr.arcStart + (tr.arcEnd - tr.arcStart) * t;
      const rad = tr.r * 0.84;
      const fx = Math.cos(ang) * rad;
      const fy = Math.sin(ang) * rad;

      const lf = new THREE.Mesh(leafGeo, leafMat);
      lf.scale.set(1.3, 0.7, 0.4);
      lf.position.set(fx * 1.04, fy * 1.04, 0.045);
      lf.rotation.z = ang;
      trayGroup.add(lf);

      const bloom = new THREE.Mesh(flowerGeo, roseMats[i % roseMats.length]);
      bloom.position.set(fx, fy, 0.08 + (i % 2) * 0.02);
      bloom.scale.setScalar(0.85 + (i % 3) * 0.14);
      trayGroup.add(bloom);
    }
    root.add(trayGroup);
  }

  // 9. 3D Woven Bamboo Baskets & Fish Traps (ตะกร้า / ข้องดักปลา / กระบุง) Mounted on Wings
  function createHalfBasket() {
    const g = new THREE.Group();
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.15, 0.24, 12, 1, true, 0, Math.PI * 1.15),
      basketMat
    );
    cup.rotation.y = -Math.PI * 0.58;
    g.add(cup);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.016, 6, 14, Math.PI * 1.15), rimBambooMat);
    rim.rotation.x = Math.PI / 2;
    rim.rotation.z = -Math.PI * 0.08;
    rim.position.y = 0.12;
    g.add(rim);
    return g;
  }

  function createFishTrap() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), basketMat);
    body.scale.set(1, 1.18, 0.85);
    g.add(body);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.075, 0.12, 10, 1, true), basketMat);
    neck.position.y = 0.19;
    g.add(neck);
    const mouthRim = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.014, 6, 12), rimBambooMat);
    mouthRim.rotation.x = Math.PI / 2;
    mouthRim.position.y = 0.25;
    g.add(mouthRim);
    return g;
  }

  // Left wing props
  const leftTopBasket = createHalfBasket();
  leftTopBasket.position.set(-2.32, 2.08, 0.18);
  leftTopBasket.rotation.z = -0.14;
  root.add(leftTopBasket);

  const leftTrap = createFishTrap();
  leftTrap.position.set(-2.12, 1.56, 0.22);
  leftTrap.rotation.z = 0.35;
  root.add(leftTrap);

  const leftRoundBasket = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), basketMat);
  leftRoundBasket.scale.set(1.15, 0.88, 0.72);
  leftRoundBasket.position.set(-1.38, 1.24, 0.18);
  leftRoundBasket.rotation.z = 0.22;
  root.add(leftRoundBasket);

  // Right wing props
  const rightTopBasket = createHalfBasket();
  rightTopBasket.position.set(2.26, 2.04, 0.18);
  rightTopBasket.rotation.z = 0.14;
  root.add(rightTopBasket);

  const rightTrap = createFishTrap();
  rightTrap.position.set(2.14, 1.48, 0.22);
  rightTrap.rotation.z = -0.32;
  root.add(rightTrap);

  const rightRoundBasket = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 10), basketMat);
  rightRoundBasket.scale.set(1.05, 0.96, 0.72);
  rightRoundBasket.position.set(1.46, 1.28, 0.18);
  root.add(rightRoundBasket);

  // Small mini floral basket tucked at the right sash knot
  const miniCup = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.065, 0.16, 10), basketMat);
  miniCup.position.set(2.02, 1.0, 0.18);
  root.add(miniCup);
  for (let i = 0; i < 4; i++) {
    const mb = new THREE.Mesh(flowerGeo, roseMats[(i + 2) % roseMats.length]);
    mb.scale.setScalar(0.75);
    mb.position.set(1.96 + i * 0.04, 1.11 + (i % 2) * 0.03, 0.2);
    root.add(mb);
  }

  // 10. Cascading Yellow Golden Shower (ช่อดอกคูณ / ราชพฤกษ์สีเหลืองพวงใหญ่ฝั่งซ้ายล่าง)
  const cassiaGroup = new THREE.Group();
  cassiaGroup.position.set(-1.92, 1.28, 0.24);

  // Leafy top crown + red/white accent flowers
  for (let i = 0; i < 9; i++) {
    const ang = (i / 9) * Math.PI * 2;
    const lf = new THREE.Mesh(leafGeo, leafMat);
    lf.scale.set(1.8, 1.1, 0.8);
    lf.position.set(Math.cos(ang) * 0.18, Math.sin(ang) * 0.12, 0.02);
    cassiaGroup.add(lf);
  }
  for (let i = 0; i < 4; i++) {
    const topRose = new THREE.Mesh(flowerGeo, roseMats[(i + 3) % roseMats.length]);
    topRose.position.set(-0.12 + i * 0.08, 0.1 + (i % 2) * 0.04, 0.08);
    cassiaGroup.add(topRose);
  }

  // 8 pendulous cascading golden-yellow bloom strands (InstancedMesh = only 1 draw call!)
  const cassiaColors = [0xfef08a, 0xfacc15, 0xeab308];
  const cassiaMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6,
    emissive: new THREE.Color(0x9a7408),
    emissiveIntensity: 0.42
  });
  const strandOffsets = [
    { x: -0.24, len: 0.82, z: 0.06 },
    { x: -0.16, len: 0.96, z: 0.12 },
    { x: -0.08, len: 1.04, z: 0.09 },
    { x: 0.0, len: 1.08, z: 0.14 },
    { x: 0.09, len: 0.98, z: 0.1 },
    { x: 0.18, len: 0.86, z: 0.07 },
    { x: -0.12, len: 0.78, z: 0.02 },
    { x: 0.12, len: 0.74, z: 0.02 }
  ];
  const bloomsPerStrand = 9;
  const cassiaInst = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(0.058, 0),
    cassiaMat,
    strandOffsets.length * bloomsPerStrand
  );
  const dummy = new THREE.Object3D();
  const tmpCol = new THREE.Color();
  let cIdx = 0;
  for (let s = 0; s < strandOffsets.length; s++) {
    const st = strandOffsets[s];
    for (let j = 0; j < bloomsPerStrand; j++) {
      const f = j / (bloomsPerStrand - 1);
      dummy.position.set(
        st.x + Math.sin(j * 1.4 + s) * 0.045,
        -0.06 - f * st.len,
        st.z + Math.cos(j * 1.1 + s) * 0.035
      );
      dummy.scale.setScalar(1.08 - f * 0.42);
      dummy.rotation.set(j * 0.6, s * 0.8, 0);
      dummy.updateMatrix();
      cassiaInst.setMatrixAt(cIdx, dummy.matrix);
      tmpCol.setHex(cassiaColors[(cIdx + s) % cassiaColors.length]);
      cassiaInst.setColorAt(cIdx, tmpCol);
      cIdx++;
    }
  }
  cassiaInst.instanceMatrix.needsUpdate = true;
  if (cassiaInst.instanceColor) cassiaInst.instanceColor.needsUpdate = true;
  cassiaGroup.add(cassiaInst);
  root.add(cassiaGroup);

  // 11. Two Ground Photo Floodlight Fixtures + Warm Night Illumination Light
  const lampHousingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.4 });
  const lampLensMat = new THREE.MeshBasicMaterial({ color: 0xfff7d6 });
  for (const lx of [-2.45, 2.45]) {
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.14), lampHousingMat);
    housing.position.set(lx, 0.16, 1.72);
    housing.rotation.x = -0.55;
    root.add(housing);

    const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.11), lampLensMat);
    lens.position.set(lx, 0.19, 1.65);
    lens.rotation.x = -0.55;
    lens.rotation.y = Math.PI;
    root.add(lens);
  }

  // Warm front portrait floodlight so both the bamboo booth & posing players look bright at night
  const photoLight = new THREE.PointLight(0xfff1d0, lowGraphics ? 0 : 28, 16, 1.5);
  photoLight.position.set(0, 2.65, 2.8);
  root.add(photoLight);

  scene.add(root);

  // Collision box strictly around the bamboo wall & flank rolls (so players can step right onto the green turf!)
  if (typeof addCollisionBox === 'function') {
    addCollisionBox(
      PHOTO_BOOTH_CONFIG.x - 3.9,
      PHOTO_BOOTH_CONFIG.x + 4.1,
      PHOTO_BOOTH_CONFIG.z - 0.55,
      PHOTO_BOOTH_CONFIG.z + 0.55
    );
  }

  return { root, photoLight };
}

export function setPhotoBoothGraphicsMode(boothState, lowGraphics) {
  if (!boothState || !boothState.photoLight) return;
  boothState.photoLight.intensity = lowGraphics ? 0 : 28;
}

export function drawPhotoBoothMinimap(ctx, mapX, mapY, mapW, mapH) {
  // Warm amber-gold camera landmark rectangle along the north walkway behind Krathong Tables
  ctx.fillStyle = '#fbbf24';
  ctx.strokeStyle = '#db2777';
  ctx.lineWidth = 1.2;
  const rx = mapX(PHOTO_BOOTH_CONFIG.x - 3.7);
  const ry = mapY(PHOTO_BOOTH_CONFIG.z - 0.8);
  const rw = mapW(7.4);
  const rh = mapH(1.6);
  ctx.fillRect(rx, ry, rw, rh);
  ctx.strokeRect(rx, ry, rw, rh);
}
