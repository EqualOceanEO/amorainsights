import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqppcuccqkxhhrvndsil.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyMDYzMTgsImV4cCI6MjA1Mjc4MjMxOH0.nERCb24AMq2VAMZ4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('Starting migration...');

  // Step 1: Add columns
  console.log('Step 1: Adding columns...');
  const { error: addError } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug TEXT;
          ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry_id INTEGER REFERENCES industries(id);
          ALTER TABLE companies ADD COLUMN IF NOT EXISTS sub_sector_id INTEGER REFERENCES industries(id);`
  });

  if (addError) {
    console.error('Step 1 error:', addError);
  }

  // Step 2: Generate slugs
  console.log('Step 2: Generating slugs...');
  const { error: slugError } = await supabase
    .from('companies')
    .update({ slug: null })
    .is('slug', null);

  if (slugError) {
    console.error('Step 2 error:', slugError);
  }

  // Fetch all companies without slug
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .is('slug', null);

  if (companies) {
    for (const company of companies) {
      const slug = company.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      await supabase
        .from('companies')
        .update({ slug })
        .eq('id', company.id);
    }
  }

  // Step 3: Migrate industry_slug -> industry_id
  console.log('Step 3: Migrating industry_slug -> industry_id...');
  const { data: industries } = await supabase
    .from('industries')
    .select('id, slug');

  const industryMap = new Map(industries?.map(i => [i.slug, i.id]));

  const { data: companiesToMigrate } = await supabase
    .from('companies')
    .select('id, industry_slug')
    .is('industry_id', null)
    .not('industry_slug', 'is', null);

  if (companiesToMigrate) {
    for (const company of companiesToMigrate) {
      const industryId = industryMap.get(company.industry_slug);
      if (industryId) {
        await supabase
          .from('companies')
          .update({ industry_id: industryId })
          .eq('id', company.id);
      }
    }
  }

  console.log('Migration completed!');
}

migrate();
