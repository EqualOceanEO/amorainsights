$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$projectRef = "jqppcuccqkxhhrvndsil"

$body = '{"query":"SELECT 1 as test"}'
$headers = @{
    "Authorization" = "Bearer $pat"
    "Content-Type"  = "application/json"
}

Write-Host "Testing Management API connection..."
try {
    $response = Invoke-WebRequest `
        -Uri "https://api.supabase.com/v1/projects/$projectRef/database/query" `
        -Method POST `
        -Headers $headers `
        -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) `
        -UseBasicParsing `
        -TimeoutSec 30

    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Details: $($reader.ReadToEnd())"
    } catch {}
}
