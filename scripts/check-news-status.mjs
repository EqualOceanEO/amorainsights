import https from 'https';

const supabaseUrl = 'https://jqppcuccqkxhhrvndsil.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8';

function get(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, supabaseUrl);
    const opts = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: { apikey: anonKey, Authorization: 'Bearer ' + anonKey }
    };
    https.get(opts, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch { resolve(d); }
      });
    }).on('error', reject);
  });
}

async function main() {
  // News items without content - sample 5
  console.log('=== News items WITHOUT content (sample) ===');
  const r1 = await get(`/rest/v1/news_items?select=id,title,industry_slug,content&content=is.null&limit=5`);
  if (Array.isArray(r1)) r1.forEach(i => console.log(' -', i.id, i.industry_slug, '|', (i.title||'').slice(0,60)));

  // News items with content - sample 5
  console.log('\n=== News items WITH content (sample) ===');
  const r2 = await get(`/rest/v1/news_items?select=id,title,industry_slug,content&content=not.is.null&limit=5`);
  if (Array.isArray(r2)) r2.forEach(i => console.log(' -', i.id, i.industry_slug, 'len:', i.content?.length||0, '|', (i.title||'').slice(0,50)));

  // Total news
  console.log('\n=== Total news count ===');
  const r3 = await get(`/rest/v1/news_items?select=id&limit=0`);
  console.log('Total items:', Array.isArray(r3) ? 'array len='+r3.length : JSON.stringify(r3).slice(0,100));

  // Total tracked companies
  console.log('\n=== Companies ===');
  const r4 = await get(`/rest/v1/companies?select=id,industry_slug,name&is_tracked=eq.true&limit=5`);
  if (Array.isArray(r4)) {
    console.log('Sample:', r4.map(c => c.name).join(', '));
  }

  // Industry coverage in companies
  const r5 = await get(`/rest/v1/companies?select=id&is_tracked=eq.true`);
  console.log('Total tracked companies:', Array.isArray(r5) ? r5.length : '?');
}

main().catch(console.error);
