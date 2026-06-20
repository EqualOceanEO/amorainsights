$url = "https://jqppcuccqkxhhrvndsil.supabase.co/rest/v1/rpc/exec_sql"
$serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc"
$mgmtUrl = "https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/query"

# Use the service_role key directly via REST with raw SQL via pg endpoint
# Actually, Supabase REST doesn't support DDL via /rpc — use Management API instead
# The PAT we had expired, but we can try service_role to run SQL via pg-meta endpoint

# Try using Supabase's internal pg-meta API with service_role
$pgMetaUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"

$headers = @{
    "apikey" = $serviceKey
    "Authorization" = "Bearer $serviceKey"
    "Content-Type" = "application/json"
}

$sqls = @(
    "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS slug TEXT",
    "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS content TEXT",
    "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS cover_image_url TEXT",
    "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS author TEXT",
    "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'",
    "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE",
    "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE",
    "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS company_id BIGINT",
    "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS industry_id TEXT",
    "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS sub_sector_id TEXT",
    "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()",
    "UPDATE news_items SET slug = 'news-' || id WHERE slug IS NULL",
    "UPDATE news_items SET industry_id = industry_slug WHERE industry_id IS NULL",
    "CREATE INDEX IF NOT EXISTS idx_news_items_slug ON news_items(slug)",
    "CREATE INDEX IF NOT EXISTS idx_news_items_industry_id ON news_items(industry_id)",
    "CREATE INDEX IF NOT EXISTS idx_news_items_published ON news_items(published_at DESC) WHERE is_published = TRUE"
)

# Use Supabase Management API
$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$mgmtHeaders = @{
    "Authorization" = "Bearer $pat"
    "Content-Type" = "application/json"
}

foreach ($sql in $sqls) {
    Write-Host "Executing: $sql"
    $body = [System.Text.Encoding]::UTF8.GetBytes("{`"query`":`"$sql`"}")
    try {
        $resp = Invoke-WebRequest -Uri $mgmtUrl -Method POST -Headers $mgmtHeaders -Body $body -UseBasicParsing -TimeoutSec 30
        Write-Host "  Status: $($resp.StatusCode) - OK"
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  Status: $statusCode - FAILED: $($_.Exception.Message)"
        # Try with service_role key via REST API
    }
}
Write-Host "Done!"
