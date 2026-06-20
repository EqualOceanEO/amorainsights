$serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc"
$baseUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"

$headers = @{
    "apikey" = $serviceKey
    "Authorization" = "Bearer $serviceKey"
    "Content-Type" = "application/json"
}

# Try various possible paths for Supabase cloud pg-meta
$paths = @(
    "/pg/columns?table_id=news_items",
    "/pg/tables",
    "/platform/pg-meta/v1/columns?table_id=news_items",
    "/pg-meta/v1/columns",
    "/rest/v1/?apikey=$serviceKey"  # just to see schema
)

foreach ($path in $paths) {
    $url = "$baseUrl$path"
    Write-Host "Trying: $url"
    try {
        $resp = Invoke-WebRequest -Uri $url -Headers $headers -UseBasicParsing -TimeoutSec 10
        Write-Host "  Status: $($resp.StatusCode) - OK"
        Write-Host "  Body (100): $($resp.Content.Substring(0, [Math]::Min(200, $resp.Content.Length)))"
    } catch {
        Write-Host "  FAIL: $($_.Exception.Response.StatusCode.value__)"
    }
}
