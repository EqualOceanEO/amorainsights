import { createClient } from '@supabase/supabase-js';
const s = createClient(
  'https://jqppcuccqkxhhrvndsil.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc'
);

// Get all records where industry_id is numeric
const { data } = await s.from('news_items')
  .select('id, industry_id, industry_slug')
  .order('id');

const toFix = (data ?? []).filter(r => /^\d+$/.test(String(r.industry_id ?? '')));
console.log('Records to fix:', toFix.length);

for (const row of toFix) {
  const { error } = await s.from('news_items')
    .update({ industry_id: row.industry_slug })
    .eq('id', row.id);
  if (error) console.log('Error on id', row.id, ':', error.message);
  else console.log('Fixed id', row.id, ':', row.industry_id, '->', row.industry_slug);
}
console.log('Done.');
