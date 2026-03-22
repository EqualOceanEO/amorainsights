import { Client } from 'pg';
import 'dotenv/config';

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

async function migrate() {
  try {
    await client.connect();
    console.log('Connected to database');

    const sql = `
-- Step 1: Add new columns
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry_id INTEGER REFERENCES industries(id);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS sub_sector_id INTEGER REFERENCES industries(id);

-- Step 2: Generate slug from name
UPDATE companies 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Step 3: Clean up slug
UPDATE companies 
SET slug = REGEXP_REPLACE(slug, '-+', '-', 'g')
WHERE slug IS NOT NULL;
UPDATE companies 
SET slug = REGEXP_REPLACE(slug, '^-|-$', '', 'g')
WHERE slug IS NOT NULL;

-- Step 4: Migrate industry_slug -> industry_id
UPDATE companies c
SET industry_id = i.id
FROM industries i
WHERE c.industry_slug = i.slug
AND c.industry_id IS NULL;

-- Step 5: Migrate sub_sector -> sub_sector_id
UPDATE companies c
SET sub_sector_id = i.id
FROM industries i
WHERE c.sub_sector = i.name
AND i.level = 2
AND c.sub_sector_id IS NULL;

-- Step 6: Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS companies_slug_unique ON companies(slug);

-- Step 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS companies_industry_id_idx ON companies(industry_id);
CREATE INDEX IF NOT EXISTS companies_sub_sector_id_idx ON companies(sub_sector_id);

-- Step 8: Verify
SELECT 'Migration completed' AS status, 
       COUNT(*) AS total_companies,
       COUNT(DISTINCT slug) AS unique_slugs,
       COUNT(industry_id) AS companies_with_industry_id
FROM companies;
`;

    const result = await client.query(sql);
    console.log('Migration completed!');
    
    if (result.rows.length > 0) {
      console.table(result.rows);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
