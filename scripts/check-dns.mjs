// Check DNS records for amorainsights.com - DKIM and SPF
const checks = [
  { name: 'resend._domainkey.amorainsights.com', type: 'TXT' },
  { name: 'amorainsights.com', type: 'TXT' },   // SPF
  { name: '_dmarc.amorainsights.com', type: 'TXT' },
];

for (const check of checks) {
  const url = `https://dns.google/resolve?name=${check.name}&type=${check.type}`;
  const res = await fetch(url).then(r => r.json());
  console.log(`\n=== ${check.type} ${check.name} ===`);
  if (res.Answer) {
    res.Answer.forEach(a => console.log(' ', a.data));
  } else {
    console.log('  (no record found)', res.Status === 3 ? 'NXDOMAIN' : JSON.stringify(res));
  }
}
