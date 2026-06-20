[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$supabaseUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"

$patchHeaders = @{
    "apikey" = $anonKey
    "Authorization" = "Bearer $anonKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=minimal"
}

$body = '{"is_tracked":true}'
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)

$r = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/companies?is_tracked=eq.false" -Method PATCH -Headers $patchHeaders -Body $bodyBytes -UseBasicParsing
Write-Host "Status:" $r.StatusCode
Write-Host "Done - updated all is_tracked=false to true"
