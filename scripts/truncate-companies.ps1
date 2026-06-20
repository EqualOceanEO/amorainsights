$supabaseUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"

$headers = @{
    "apikey" = $anonKey
    "Authorization" = "Bearer $anonKey"
    "Content-Type" = "application/json"
}

Write-Host "=== Verify table is empty ==="
$r = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/companies?select=count" -Method GET -Headers $headers -UseBasicParsing
Write-Host "COUNT:" $r.Content

Write-Host ""
Write-Host "=== Test insert with explicit id=1 to reset sequence ==="
$insertBody = '[{"id":1,"name":"TEST_DELETE","name_cn":null,"industry_slug":"ai","sub_sector":"Foundation Models","description":"test","country":"US","hq_city":"test","hq_province":null,"website":null,"ticker":null,"exchange":null,"employee_count":null,"is_tracked":false,"is_public":false,"tags":[]}]'
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($insertBody)

try {
    $r2 = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/companies" -Method POST -Headers @{
        "apikey" = $anonKey
        "Authorization" = "Bearer $anonKey"
        "Content-Type" = "application/json"
        "Prefer" = "return=representation"
    } -Body $bodyBytes -UseBasicParsing
    Write-Host "STATUS:" $r2.StatusCode
    Write-Host "BODY:" $r2.Content
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "HTTP ERROR:" $statusCode
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "BODY:" $reader.ReadToEnd()
    } catch {}
}
