$ErrorActionPreference = 'Stop'

$headers = @{
    'apikey' = 'sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc'
    'Authorization' = 'Bearer sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc'
    'Content-Type' = 'application/json'
    'Prefer' = 'return=minimal'
}

$body = @{
    query = @"
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
SELECT 'Migration completed' AS status;
"@
} | ConvertTo-Json -Depth 3

$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)

try {
    $response = Invoke-WebRequest `
        -Uri 'https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/query' `
        -Method POST `
        -Headers $headers `
        -Body $bodyBytes `
        -ErrorAction Stop

    Write-Host "Migration completed successfully!"
    Write-Host "Status: $($response.StatusCode)"
}
catch {
    Write-Host "Error: $($_.Exception.Message)"
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "StatusCode: $statusCode"
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = [System.IO.StreamReader]::new($stream)
    $responseBody = $reader.ReadToEnd()
    Write-Host "Response: $responseBody"
}
