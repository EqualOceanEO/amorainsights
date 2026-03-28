import { createClient } from '@supabase/supabase-js';
const s = createClient(
  'https://jqppcuccqkxhhrvndsil.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc'
);

const { data } = await s.from('companies')
  .select('sub_sector')
  .eq('industry_slug', 'manufacturing')
  .eq('is_tracked', true);

const counts = {};
data?.forEach(c => {
  const k = c.sub_sector || '(null)';
  counts[k] = (counts[k] || 0) + 1;
});
console.log('Manufacturing sub_sectors:');
Object.entries(counts).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log(` ${v}x  ${k}`));
