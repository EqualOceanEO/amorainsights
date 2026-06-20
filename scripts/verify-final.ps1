$supabaseUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"
$headers = @{ "apikey" = $anonKey; "Authorization" = "Bearer $anonKey" }

$r = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/companies?select=id&order=id.asc&limit=1" -Method GET -Headers $headers -UseBasicParsing
Write-Host "First record:" $r.Content

$r2 = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/companies?select=id&order=id.desc&limit=1" -Method GET -Headers $headers -UseBasicParsing
Write-Host "Last record:" $r2.Content

$countHeaders = @{ "apikey" = $anonKey; "Authorization" = "Bearer $anonKey"; "Prefer" = "count=exact" }
$r3 = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/companies?select=id" -Method GET -Headers $countHeaders -UseBasicParsing
Write-Host "Content-Range:" $r3.Headers["Content-Range"]

$r4 = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/companies?select=industry_slug,count&group=industry_slug" -Method GET -Headers $headers -UseBasicParsing
Write-Host "By industry:" $r4.Content
