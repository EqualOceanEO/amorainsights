import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  // Get a sample of companies
  const { data: companies, error } = await supabase
    .from('companies')
    .select('id, name, industry_slug, sub_sector')
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Current companies table sample:');
  console.table(companies);

  // Check if slug column exists
  const { data: slugColumn } = await supabase
    .from('companies')
    .select('slug')
    .limit(1);

  console.log('\nSlug column exists:', !!slugColumn);

  // Check if industry_id column exists
  const { data: industryIdColumn } = await supabase
    .from('companies')
    .select('industry_id')
    .limit(1);

  console.log('Industry_id column exists:', !!industryIdColumn);

  // Get industries for mapping
  const { data: industries } = await supabase
    .from('industries')
    .select('id, slug, name, level')
    .order('level', { ascending: true })
    .limit(20);

  console.log('\nIndustries sample:');
  console.table(industries);
}

verify();
