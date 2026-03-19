# Get all industries from Supabase with level2 data
$apiUrl = "https://jqppcuccqkxhhrvndsil.supabase.co/rest/v1/industries"

$headers = @{
  "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"
  "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"
}

try {
  $response = Invoke-RestMethod -Uri $apiUrl -Method GET -Headers $headers
  Write-Host "=== Industries from Supabase ==="
  $level1 = $response | Where-Object { $_.parent_slug -eq $null -or $_.parent_slug -eq "" }
  $level2 = $response | Where-Object { $_.parent_slug -ne $null -and $_.parent_slug -ne "" }
  
  Write-Host ""
  Write-Host "=== Level 1 Industries ==="
  $level1 | Sort-Object slug | ForEach-Object {
    Write-Host "$($_.name) ($($_.slug)) - $($_.name_cn)"
  }
  
  Write-Host ""
  Write-Host "=== Level 2 Industries ==="
  $level2 | Sort-Object parent_slug, slug | ForEach-Object {
    Write-Host "$($_.name) ($($_.slug)) - Parent: $($_.parent_slug)"
  }
} catch {
  Write-Host "Error: $_"
  Write-Host "Response: $($_.Exception.Response)"
}
