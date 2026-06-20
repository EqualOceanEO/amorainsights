$supabaseUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"
$headers = @{ "apikey" = $anonKey; "Authorization" = "Bearer $anonKey"; "Content-Type" = "application/json" }

$r = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/companies?select=id,name&order=id.asc&limit=100" -Method GET -Headers $headers -UseBasicParsing
Write-Host $r.Content
