import { createClient } from '@supabase/supabase-js';
const s = createClient(
  'https://jqppcuccqkxhhrvndsil.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc'
);

// Check if any industry_id looks like a number (not a slug)
const { data } = await s.from('news_items')
  .select('id, title, industry_id, industry_slug')
  .order('id', { ascending: true })
  .limit(200);

const numericIds = (data ?? []).filter(r => /^\d+$/.test(String(r.industry_id ?? '')));
console.log('Records with numeric industry_id:', numericIds.length);
if (numericIds.length > 0) {
  console.log('Sample:', JSON.stringify(numericIds.slice(0, 5), null, 2));
}

// Also check industry_slug on these records
const missingSlug = (data ?? []).filter(r => !r.industry_slug);
console.log('Records missing industry_slug:', missingSlug.length);
