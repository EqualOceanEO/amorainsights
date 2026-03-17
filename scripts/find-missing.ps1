$supabaseUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"
$headers = @{ "apikey" = $anonKey; "Authorization" = "Bearer $anonKey" }

$r = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/companies?select=id&order=id.asc&limit=1000" -Method GET -Headers $headers -UseBasicParsing
$allIds = ($r.Content | ConvertFrom-Json) | ForEach-Object { $_.id }
Write-Host "Total records:" $allIds.Count

$missing = @()
for ($i = 1; $i -le 360; $i++) {
    if ($allIds -notcontains $i) { $missing += $i }
}
Write-Host "Missing IDs:" ($missing -join ", ")
Write-Host "Missing count:" $missing.Count
