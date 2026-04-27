const fs = require('fs');
const f = 'c:/Users/51229/WorkBuddy/Claw/HRI-2026-Outline-COMPLETE.md';
const c = fs.readFileSync(f, 'utf8');
const lines = c.split('\n');
const h2 = lines.filter(l => l.startsWith('## '));
const h3 = lines.filter(l => l.startsWith('### '));
const h1 = lines.filter(l => l.startsWith('# ') || l.startsWith('# PART') || l.startsWith('==='));
console.log('Total lines:', lines.length);
console.log('H2 sections:', h2.length);
console.log('H3 subsections:', h3.length);

// Check each chapter
const partHeaders = ['# PART 0', '# PART A', '# PART M', '# PART O', '# PART R', '# PART A2'];
partHeaders.forEach(ph => {
  const idx = lines.findIndex(l => l.includes(ph));
  if (idx >= 0) {
    const endIdx = lines.findIndex((l, i) => i > idx && l.startsWith('==='));
    const section = lines.slice(idx, endIdx > 0 ? endIdx : lines.length);
    const subh2 = section.filter(l => l.startsWith('## '));
    const subh3 = section.filter(l => l.startsWith('### '));
    console.log('\n' + ph + ': ' + section.length + ' lines, ' + subh2.length + ' H2, ' + subh3.length + ' H3');
    subh2.forEach(h => console.log('  ', h.replace(/^## /, '')));
  }
});

// Check key data presence
const checks = [
  ['宇树', '宇树科技数据'],
  ['Figure', 'Figure AI数据'],
  ['Tesla', '特斯拉数据'],
  ['AMORA Score', 'AMORA评分体系'],
  ['50+', '关键数字'],
  ['亿', '人民币数据'],
  ['$', '美元数据'],
  ['2025', '2025数据'],
  ['2026', '2026预测'],
];
console.log('\n=== Key Data Checks ===');
checks.forEach(([kw, label]) => {
  const count = (c.match(new RegExp(kw, 'g')) || []).length;
  console.log(label + ' (' + kw + '): ' + count + ' mentions');
});
