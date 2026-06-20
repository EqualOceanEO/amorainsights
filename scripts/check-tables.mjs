import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jqppcuccqkxhhrvndsil.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8'
);

async function checkTables() {
  // Check news_items
  const { data: ni, error: nie } = await supabase.from('news_items').select('*').limit(1);
  console.log('news_items:', nie ? 'ERROR: ' + nie.message : JSON.stringify(ni));

  // Try news table
  const { data: n, error: ne } = await supabase.from('news').select('*').limit(1);
  console.log('news:', ne ? 'ERROR: ' + ne.message : JSON.stringify(n));
}

checkTables();
