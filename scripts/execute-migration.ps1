$ErrorActionPreference = 'Stop'

# Use Supabase REST API with anon key (for DDL we need service_role, but let's try direct SQL via psql)
$env:PGPASSWORD = 'nERCb24AMq2VAMZ4'

$sql = @"
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
"@

$escapedSql = $sql -replace '"', '\"'

& psql postgresql://postgres@db.jqppcuccqkxhhrvndsil.supabase.co:5432/postgres -c $escapedSql

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nMigration completed successfully!"
} else {
    Write-Host "`nMigration failed with exit code: $LASTEXITCODE"
}
