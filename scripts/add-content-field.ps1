# Add content field via direct SQL RPC call
# Using direct PostgREST endpoint with service_role key

$projectRef = "jqppcuccqkxhhrvndsil"
# Service Role key (Full access to database)
$serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.D3_J7M-qZrYE5Hy4k9e2z8LqRZ9M3jL5w7cE8kN2tVA"

# Try to add column via REST API with service_role
$restUrl = "https://$projectRef.supabase.co/rest/v1/rpc/execute_sql"
$sql = "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS content TEXT;"

$body = @{ sql = $sql } | ConvertTo-Json
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)

$headers = @{
    'apikey' = $serviceRoleKey
    'Authorization' = "Bearer $serviceRoleKey"
    'Content-Type' = 'application/json'
}

try {
    $response = Invoke-WebRequest `
        -Uri $restUrl `
        -Method POST `
        -Headers $headers `
        -Body $bodyBytes `
        -UseBasicParsing
    
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
}
catch {
    $errorResponse = $_.Exception.Response
    if ($errorResponse) {
        $stream = $errorResponse.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "Error Status: $($errorResponse.StatusCode)"
        Write-Host "Error: $body"
    } else {
        Write-Host "ERROR: $_"
    }
}
