import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicates() {
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, slug')
    .eq('slug', 'catl')
    .order('id');

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log(`Found ${data ? data.length : 0} records with slug = 'catl':`);
  if (data) {
    data.forEach((row) => {
      console.log(`ID: ${row.id}, Name: ${row.name}, Slug: ${row.slug}`);
    });
  }
}

checkDuplicates();
