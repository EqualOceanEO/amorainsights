import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

console.log('=== DB State Check ===\n');

// Check industries
const { data: industries, error: ie } = await supabase.from('industries').select('*').order('sort_order');
if (ie) console.log('❌ industries:', ie.message);
else console.log(`✅ industries: ${industries.length} rows`, industries.map(r => r.slug));

// Check counts
for (const t of ['reports', 'news_items', 'companies']) {
  const { data, error } = await supabase.from(t).select('*');
  if (error) console.log(`❌ ${t}:`, error.message);
  else console.log(`✅ ${t}: ${data.length} rows`);
}
