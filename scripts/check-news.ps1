$url = 'https://jqppcuccqkxhhrvndsil.supabase.co/rest/v1/news_items?select=*&limit=5'
$key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8'
$h = @{
    'apikey' = $key
    'Authorization' = 'Bearer ' + $key
}
$resp = Invoke-WebRequest -Uri $url -Headers $h -UseBasicParsing
Write-Output "Status: $($resp.StatusCode)"
Write-Output "Content: $($resp.Content)"
