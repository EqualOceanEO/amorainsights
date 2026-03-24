$headers = @{
    "Authorization" = "Bearer sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
    "apikey" = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
}

$body = '{"query":"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ''news_items'' ORDER BY ordinal_position;"}'

try {
    $response = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/query" -Method POST -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = [System.IO.StreamReader]::new($stream)
    $responseBody = $reader.ReadToEnd()
    Write-Host "Response: $responseBody"
}
