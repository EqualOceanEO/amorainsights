import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqppcuccqkxhhrvndsil.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findCatlEverywhere() {
  // Check reports first (it has slug)
  const { data: reports, error: reportsError } = await supabase
    .from('reports')
    .select('id, title, slug')
    .ilike('title', '%catl%');
  
  if (reports && reports.length > 0) {
    console.log('\n=== Reports with "catl" in title ===');
    reports.forEach((row) => {
      console.log(`ID: ${row.id}, Title: ${row.title}, Slug: ${row.slug}`);
    });
  }
  
  // Check companies with name containing "catl"
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('id, name, name_cn, ticker, exchange')
    .ilike('name', '%catl%');
  
  if (companies && companies.length > 0) {
    console.log('\n=== Companies with "catl" in name ===');
    companies.forEach((row) => {
      console.log(`ID: ${row.id}, Name: ${row.name} (${row.name_cn}), Ticker: ${row.ticker} / ${row.exchange}`);
    });
  }
}

findCatlEverywhere();
