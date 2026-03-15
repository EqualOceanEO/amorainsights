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

const res = await query("SELECT slug FROM industries ORDER BY slug");
console.log(res.status, res.body);
