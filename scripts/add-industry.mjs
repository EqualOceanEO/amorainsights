import https from 'https';

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

// Insert all 6 top-level industry slugs that the frontend uses
const slugs = [
  { slug: 'manufacturing', name: 'Manufacturing', name_cn: '未来制造', icon: '🦾', sort_order: 40 },
];

for (const ind of slugs) {
  const sql = `INSERT INTO industries (slug, name, name_cn, icon, sort_order) VALUES ('${ind.slug}', '${ind.name}', '${ind.name_cn}', '${ind.icon}', ${ind.sort_order}) ON CONFLICT (slug) DO NOTHING RETURNING slug`;
  const res = await query(sql);
  console.log(ind.slug, res.status, res.body);
}
