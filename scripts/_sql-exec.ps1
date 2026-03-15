param([string]$sqlFile)
$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$uri = "https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/query"
$sql = Get-Content $sqlFile -Raw -Encoding UTF8
Write-Host "Executing $sqlFile ($($sql.Length) bytes)..."
$body = [System.Text.Encoding]::UTF8.GetBytes(([PSCustomObject]@{query=$sql} | ConvertTo-Json -Depth 10 -Compress))
try {
    $r = Invoke-WebRequest -Uri $uri -Method POST -Headers @{"Authorization"="Bearer $pat";"Content-Type"="application/json"} -Body $body -UseBasicParsing -TimeoutSec 60
    $c = $r.Content; if ($c.Length -gt 400) { $c = $c.Substring(0,400)+"..." }
    Write-Host "HTTP $($r.StatusCode) OK"
    Write-Host $c
} catch {
    Write-Host "FAILED: $($_.Exception.Message)"
    try { $s=$_.Exception.Response.GetResponseStream(); $rd=New-Object System.IO.StreamReader($s); Write-Host $rd.ReadToEnd().Substring(0,400) } catch {}
    exit 1
}
