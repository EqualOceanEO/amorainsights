$serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc"
$baseUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"

$headers = @{
    "apikey" = $serviceKey
    "Authorization" = "Bearer $serviceKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

function Exec-SQL {
    param([string]$sql)
    Write-Host "SQL: $sql"
    $bodyObj = @{ query = $sql }
    $bodyJson = $bodyObj | ConvertTo-Json -Compress
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)
    try {
        $resp = Invoke-WebRequest -Uri "$baseUrl/rest/v1/rpc/query" -Method POST -Headers $headers -Body $bodyBytes -UseBasicParsing -TimeoutSec 30
        Write-Host "  OK: $($resp.StatusCode)"
        return $true
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  FAIL $statusCode"
        return $false
    }
}

# Supabase doesn't expose a raw SQL RPC by default.
# Instead, use the pg-meta endpoint which IS accessible with service_role via the management API.
# Let's try the Supabase REST endpoint for direct table operations and check if there's a way.

# The correct way: Use Supabase's internal pg-meta at /pg/query
$pgUrl = "$baseUrl/pg/query"

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
    "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()"
)

foreach ($sql in $sqls) {
    Write-Host "Executing: $sql"
    $bodyJson = "{`"query`":`"$sql`"}"
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)
    try {
        $resp = Invoke-WebRequest -Uri $pgUrl -Method POST -Headers $headers -Body $bodyBytes -UseBasicParsing -TimeoutSec 30
        Write-Host "  Status: $($resp.StatusCode) Content: $($resp.Content.Substring(0, [Math]::Min(200, $resp.Content.Length)))"
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        try {
            $errBody = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errBody)
            $errText = $reader.ReadToEnd()
            Write-Host "  FAIL $statusCode : $errText"
        } catch {
            Write-Host "  FAIL $statusCode"
        }
    }
}
Write-Host "All done"
