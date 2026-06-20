$serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc"
$baseUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"

$headers = @{
    "apikey" = $serviceKey
    "Authorization" = "Bearer $serviceKey"
    "Content-Type" = "application/json"
}

# Get column info from information_schema via a select on news_items
$resp = Invoke-WebRequest -Uri "$baseUrl/rest/v1/news_items?select=*&limit=1" -Headers $headers -UseBasicParsing
Write-Host "Status: $($resp.StatusCode)"
$json = $resp.Content | ConvertFrom-Json
if ($json) {
    Write-Host "Fields in news_items:"
    $json[0] | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name | ForEach-Object { Write-Host "  - $_" }
}
