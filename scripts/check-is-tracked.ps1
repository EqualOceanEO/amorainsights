[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$supabaseUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"

$headers = @{ "apikey" = $anonKey; "Authorization" = "Bearer $anonKey" }

# Count is_tracked = true
$r1 = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/companies?select=id&is_tracked=eq.true&limit=1" -Method GET -Headers ($headers + @{"Prefer"="count=exact"}) -UseBasicParsing
Write-Host "is_tracked=true:" $r1.Headers["Content-Range"]

# Count is_tracked = false
$r2 = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/companies?select=id&is_tracked=eq.false&limit=1" -Method GET -Headers ($headers + @{"Prefer"="count=exact"}) -UseBasicParsing
Write-Host "is_tracked=false:" $r2.Headers["Content-Range"]
