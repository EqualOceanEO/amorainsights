import { createClient } from '@supabase/supabase-js';
const s = createClient(
  'https://jqppcuccqkxhhrvndsil.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc'
);

const { data, error } = await s
  .from('reports')
  .update({ production_status: 'published' })
  .eq('production_status', 'draft')
  .select('id, title, production_status');

if (error) {
  console.log('Error:', JSON.stringify(error));
} else {
  console.log('Updated', data?.length, 'reports to published');
  data?.forEach(r => console.log(' -', r.id, r.title, '->', r.production_status));
}
