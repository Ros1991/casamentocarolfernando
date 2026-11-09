// Gera os ícones PNG do PWA a partir de client/public/monograma.svg (usa o sharp já instalado no server).
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

// sharp fica hoisted no node_modules da raiz (workspaces)
const require = createRequire(import.meta.url);
const sharp = require('sharp');

const root = path.resolve(import.meta.dirname, '..');
const svgPath = path.join(root, 'client/public/monograma.svg');
const outDir = path.join(root, 'client/public/icons');
await fs.mkdir(outDir, { recursive: true });

const svg = await fs.readFile(svgPath);

const targets = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon.png', size: 64 },
];

for (const t of targets) {
  await sharp(svg, { density: 384 }).resize(t.size, t.size).png().toFile(path.join(outDir, t.name));
  console.log('ok', t.name);
}

// Maskable: conteúdo com margem de segurança (80% central) sobre fundo creme.
const inner = await sharp(svg, { density: 384 }).resize(410, 410).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#f3f1ea' } })
  .composite([{ input: inner, gravity: 'centre' }])
  .png()
  .toFile(path.join(outDir, 'icon-512-maskable.png'));
console.log('ok icon-512-maskable.png');
