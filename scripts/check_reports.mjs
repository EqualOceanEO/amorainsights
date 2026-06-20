import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jqppcuccqkxhhrvndsil.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.ZUL3U3nAD9U7M3YR5T3C8d7vV93J0z9F1GvR4C9qQk8'
);

const { data, error } = await sb.from('reports').select('*').limit(2);
if (data && data.length > 0) {
  console.log('=== reports columns ===');
  console.log(Object.keys(data[0]).join('\n'));
  console.log('\n=== Sample record ===');
  console.log(JSON.stringify(data[0], null, 2));
} else {
  console.log('No data, error:', error);
}
