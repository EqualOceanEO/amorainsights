const fs = require('fs');
const c = fs.readFileSync('c:/Users/51229/WorkBuddy/Claw/HRI-2026-Outline-COMPLETE.md', 'utf8');
const lines = c.split('\n');

// Find === dividers which mark section boundaries
const dividers = [];
lines.forEach((l, i) => { if (l.startsWith('===')) dividers.push(i); });
console.log('=== Dividers at lines:', dividers);

// Check sections by divider ranges
const sections = [];
for (let i = 0; i < dividers.length; i++) {
  const start = dividers[i] + 1;
  const end = dividers[i+1] || lines.length;
  const slice = lines.slice(start, end);
  const h2 = slice.filter(l => l.startsWith('## '));
  const h3 = slice.filter(l => l.startsWith('### '));
  const firstLine = slice.find(l => l.trim());
  sections.push({ start, end, h2: h2.length, h3: h3.length, title: firstLine || '' });
}
sections.forEach((s, i) => {
  if (s.title) console.log('Section ' + i + ': ' + s.h2 + ' H2, ' + s.h3 + ' H3 - ' + s.title.substring(0, 60));
});

// Dollar mentions
const dollarCount = (c.match(/\\$/g) || []).length;
const usdCount = (c.match(/\\$[0-9]/g) || []).length;
console.log('\nDollar sign mentions:', dollarCount);
console.log('USD numbers:', usdCount);

// Show first 200 chars of content after first divider
console.log('\n=== Sample content (after first ===) ===');
const sample = lines.slice(dividers[1]+1 || 0, dividers[1]+20 || 20);
sample.forEach(l => { if(l.trim()) console.log(l.substring(0, 100)); });

// Check companies section
const compIdx = lines.findIndex(l => l.includes('25 Companies') || l.includes('25家'));
if (compIdx >= 0) {
  console.log('\n=== Companies section found at line', compIdx, '===');
  lines.slice(compIdx, compIdx+30).forEach(l => { if(l.trim()) console.log(l.substring(0, 120)); });
}

// Check AMORA Score section
const scoreIdx = lines.findIndex(l => l.includes('AMORA Score') || l.includes('评分'));
if (scoreIdx >= 0) {
  console.log('\n=== Score section found at line', scoreIdx, '===');
  lines.slice(scoreIdx, scoreIdx+20).forEach(l => { if(l.trim()) console.log(l.substring(0, 120)); });
}
