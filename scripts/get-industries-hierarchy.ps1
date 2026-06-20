# Get all industries from Supabase with proper hierarchy
$apiUrl = "https://jqppcuccqkxhhrvndsil.supabase.co/rest/v1/industries?select=id,slug,name,name_cn,parent_id,level&order=level,slug"

$headers = @{
  "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"
  "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"
}

try {
  $response = Invoke-RestMethod -Uri $apiUrl -Method GET -Headers $headers
  Write-Host "=== Industries Hierarchy from Supabase ==="
  Write-Host ""
  
  # Get level 1 industries
  $level1 = $response | Where-Object { $_.level -eq 1 } | Sort-Object id
  
  foreach ($l1 in $level1) {
    Write-Host "Level 1: $($l1.name) (ID: $($l1.id), slug: $($l1.slug))"
    
    # Get children of this level 1
    $children = $response | Where-Object { $_.parent_id -eq $l1.id } | Sort-Object id
    foreach ($child in $children) {
      Write-Host "  Level 2: $($child.name) (ID: $($child.id), slug: $($child.slug))"
    }
    Write-Host ""
  }
  
  Write-Host "=== Summary ==="
  Write-Host "Total Level 1: $($level1.Count)"
  $level2 = $response | Where-Object { $_.level -eq 2 }
  Write-Host "Total Level 2: $($level2.Count)"
} catch {
  Write-Host "Error: $_"
}
