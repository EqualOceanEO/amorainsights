-- Add slug column to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs from name (lowercase, replace spaces with hyphens)
UPDATE companies SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '-', 'g')) WHERE slug IS NULL;

-- Clean up multiple hyphens
UPDATE companies SET slug = REGEXP_REPLACE(slug, '-+', '-', 'g') WHERE slug IS NOT NULL;

-- Clean up leading/trailing hyphens
UPDATE companies SET slug = REGEXP_REPLACE(slug, '^-|-$', '', 'g') WHERE slug IS NOT NULL;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS companies_slug_unique ON companies(slug);

-- Verify
SELECT COUNT(*) AS total_companies, COUNT(DISTINCT slug) AS unique_slugs FROM companies;
