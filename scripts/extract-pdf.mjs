import('playwright').then(async ({ chromium }) => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const pdfPath = 'C:\\Users\\51229\\Desktop\\中国储能企业出海中东研究报告2025 .pdf';
  const fileUrl = 'file:///' + pdfPath.replace(/\\/g, '/').replace(/ /g, '%20');

  console.log('Opening:', fileUrl);

  try {
    await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Get page content
    const content = await page.evaluate(() => {
      const body = document.body;
      return body ? body.innerText : 'No content';
    });

    console.log('Content length:', content.length);
    console.log('First 5000 chars:');
    console.log(content.substring(0, 5000));

    // Save to file
    const fs = await import('fs');
    fs.writeFileSync('c:/Users/51229/WorkBuddy/Claw/pdf_content.txt', content, 'utf8');
    console.log('Saved to pdf_content.txt');

  } catch (err) {
    console.error('Error:', err.message);
  }

  await browser.close();
});
