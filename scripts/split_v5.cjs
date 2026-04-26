// Build chapter HTML files from v5.0 using Node.js
const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\51229\\WorkBuddy\\Claw';
const SRC  = path.join(BASE, 'HRI-2026-AMORA-Report-v5.0.html');
const DEST = path.join(BASE, 'public');

const content = fs.readFileSync(SRC, 'utf-8');
const lines = content.split('\n');

// Find <style> and </style> line indices
let cssStartIdx = -1;
let cssEndIdx = -1;
for (let i = 0; i < 1500 && i < lines.length; i++) {
  if (lines[i].trim() === '<style>') { cssStartIdx = i; }
  if (lines[i].includes('</style>')) { cssEndIdx = i; break; }
}
console.log('CSS: <style> at line', cssStartIdx + 1, ', </style> at line', cssEndIdx + 1);

// Extract CSS block (only the content between <style> and </style>, not the tags themselves)
const cssBlock = lines.slice(cssStartIdx + 1, cssEndIdx).join('\n') + '\n';

// JS blocks
const jsMapping = lines.slice(2950, 3155).join('\n');  // lines 2951-3155 (0-idx: 2950-3154)
const jsReach   = lines.slice(3155, 3325).join('\n'); // lines 3156-3325
const jsAssets  = lines.slice(2950, 3258).join('\n');  // lines 2951-3258

const sections = [
  ['advancement', 1417, 1557, ''],
  ['mapping',     1557, 2072, jsMapping],
  ['operations',  2072, 2269, ''],
  ['reach',       2269, 2543, jsReach],
  ['assets',      2543, 2902, jsAssets],
];

const fnameMap = {
  advancement: 'hri-report-part-a-advancement-v1.html',
  mapping:    'hri-report-part-m-mapping-v1.html',
  operations: 'hri-report-part-o-operations-v1.html',
  reach:      'hri-report-part-r-reach-v1.html',
  assets:     'hri-report-part-a2-assets-v1.html',
};

for (const [secId, start, end, jsBlock] of sections) {
  const chHtml = lines.slice(start, end).join('\n');
  const page = [
    '<!DOCTYPE html>',
    '<html lang="zh-CN">',
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `<title>AMORA HRI 2026 - ${secId}</title>`,
    '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>',
    '<style>',
    cssBlock,
    '</style>',
    jsBlock,
    '</head>',
    '<body>',
    chHtml,
    '</body>',
    '</html>',
  ].join('\n');

  const outPath = path.join(DEST, fnameMap[secId]);
  fs.writeFileSync(outPath, page, 'utf-8');
  console.log(`Wrote ${fnameMap[secId]}  (${Math.round(page.length/1024)} KB)`);
}

// English version
const srcEn = path.join(BASE, 'HRI-2026-AMORA-Report-v5.0-en.html');
if (fs.existsSync(srcEn)) {
  const enContent = fs.readFileSync(srcEn, 'utf-8');
  const enLines = enContent.split('\n');
  const enCssEndIdx = enLines.findIndex((l, i) => l.includes('</style>') && i < 1500);
  const enCssBlock = enLines.slice(0, enCssEndIdx + 1).join('\n') + '\n';
  const enJsMapping = enLines.slice(2950, 3155).join('\n');
  const enJsReach   = enLines.slice(3155, 3325).join('\n');
  const enJsAssets  = enLines.slice(2950, 3258).join('\n');

  for (const [secId, start, end, _] of sections) {
    const jsKey = secId === 'mapping' ? enJsMapping : secId === 'reach' ? enJsReach : secId === 'assets' ? enJsAssets : '';
    const chHtml = enLines.slice(start, end).join('\n');
    const page = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '<meta charset="UTF-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      `<title>AMORA HRI 2026 - ${secId}</title>`,
      '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>',
      '<style>',
      enCssBlock,
      '</style>',
      jsKey,
      '</head>',
      '<body>',
      chHtml,
      '</body>',
      '</html>',
    ].join('\n');

    const enFname = fnameMap[secId].replace('.html', '-en.html');
    const outPath = path.join(DEST, enFname);
    fs.writeFileSync(outPath, page, 'utf-8');
    console.log(`Wrote ${enFname}  (${Math.round(page.length/1024)} KB)`);
  }
} else {
  console.log('English source not found, skipping English chapters.');
}

console.log('Done.');
