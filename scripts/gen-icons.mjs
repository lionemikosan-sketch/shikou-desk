// 依存ライブラリなしで PWA アイコン(PNG)を生成する。
// インディゴの角丸スクエアに、白いミニ・マインドマップのグリフを描く。
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../public');
mkdirSync(outDir, { recursive: true });

const BG = [99, 102, 241]; // indigo-500
const FG = [255, 255, 255];

// 角丸スクエア判定（正規化座標 0..1, 半径 r）
function inRoundedRect(x, y, r) {
  const cx = Math.min(Math.max(x, r), 1 - r);
  const cy = Math.min(Math.max(y, r), 1 - r);
  const dx = x - cx;
  const dy = y - cy;
  if (x >= r && x <= 1 - r) return true;
  if (y >= r && y <= 1 - r) return true;
  return dx * dx + dy * dy <= r * r;
}

function inCircle(x, y, cx, cy, rad) {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= rad * rad;
}

// 線分(a→b)からの距離が w 以下か
function nearSegment(x, y, ax, ay, bx, by, w) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = x - ax;
  const wy = y - ay;
  const len2 = vx * vx + vy * vy || 1e-9;
  let t = (wx * vx + wy * vy) / len2;
  t = Math.max(0, Math.min(1, t));
  const px = ax + t * vx;
  const py = ay + t * vy;
  const dx = x - px;
  const dy = y - py;
  return dx * dx + dy * dy <= w * w;
}

// グリフ（中央ノード + 左右の子ノード + 接続線）
const NODES = [
  { x: 0.5, y: 0.37, r: 0.092 },
  { x: 0.32, y: 0.67, r: 0.066 },
  { x: 0.68, y: 0.67, r: 0.066 },
];
const LINES = [
  [0.5, 0.37, 0.32, 0.67],
  [0.5, 0.37, 0.68, 0.67],
];

function isGlyph(x, y) {
  for (const [ax, ay, bx, by] of LINES) {
    if (nearSegment(x, y, ax, ay, bx, by, 0.026)) return true;
  }
  for (const n of NODES) {
    if (inCircle(x, y, n.x, n.y, n.r)) return true;
  }
  return false;
}

// 正規化座標の色（RGBA 0..255）。範囲外は透明。
function sample(nx, ny) {
  if (!inRoundedRect(nx, ny, 0.22)) return [0, 0, 0, 0];
  if (isGlyph(nx, ny)) return [FG[0], FG[1], FG[2], 255];
  return [BG[0], BG[1], BG[2], 255];
}

function render(size) {
  const SS = 4; // スーパーサンプリングでアンチエイリアス
  const data = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const nx = (px + (sx + 0.5) / SS) / size;
          const ny = (py + (sy + 0.5) / SS) / size;
          const c = sample(nx, ny);
          r += c[0] * c[3];
          g += c[1] * c[3];
          b += c[2] * c[3];
          a += c[3];
        }
      }
      const n = SS * SS;
      const alpha = a / n;
      const idx = (py * size + px) * 4;
      if (alpha <= 0) {
        data[idx] = data[idx + 1] = data[idx + 2] = data[idx + 3] = 0;
      } else {
        data[idx] = Math.round(r / a);
        data[idx + 1] = Math.round(g / a);
        data[idx + 2] = Math.round(b / a);
        data[idx + 3] = Math.round(alpha);
      }
    }
  }
  return data;
}

// ---- PNG エンコード（color type 6, 8bit） ----
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function writePNG(name, size) {
  const rgba = render(size);
  writeFileSync(resolve(outDir, name), encodePNG(size, rgba));
  console.log('  ✓', name, `(${size}x${size})`);
}

console.log('PWA アイコンを生成:');
writePNG('pwa-192x192.png', 192);
writePNG('pwa-512x512.png', 512);
writePNG('apple-touch-icon.png', 180);

// favicon.svg（同じグリフ）
const lines = LINES.map(
  ([ax, ay, bx, by]) =>
    `<line x1="${ax * 64}" y1="${ay * 64}" x2="${bx * 64}" y2="${by * 64}" stroke="#fff" stroke-width="${0.052 * 64}" stroke-linecap="round"/>`,
).join('');
const circles = NODES.map(
  (n) => `<circle cx="${n.x * 64}" cy="${n.y * 64}" r="${n.r * 64}" fill="#fff"/>`,
).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#6366f1"/>${lines}${circles}</svg>`;
writeFileSync(resolve(outDir, 'favicon.svg'), svg);
console.log('  ✓ favicon.svg');
console.log('完了');
