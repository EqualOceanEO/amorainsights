import { readFileSync, writeFileSync } from 'fs';
import { PDFParse } from 'pdf-parse';

const pdfPath = 'C:\\Users\\51229\\Desktop\\中国储能企业出海中东研究报告2025 .pdf';

console.log('Reading PDF:', pdfPath);

const dataBuffer = readFileSync(pdfPath);
console.log('File size:', dataBuffer.length, 'bytes');

try {
  const parser = new PDFParse();
  const data = await parser.parse(dataBuffer);
  console.log('Number of pages:', data.numpages);
  console.log('Text length:', data.text.length);

  console.log('\n=== First 5000 characters ===');
  console.log(data.text.substring(0, 5000));

  // Save full text
  writeFileSync('c:/Users/51229/WorkBuddy/Claw/pdf_full_text.txt', data.text, 'utf8');
  console.log('\nSaved full text to pdf_full_text.txt');

} catch (err) {
  console.error('Error parsing PDF:', err.message);
  console.error(err.stack);
}
