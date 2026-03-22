import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqppcuccqkxhhrvndsil.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findCatl() {
  const tables = ['news_items', 'reports', 'companies', 'sector_mapping'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('slug', 'catl')
        .limit(10);
      
      if (error && error.code !== '42P01') {
        console.log(`Table ${table}: ${error.message}`);
      } else if (data && data.length > 0) {
        console.log(`\n=== Table: ${table} ===`);
        console.log(`Found ${data.length} records with slug = 'catl':`);
        data.forEach((row, idx) => {
          console.log(`  ${idx + 1}. ID: ${row.id}, Name/Title: ${row.name || row.title}, Slug: ${row.slug}`);
        });
      }
    } catch (e) {
      // Table may not exist or no permission
    }
  }
}

findCatl();
