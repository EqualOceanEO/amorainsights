import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqppcuccqkxhhrvndsil.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteDuplicateCatl() {
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, name_cn, ticker, exchange, industry_slug, sub_sector, country')
    .ilike('name', '%CATL%')
    .order('id');

  if (error) {
    console.error('Error fetching:', error);
    process.exit(1);
  }

  console.log('Current CATL records:');
  data.forEach((row) => {
    console.log(`ID: ${row.id}, Name: ${row.name}, Ticker: ${row.ticker}, Industry: ${row.industry_slug}`);
  });

  // Delete ID 324 (the duplicate)
  console.log('\nDeleting ID 324 (duplicate of ID 121)...');
  const { error: deleteError } = await supabase
    .from('companies')
    .delete()
    .eq('id', 324);

  if (deleteError) {
    console.error('Delete failed:', deleteError);
    process.exit(1);
  }

  console.log('Deleted successfully!');

  // Verify
  const { data: remaining, error: verifyError } = await supabase
    .from('companies')
    .select('id, name')
    .ilike('name', '%CATL%')
    .order('id');

  if (verifyError) {
    console.error('Verify failed:', verifyError);
    process.exit(1);
  }

  console.log('\nRemaining CATL records:');
  remaining.forEach((row) => {
    console.log(`ID: ${row.id}, Name: ${row.name}`);
  });
}

deleteDuplicateCatl();
