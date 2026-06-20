import fs from 'fs';
const s = fs.readFileSync('c:/Users/51229/WorkBuddy/Claw/public/hri-report-2026.html', 'utf8');
const idx = s.indexOf('<script>');
const lineNum = s.substring(0, idx).split('\n').length;
console.log('script start line:', lineNum);
