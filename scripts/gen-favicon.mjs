import { createCanvas } from 'canvas';
import fs from 'fs';

function drawG(ctx, size) {
  const s = size / 32;

  // Background rounded rect
  const r = 7 * s;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.arcTo(size, 0, size, r, r);
  ctx.lineTo(size, size - r);
  ctx.arcTo(size, size, size - r, size, r);
  ctx.lineTo(r, size);
  ctx.arcTo(0, size, 0, size - r, r);
  ctx.lineTo(0, r);
  ctx.arcTo(0, 0, r, 0, r);
  ctx.closePath();
  ctx.fillStyle = '#060d1c';
  ctx.fill();

  // Three bars with gradient
  const bars = [
    { x: 5, y: 9,  w: 22, opacity: 1.0 },
    { x: 5, y: 15, w: 16, opacity: 0.7 },
    { x: 5, y: 21, w: 10, opacity: 0.4 },
  ];

  for (const bar of bars) {
    const grad = ctx.createLinearGradient(bar.x * s, 0, (bar.x + bar.w) * s, 0);
    grad.addColorStop(0, `rgba(29,78,216,${bar.opacity})`);
    grad.addColorStop(1, `rgba(96,165,250,${bar.opacity})`);
    ctx.fillStyle = grad;
    const bx = bar.x * s, by = bar.y * s, bw = bar.w * s, bh = 3 * s, br = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(bx + br, by);
    ctx.lineTo(bx + bw - br, by);
    ctx.arcTo(bx + bw, by, bx + bw, by + br, br);
    ctx.lineTo(bx + bw, by + bh - br);
    ctx.arcTo(bx + bw, by + bh, bx + bw - br, by + bh, br);
    ctx.lineTo(bx + br, by + bh);
    ctx.arcTo(bx, by + bh, bx, by + bh - br, br);
    ctx.lineTo(bx, by + br);
    ctx.arcTo(bx, by, bx + br, by, br);
    ctx.closePath();
    ctx.fill();
  }
}

// Generate sizes
const sizes = [16, 32, 48, 180];
for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  drawG(ctx, size);
  const name = size === 180 ? 'apple-touch-icon.png' : `favicon-${size}x${size}.png`;
  fs.writeFileSync(`public/${name}`, canvas.toBuffer('image/png'));
  console.log(`✓ public/${name}`);
}

// favicon.ico = 32x32 PNG copy (browsers accept PNG-based .ico)
fs.copyFileSync('public/favicon-32x32.png', 'public/favicon.ico');
console.log('✓ public/favicon.ico');
