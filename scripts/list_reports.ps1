$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$uri = "https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/query"
$sql = @"
SELECT id, slug, title, is_premium, report_format FROM reports ORDER BY created_at DESC LIMIT 5;
"@
$body = [System.Text.Encoding]::UTF8.GetBytes(([PSCustomObject]@{query=$sql} | ConvertTo-Json -Depth 10 -Compress))
try {
    $r = Invoke-WebRequest -Uri $uri -Method POST -Headers @{"Authorization"="Bearer $pat";"Content-Type"="application/json"} -Body $body -UseBasicParsing -TimeoutSec 30
    Write-Host "HTTP $($r.StatusCode)"
    $r.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "FAILED: $($_.Exception.Message)"
}
