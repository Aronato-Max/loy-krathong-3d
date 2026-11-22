import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SRC_DIR = 'models_original_backup';
const OUT_DIR = 'public/models';
const TMP_DIR = 'models_tmp_mobile';

fs.mkdirSync(TMP_DIR, { recursive: true });
const npxBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function runTransform(args) {
  execFileSync(npxBin, ['--yes', '@gltf-transform/cli', ...args], {
    stdio: 'pipe',
    shell: process.platform === 'win32'
  });
}

function inspectStats(filePath) {
  const buf = fs.readFileSync(filePath);
  const jsonLen = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.slice(20, 20 + jsonLen).toString('utf8'));
  let tris = 0;
  for (const n of gltf.nodes || []) {
    if (n.mesh !== undefined) {
      for (const p of gltf.meshes[n.mesh].primitives) {
        const a = p.indices !== undefined ? gltf.accessors[p.indices] : gltf.accessors[p.attributes.POSITION];
        tris += (a ? a.count : 0) / 3;
      }
    }
  }
  return {
    size: buf.length,
    tris: Math.round(tris),
    nodeNames: new Set((gltf.nodes || []).map((n) => n.name).filter(Boolean)),
    animCount: (gltf.animations || []).length
  };
}

const TARGETS = [
  {
    file: 'krathong_tables.glb',
    ratio: '0.18',
    error: '0.005',
    requiredNodes: []
  },
  {
    file: 'temple_wall.glb',
    ratio: '0.25',
    error: '0.005',
    requiredNodes: ['TempleFence_Root', 'FencePillar_0', 'FenceBay_1']
  },
  {
    file: 'motorcycles.glb',
    ratio: '0.38',
    error: '0.004',
    requiredNodes: [
      'Moto01_GrandFilano_Blue',
      'Moto02_Wave125i_BlueRed',
      'Moto03_SuperCub_Orange',
      'Moto04_Fazzio_Khaki',
      'Moto05_Scoopy_Club12_Red'
    ]
  },
  {
    file: 'concert_stage.glb',
    ratio: '0.38',
    error: '0.005',
    requiredNodes: []
  }
];

for (const t of TARGETS) {
  const srcPath = path.join(SRC_DIR, t.file);
  const tmpSimp = path.join(TMP_DIR, `s_${t.file}`);
  const tmpWebp = path.join(TMP_DIR, `w_${t.file}`);
  const outPath = path.join(OUT_DIR, t.file);

  const before = inspectStats(srcPath);

  runTransform(['simplify', srcPath, tmpSimp, '--ratio', t.ratio, '--error', t.error]);
  try {
    runTransform(['webp', tmpSimp, tmpWebp, '--quality', '88', '--slots', '*']);
  } catch {
    fs.copyFileSync(tmpSimp, tmpWebp);
  }
  runTransform(['draco', tmpWebp, outPath, '--method', 'edgebreaker']);

  const after = inspectStats(outPath);
  const missing = t.requiredNodes.filter((n) => !after.nodeNames.has(n));
  if (missing.length > 0 || after.animCount < before.animCount) {
    console.error(`ROLLBACK ${t.file}: missing=${missing.join(',')} anims=${after.animCount}/${before.animCount}`);
    // Re-compress without simplify as fallback
    runTransform(['webp', srcPath, tmpWebp, '--quality', '88', '--slots', '*']);
    runTransform(['draco', tmpWebp, outPath, '--method', 'edgebreaker']);
    continue;
  }

  console.log(
    `${t.file.padEnd(22)} tris: ${before.tris} -> ${after.tris} (-${((1 - after.tris / before.tris) * 100).toFixed(1)}%) | size: ${(after.size / 1024).toFixed(0)}KB | anims=${after.animCount}`
  );
}

fs.rmSync(TMP_DIR, { recursive: true, force: true });
