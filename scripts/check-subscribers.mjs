import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jqppcuccqkxhhrvndsil.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8'
);

// Check subscribers table structure and data
const { data, error } = await supabase
  .from('subscribers')
  .select('*')
  .order('subscribed_at', { ascending: false })
  .limit(10);

console.log('=== SUBSCRIBERS (latest 10) ===');
console.log(JSON.stringify({ data, error }, null, 2));

// Check source breakdown
const { data: sources, error: srcErr } = await supabase
  .from('subscribers')
  .select('source')
  .order('source');

console.log('\n=== SOURCE BREAKDOWN ===');
if (sources) {
  const counts = {};
  sources.forEach(r => { counts[r.source] = (counts[r.source] || 0) + 1; });
  console.log(JSON.stringify(counts, null, 2));
}
