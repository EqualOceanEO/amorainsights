import https from 'https';

const supabaseUrl = 'https://jqppcuccqkxhhrvndsil.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8';

function get(path) {
  return new Promise((resolve) => {
    const url = new URL(path, supabaseUrl);
    const opts = {
      hostname: url.hostname, path: url.pathname + url.search,
      headers: { apikey: anonKey, Authorization: 'Bearer ' + anonKey }
    };
    https.get(opts, r => {
      let d = ''; r.on('data', c => d += c);
      r.on('end', () => resolve(JSON.parse(d)));
    }).on('error', () => resolve(null));
  });
}

async function main() {
  const industries = await get('/rest/v1/industries?select=id,slug,name,level&order=id');
  console.log('Industries table:', industries);

  // Check a news item with company
  const news = await get('/rest/v1/news_items?select=id,title,industry_slug,industry_id,company_id&limit=3&order=id.desc');
  console.log('\nNews sample:', news);
}

main().catch(console.error);
