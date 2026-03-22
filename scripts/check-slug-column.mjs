import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqppcuccqkxhhrvndsil.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSlugColumn() {
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, slug')
    .limit(5);

  if (error) {
    console.log('Slug column does NOT exist:', error.message);
    process.exit(0);
  }

  console.log('Slug column EXISTS. Sample data:');
  data.forEach((row) => {
    console.log(`ID: ${row.id}, Name: ${row.name}, Slug: ${row.slug ?? 'NULL'}`);
  });
}

checkSlugColumn();
