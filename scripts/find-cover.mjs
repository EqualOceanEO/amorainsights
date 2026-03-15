import fs from 'fs';
const s = fs.readFileSync('c:/Users/51229/WorkBuddy/Claw/public/hri-report-2026.html', 'utf8');
const lines = s.split('\n');
lines.forEach((l, i) => {
  if (l.includes('cover-screen') || l.includes('.cover-inner') || l.includes('cover-h1')) {
    console.log((i+1) + ': ' + l.substring(0, 100));
  }
});
