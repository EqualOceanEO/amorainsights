$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$uri = "https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/query"
$sql = Get-Content "c:\Users\51229\WorkBuddy\Claw\scripts\full-schema-seed.sql" -Raw -Encoding UTF8
Write-Host "SQL length: $($sql.Length)"
$obj = [PSCustomObject]@{ query = $sql }
$json = $obj | ConvertTo-Json -Depth 20 -Compress
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
Write-Host "Sending $($bytes.Length) bytes..."
try {
    $r = Invoke-WebRequest -Uri $uri -Method POST -Headers @{"Authorization"="Bearer $pat";"Content-Type"="application/json"} -Body $bytes -UseBasicParsing -TimeoutSec 90
    Write-Host "HTTP $($r.StatusCode)"
    Write-Host ($r.Content.Substring(0,[Math]::Min(500,$r.Content.Length)))
} catch {
    $msg = $_.Exception.Message
    Write-Host "FAILED: $msg"
    try {
        $st = $_.Exception.Response.GetResponseStream()
        $rd = New-Object System.IO.StreamReader($st)
        Write-Host ($rd.ReadToEnd().Substring(0,500))
    } catch {}
}
