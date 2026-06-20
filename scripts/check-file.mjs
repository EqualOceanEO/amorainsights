import { readFileSync, statSync } from 'fs';
const p = 'c:/Users/51229/WorkBuddy/Claw/scripts/do-migrate-v2.mjs';
const b = readFileSync(p);
console.log('size:', b.length);
console.log('BOM:', b.slice(0,4).toString('hex'));
// check for null bytes or non-utf8
let bad = 0;
for (let i = 0; i < b.length; i++) { if (b[i] === 0) bad++; }
console.log('null bytes:', bad);
