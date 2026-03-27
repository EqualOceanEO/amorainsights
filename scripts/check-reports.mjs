import { createClient } from '@supabase/supabase-js';
const s = createClient(
  'https://jqppcuccqkxhhrvndsil.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc'
);

const { count: total } = await s.from('reports').select('id', { count: 'exact', head: true });
const { count: pubCount } = await s.from('reports').select('id', { count: 'exact', head: true }).eq('is_published', true);
console.log('Total reports:', total, '| Published:', pubCount);

if (total > 0) {
  const { data: sample } = await s.from('reports').select('id, title, is_published, industry_slug, sub_sector').limit(5);
  console.log(JSON.stringify(sample, null, 2));
}
