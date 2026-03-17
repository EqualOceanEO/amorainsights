$supabaseUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"
$anonKey     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"

$headers = @{
  "apikey"        = $anonKey
  "Authorization" = "Bearer $anonKey"
}

# Get one row to inspect columns
$resp = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/news_items?limit=1" `
  -Headers $headers -UseBasicParsing -TimeoutSec 20
Write-Host "Status: $($resp.StatusCode)"
Write-Host $resp.Content
