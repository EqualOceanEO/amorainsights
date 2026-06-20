import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const pdfPath = 'C:\\Users\\51229\\Desktop\\中国储能企业出海中东研究报告2025 .pdf';
const outputPath = 'C:\\Users\\51229\\WorkBuddy\\Claw\\pdf_content.md';

// Use pdftotext if available, otherwise use pdf-parse
try {
  // Try using pdftotext (poppler)
  const result = execSync(`pdftotext -layout "${pdfPath}" -`, { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 });
  writeFileSync(outputPath, result, 'utf-8');
  console.log(`Converted using pdftotext. Characters: ${result.length}`);
} catch (e) {
  console.log('pdftotext not available, trying pdf-parse...');
  try {
    const pdfParse = require('pdf-parse');
    const fs = require('fs');
    const data = fs.readFileSync(pdfPath);
    const PDFParser = new pdfParse();
    const dataRet = await PDFParser.pdf2json(data);
    console.log('pdf-parse result:', dataRet);
  } catch (e2) {
    console.error('Error:', e2.message);
  }
}
