import { createClient } from '@supabase/supabase-js';
const s = createClient(
  'https://jqppcuccqkxhhrvndsil.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc'
);

const { data, error } = await s.from('companies').insert({
  name: 'Sanctuary AI',
  name_cn: null,
  industry_slug: 'manufacturing',
  sub_sector: 'Humanoid Robots',
  description: 'Canadian humanoid AI company developing Phoenix humanoid with Carbon AI cognitive architecture. Focus on general-purpose labor automation. Backed by Microsoft.',
  country: 'US',
  is_public: false,
  is_tracked: true,
  tags: ['phoenix', 'carbon-ai', 'microsoft', 'general-purpose', 'cognitive'],
  founded_year: 2018,
  employee_count: 200,
  slug: 'sanctuary-ai',
}).select('id, name');

if (error) console.error('Error:', error.message);
else console.log('Inserted:', data);
