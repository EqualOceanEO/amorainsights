$supabaseUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"

$headers = @{
    "apikey" = $anonKey
    "Authorization" = "Bearer $anonKey"
    "Range" = "0-0"
    "Prefer" = "count=exact"
}

$r = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/companies?select=id" -Method GET -Headers $headers -UseBasicParsing
Write-Host "Status:" $r.StatusCode
Write-Host "Content-Range:" $r.Headers["Content-Range"]
