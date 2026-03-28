import { createClient } from '@supabase/supabase-js';
const s = createClient(
  'https://jqppcuccqkxhhrvndsil.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc'
);

// Find sanctuary and count all humanoid robots companies
const { data: sanctuary } = await s.from('companies').select('id, name, slug, sub_sector').ilike('name', '%sanctuary%');
console.log('Sanctuary:', JSON.stringify(sanctuary));

const { data: humanoids, count } = await s.from('companies').select('id, name, sub_sector', { count: 'exact' })
  .eq('sub_sector', 'Humanoid Robots').eq('is_tracked', true);
console.log(`\nTotal Humanoid Robots companies: ${count}`);
humanoids?.forEach(c => console.log(`  [${c.id}] ${c.name}`));
