import fs from 'fs';
const s = fs.readFileSync('c:/Users/51229/WorkBuddy/Claw/public/hri-report-2026.html', 'utf8');
const lines = s.split('\n');
const keywords = ['paywall','subscribe','cta','CTA','disclaimer','</body>','<footer','screen-inner','company-card','amora-radar','radar-wrap'];
lines.forEach((l, i) => {
  if (keywords.some(k => l.includes(k))) {
    console.log((i+1) + ': ' + l.substring(0, 120));
  }
});
