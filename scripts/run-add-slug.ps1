$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$projectRef = "jqppcuccqkxhhrvndsil"
$url = "https://api.supabase.com/v1/projects/$projectRef/database/query"

$headers = @{
    "Authorization" = "Bearer $pat"
    "Content-Type" = "application/json"
    "apikey" = $pat
}

# Step 1: Add column
$query1 = @{
    query = "ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug TEXT;"
} | ConvertTo-Json

Write-Host "Step 1: Adding slug column..."
$response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $query1
Write-Host "Status: $($response.status)"

# Step 2: Generate slugs
$query2 = @{
    query = "UPDATE companies SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '-', 'g')) WHERE slug IS NULL;"
} | ConvertTo-Json

Write-Host "`nStep 2: Generating slugs from name..."
$response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $query2
Write-Host "Status: $($response.status)"

# Step 3: Clean up multiple hyphens
$query3 = @{
    query = "UPDATE companies SET slug = REGEXP_REPLACE(slug, '-+', '-', 'g') WHERE slug IS NOT NULL;"
} | ConvertTo-Json

Write-Host "`nStep 3: Cleaning up multiple hyphens..."
$response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $query3
Write-Host "Status: $($response.status)"

# Step 4: Clean up leading/trailing hyphens
$query4 = @{
    query = "UPDATE companies SET slug = REGEXP_REPLACE(slug, '^-|-$', '', 'g') WHERE slug IS NOT NULL;"
} | ConvertTo-Json

Write-Host "`nStep 4: Cleaning up leading/trailing hyphens..."
$response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $query4
Write-Host "Status: $($response.status)"

# Step 5: Check for duplicates
$query5 = @{
    query = "SELECT slug, COUNT(*) AS count FROM companies GROUP BY slug HAVING COUNT(*) > 1;"
} | ConvertTo-Json

Write-Host "`nStep 5: Checking for duplicate slugs..."
$response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $query5
if ($response.result -and $response.result.Count -gt 0) {
    Write-Host "WARNING: Found duplicate slugs:"
    $response.result | ForEach-Object { Write-Host "  $($_.slug): $($_.count) occurrences" }
} else {
    Write-Host "No duplicate slugs found."
}

# Step 6: Create unique index
$query6 = @{
    query = "CREATE UNIQUE INDEX companies_slug_unique ON companies(slug);"
} | ConvertTo-Json

Write-Host "`nStep 6: Creating unique index..."
try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $query6
    Write-Host "Status: $($response.status)"
} catch {
    Write-Host "Error creating index: $_"
}

# Verify
$query7 = @{
    query = "SELECT COUNT(*) AS total_companies, COUNT(DISTINCT slug) AS unique_slugs FROM companies;"
} | ConvertTo-Json

Write-Host "`nVerification:"
$response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $query7
$response.result | ForEach-Object { Write-Host "  Total companies: $($_.total_companies), Unique slugs: $($_.unique_slugs)" }
