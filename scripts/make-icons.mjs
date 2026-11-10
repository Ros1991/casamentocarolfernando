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

// Ícone pequeno das notificações no Android: o sistema usa só a silhueta (canal alfa) e pinta de branco.
// Um ícone com fundo opaco vira um quadrado branco, então aqui sai só o "A | F" branco em fundo transparente.
const badgeSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
  <g font-family="Georgia, serif" font-weight="700" fill="#fff" text-anchor="middle">
    <text x="24" y="68" font-size="56">A</text>
    <rect x="46.5" y="22" width="3" height="54" rx="1.5"/>
    <text x="73" y="68" font-size="56">F</text>
  </g>
</svg>`,
);
await sharp(badgeSvg, { density: 288 }).resize(96, 96).png().toFile(path.join(outDir, 'badge.png'));
console.log('ok badge.png');
