import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// Test: check if tables exist
const tables = ['industries', 'reports', 'news_items', 'companies'];
for (const t of tables) {
  const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
  if (error) {
    console.log(`❌ ${t}: ${error.message}`);
  } else {
    console.log(`✅ ${t}: exists (${count} rows)`);
  }
}
