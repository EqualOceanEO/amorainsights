$projectRef = "jqppcuccqkxhhrvndsil"
$serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.D3_J7M-qZrYE5Hy4k9e2z8LqRZ9M3jL5w7cE8kN2tVA"

# Get schema for news_items table
$url = "https://$projectRef.supabase.co/rest/v1/news_items?limit=1"
$headers = @{
    'apikey' = $serviceRoleKey
    'Authorization' = "Bearer $serviceRoleKey"
    'Content-Type' = 'application/json'
}

try {
    $response = Invoke-WebRequest -Uri $url -Headers $headers -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    if ($data -and $data.Count -gt 0) {
        $first = $data[0]
        Write-Host "Columns in news_items:"
        $first.PSObject.Properties | ForEach-Object { Write-Host "  - $($_.Name)" }
    }
}
catch {
    Write-Host "Error: $_"
}
