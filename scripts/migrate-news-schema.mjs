import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Check current news_items table structure
async function checkStructure() {
  console.log('=== Checking current news_items structure ===');

  // Get a sample news item
  const { data: sample } = await supabase
    .from('news_items')
    .select('*')
    .limit(1)
    .single();

  if (sample) {
    console.log('Current news_items columns:', Object.keys(sample).join(', '));
  }

  // Check industries table
  console.log('\n=== Checking industries table ===');
  const { data: industries } = await supabase
    .from('industries')
    .select('id, slug, name, level')
    .order('id')
    .limit(20);

  console.log('Industries:', JSON.stringify(industries, null, 2));
}

checkStructure().catch(console.error);
