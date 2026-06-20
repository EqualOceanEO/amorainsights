const { execSync } = require('child_process');
const fs = require('fs');

const pdfPath = 'C:\\Users\\51229\\Desktop\\中国储能企业出海中东研究报告2025 .pdf';
const outputPath = 'C:\\Users\\51229\\WorkBuddy\\Claw\\pdf_content.txt';

try {
  console.log('Attempting pdftotext...');
  const result = execSync(`pdftotext -layout "${pdfPath}" -`, {
    encoding: 'utf8',
    maxBuffer: 100 * 1024 * 1024
  });
  fs.writeFileSync(outputPath, result, 'utf8');
  console.log('Success! Chars:', result.length);
} catch (e) {
  console.log('pdftotext error:', e.message);
}
