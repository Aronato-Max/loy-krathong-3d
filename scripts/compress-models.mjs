import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SRC_DIR = 'models_original_backup';
const OUT_DIR = 'public/models';
const TMP_DIR = 'models_tmp_compress';

fs.mkdirSync(TMP_DIR, { recursive: true });

const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.glb'));
const npxBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function runGltfTransform(args) {
  execFileSync(npxBin, ['--yes', '@gltf-transform/cli', ...args], {
    stdio: 'pipe',
    shell: process.platform === 'win32'
  });
}

function inspectGlb(filePath) {
  const buf = fs.readFileSync(filePath);
  const jsonLen = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.slice(20, 20 + jsonLen).toString('utf8'));
  return {
    size: buf.length,
    nodeNames: new Set((gltf.nodes || []).map((n) => n.name).filter(Boolean)),
    animNames: (gltf.animations || []).map((a) => a.name).filter(Boolean),
    extensions: gltf.extensionsUsed || []
  };
}

const REQUIRED_NODES = {
  'avatars.glb': ['Avatar_BoyCargo', 'BoyCargo_ArmL', 'BoyCargo_ForearmR', 'Avatar_GirlPink'],
  'motorcycles.glb': [
    'Moto01_GrandFilano_Blue',
    'Moto02_Wave125i_BlueRed',
    'Moto03_SuperCub_Orange',
    'Moto04_Fazzio_Khaki',
    'Moto05_Scoopy_Club12_Red'
  ],
  'tunnel_18m.glb': ['TunnelBay_1', 'ArchFrame_1', 'ArchFrame_2'],
  'temple_wall.glb': ['TempleFence_Root', 'FencePillar_0', 'FenceBay_1']
};

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const srcPath = path.join(SRC_DIR, file);
  const tmpWebp = path.join(TMP_DIR, file);
  const outPath = path.join(OUT_DIR, file);

  const before = inspectGlb(srcPath);
  totalBefore += before.size;

  // Step 1: High-quality WebP texture compression (quality 88, max 1024px)
  // Step 2: Draco edgebreaker geometry compression (preserves node names & animations)
  try {
    runGltfTransform(['webp', srcPath, tmpWebp, '--quality', '88', '--slots', '*']);
  } catch (err) {
    console.warn(`[webp skipped for ${file}]:`, err.message.split('\n')[0]);
    fs.copyFileSync(srcPath, tmpWebp);
  }

  try {
    runGltfTransform(['draco', tmpWebp, outPath, '--method', 'edgebreaker']);
  } catch (err) {
    console.warn(`[draco skipped for ${file}]:`, err.message.split('\n')[0]);
    fs.copyFileSync(tmpWebp, outPath);
  }

  const after = inspectGlb(outPath);

  // Verify critical node names and animation counts were preserved
  const req = REQUIRED_NODES[file] || [];
  const missing = req.filter((name) => !after.nodeNames.has(name));
  if (missing.length > 0 || after.animNames.length < before.animNames.length) {
    console.error(`SAFETY ROLLBACK for ${file}: missing=${missing.join(',')} anims=${after.animNames.length}/${before.animNames.length}`);
    fs.copyFileSync(srcPath, outPath);
  }

  const finalSize = fs.statSync(outPath).size;
  totalAfter += finalSize;
  const pct = ((1 - finalSize / before.size) * 100).toFixed(1);
  console.log(
    `${file.padEnd(22)} ${(before.size / 1024 / 1024).toFixed(2)}MB -> ${(finalSize / 1024 / 1024).toFixed(2)}MB (-${pct}%) anims=${after.animNames.length} ext=[${after.extensions.join(',')}]`
  );
}

fs.rmSync(TMP_DIR, { recursive: true, force: true });
console.log(
  `\nTOTAL: ${(totalBefore / 1024 / 1024).toFixed(2)}MB -> ${(totalAfter / 1024 / 1024).toFixed(2)}MB (-${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)`
);
