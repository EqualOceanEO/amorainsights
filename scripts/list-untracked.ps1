[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$supabaseUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"

$headers = @{ "apikey" = $anonKey; "Authorization" = "Bearer $anonKey" }

$r = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/companies?select=id,name,is_tracked&is_tracked=eq.false&order=id.asc" -Method GET -Headers $headers -UseBasicParsing
$data = $r.Content | ConvertFrom-Json
Write-Host "Companies with is_tracked=false:"
foreach ($c in $data) {
    Write-Host "  ID $($c.id): $($c.name)"
}
