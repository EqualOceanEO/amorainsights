import https from 'https';

const PAT = 'sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc';
const URL = 'https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/query';

async function execSQL(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const u = new globalThis.URL(URL);
    const options = {
      hostname: u.hostname,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAT}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        console.log(`[${res.statusCode}] ${sql.slice(0, 80)}`);
        if (res.statusCode === 201 || res.statusCode === 200) resolve(data);
        else reject(new Error(`HTTP ${res.statusCode}: ${data}`));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const sqls = [
  "ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_format TEXT NOT NULL DEFAULT 'markdown'",
  "ALTER TABLE reports ADD COLUMN IF NOT EXISTS html_content TEXT",
];

for (const sql of sqls) {
  try {
    await execSQL(sql);
  } catch(e) {
    console.error('ERR:', e.message);
  }
}
console.log('Migration done.');
