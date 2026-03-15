import https from 'https';

const body = JSON.stringify({ query: "SELECT id,title,slug,report_format,is_premium,published_at FROM reports ORDER BY created_at DESC LIMIT 10" });

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
  r.on('end', () => {
    console.log('status:', r.statusCode);
    console.log(d);
  });
});
req.write(body);
req.end();
