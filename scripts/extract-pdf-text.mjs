import { readFileSync, writeFileSync } from 'fs';

const pdfPath = 'C:\\Users\\51229\\Desktop\\中国储能企业出海中东研究报告2025 .pdf';

console.log('Reading PDF:', pdfPath);

const buffer = readFileSync(pdfPath);
console.log('File size:', buffer.length, 'bytes');

// Convert to string, handling binary data
const content = buffer.toString('latin1');

// Extract text between parentheses (PDF string literals)
// This is a simplified extraction - real PDF text is more complex
const textFragments = [];
const regex = /\(([^)]*)\)/g;
let match;

while ((match = regex.exec(content)) !== null) {
  const text = match[1];
  // Check if it looks like actual text (has Chinese chars or readable English)
  if (/[\u4e00-\u9fff]/.test(text) || (text.length > 3 && /[a-zA-Z]/.test(text))) {
    textFragments.push(text);
  }
}

console.log('Found', textFragments.length, 'text fragments');

const fullText = textFragments.join('\n');
console.log('\nFirst 3000 characters:');
console.log(fullText.substring(0, 3000));

writeFileSync('c:/Users/51229/WorkBuddy/Claw/pdf_extracted.txt', fullText, 'utf8');
console.log('\nSaved to pdf_extracted.txt');
