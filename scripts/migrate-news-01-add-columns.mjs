import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('=== Step 1: Add missing columns ===');

  const newColumns = [
    { name: 'author', type: 'TEXT' },
    { name: 'cover_image_url', type: 'TEXT' },
    { name: 'tags', type: 'TEXT[]' },
    { name: 'is_published', type: 'BOOLEAN DEFAULT true' },
    { name: 'is_premium', type: 'BOOLEAN DEFAULT false' },
    { name: 'slug', type: 'TEXT UNIQUE' },
    { name: 'content', type: 'TEXT' },
    { name: 'industry_id', type: 'INTEGER REFERENCES industries(id)' },
    { name: 'sub_sector_id', type: 'INTEGER REFERENCES industries(id)' },
    { name: 'company_id', type: 'INTEGER REFERENCES companies(id)' },
  ];

  for (const col of newColumns) {
    try {
      const { error } = await supabase.rpc('exec', {
        sql: `ALTER TABLE news_items ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`
      });
      if (error) {
        // Try direct approach
        console.log(`  Adding ${col.name}...`);
      } else {
        console.log(`  ✓ ${col.name}`);
      }
    } catch (e) {
      console.log(`  ? ${col.name}: ${e.message}`);
    }
  }

  console.log('\n=== Step 2: Check result ===');
  const { data: sample2 } = await supabase
    .from('news_items')
    .select('*')
    .limit(1)
    .single();

  if (sample2) {
    console.log('Columns after migration:', Object.keys(sample2).join(', '));
  }
}

migrate().catch(console.error);
