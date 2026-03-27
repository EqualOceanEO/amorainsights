import { createClient } from '@supabase/supabase-js';
const s = createClient(
  'https://jqppcuccqkxhhrvndsil.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc'
);

// Set all existing reports to is_published = true
const { data, error, count } = await s
  .from('reports')
  .update({ is_published: true })
  .is('is_published', null)
  .select('id, title, is_published');

console.log('Updated null->true:', data?.length ?? 0, error ?? '');

// Also update false ones
const { data: data2, error: err2 } = await s
  .from('reports')
  .update({ is_published: true })
  .eq('is_published', false)
  .select('id, title');

console.log('Updated false->true:', data2?.length ?? 0, err2 ?? '');

// Verify
const { count: pubCount } = await s.from('reports').select('id', { count: 'exact', head: true }).eq('is_published', true);
console.log('Now published:', pubCount);
