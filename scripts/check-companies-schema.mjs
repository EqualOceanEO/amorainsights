import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqppcuccqkxhhrvndsil.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCompaniesSchema() {
  // 1. Get companies columns
  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log('=== Current companies table columns ===');
  console.log(Object.keys(companies[0]).join(', '));

  // 2. Sample data
  console.log('\n=== Sample data (3 records) ===');
  const { data: sample } = await supabase
    .from('companies')
    .select('id, name, name_cn, industry_slug, sub_sector, country')
    .limit(3);

  sample.forEach(row => {
    console.log(`ID: ${row.id}, ${row.name} (${row.name_cn}), industry: ${row.industry_slug}, sub_sector: ${row.sub_sector}`);
  });

  // 3. Check industries table structure
  const { data: industries } = await supabase
    .from('industries')
    .select('id, slug, name, parent_id, level')
    .limit(5);

  console.log('\n=== Industries table sample ===');
  industries.forEach(row => {
    console.log(`ID: ${row.id}, slug: ${row.slug}, level: ${row.level}, parent_id: ${row.parent_id}`);
  });
}

checkCompaniesSchema();
