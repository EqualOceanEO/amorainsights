import https from 'https';
import fs from 'fs';

// Read the HRI report HTML
const htmlContent = fs.readFileSync('c:/Users/51229/WorkBuddy/Claw/public/hri-report-2026.html', 'utf8');

console.log('HTML size:', (htmlContent.length / 1024).toFixed(1), 'KB');

// Check if HRI report already exists
async function query(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const opts = {
      hostname: 'api.supabase.com',
      path: '/v1/projects/jqppcuccqkxhhrvndsil/database/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, (r) => {
      let d = '';
      r.on('data', (c) => (d += c));
      r.on('end', () => resolve({ status: r.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Check existing
const check = await query("SELECT id, slug FROM reports WHERE slug = 'humanoid-robotics-intelligence-2026'");
console.log('Check existing:', check.status, check.body);

const existing = JSON.parse(check.body);
if (existing.length > 0) {
  console.log('HRI report already exists, updating html_content...');
  // Use supabase REST API for update with large payload
  const updateSql = `UPDATE reports SET html_content = $html$${htmlContent}$html$, report_format = 'html', updated_at = NOW() WHERE slug = 'humanoid-robotics-intelligence-2026' RETURNING id, slug, report_format`;
  const res = await query(updateSql);
  console.log('Update status:', res.status);
  console.log('Update result:', res.body.slice(0, 200));
} else {
  console.log('Inserting new HRI report...');
  const insertSql = `
    INSERT INTO reports (
      title, slug, summary, report_format, html_content,
      industry_slug, is_premium, author, tags,
      production_status, compliance_tier, compliance_status, geo_risk_tier, effective_tier,
      sensitivity_tags, downgrade_authorized_by, published_at
    ) VALUES (
      'Humanoid Robotics Intelligence Report 2026: China vs Global',
      'humanoid-robotics-intelligence-2026',
      'AMORA''s inaugural Humanoid Robotics Intelligence (HRI) report benchmarks 9 leading humanoid robot companies — Unitree, UBTECH, Agibot, Fourier Intelligence, Zhiyuan Robotics, Boston Dynamics, Tesla Optimus, Figure AI, and 1X Technologies — across the five-dimensional AMORA framework: Technology Advancement, Team Mastery, Operations, Global Reach, and Affinity. China holds a commanding lead in cost efficiency and manufacturing scale; the US leads on algorithm depth and brand power.',
      'html',
      $html$${htmlContent}$html$,
      'intelligent-manufacturing',
      false,
      'AMORA Research',
      ARRAY['humanoid-robotics', 'amora-score', 'unitree', 'boston-dynamics', 'tesla-optimus'],
      'published',
      'STANDARD',
      'APPROVED',
      'G0',
      'STANDARD',
      '[]'::jsonb,
      ARRAY[]::text[],
      NOW()
    ) RETURNING id, slug, report_format
  `;
  const res = await query(insertSql);
  console.log('Insert status:', res.status);
  console.log('Insert result:', res.body.slice(0, 300));
}
