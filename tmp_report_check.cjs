// check report sizes and content quality
const fs = require('fs');
const path = require('path');

const base = 'c:/Users/51229/WorkBuddy/Claw/reports';
const files = fs.readdirSync(base, {withFileTypes: true})
  .filter(d => d.isDirectory())
  .flatMap(d => fs.readdirSync(path.join(base, d.name))
    .filter(f => f.startsWith('HRI-2026'))
    .map(f => ({
      name: d.name + '/' + f,
      path: path.join(base, d.name, f),
      size: fs.statSync(path.join(base, d.name, f)).size
    }))
  );

files.sort((a, b) => b.size - a.size);
console.log('=== HRI-2026 Report Files ===');
files.forEach(x => console.log((x.size / 1024).toFixed(1) + 'KB  ' + x.name));

// Also check the humanoid robot outline
const complete = path.join(base, 'HRI-2026-Outline-COMPLETE.md');
if (fs.existsSync(complete)) {
  const content = fs.readFileSync(complete, 'utf8');
  const lines = content.split('\n');
  // Count sections
  const h2 = lines.filter(l => l.startsWith('## '));
  const h3 = lines.filter(l => l.startsWith('### '));
  console.log('\n=== HRI-2026-Outline-COMPLETE.md ===');
  console.log('Lines:', lines.length);
  console.log('## headers:', h2.length);
  console.log('### headers:', h3.length);
  console.log('\nH2 Structure:');
  h2.forEach(h => console.log(' ', h));
} else {
  console.log('\nCOMPLETE.md not found in reports/ root');
}
