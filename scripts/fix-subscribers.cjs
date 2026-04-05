const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://jqppcuccqkxhhrvndsil.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc'
);

const sql = `ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'basic';
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'inactive';
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;`;

supabase.rpc('run_migration', { sql_text: sql }).then(({data, error}) => {
  console.log('Error:', error);
  console.log('Data:', data);
});
