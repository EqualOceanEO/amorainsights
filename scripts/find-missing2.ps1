[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$supabaseUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"

$headers = @{
    "apikey" = $anonKey
    "Authorization" = "Bearer $anonKey"
}

$r = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/companies?select=id&order=id.asc&limit=1000" -Method GET -Headers $headers -UseBasicParsing
Write-Host "Content-Range:" $r.Headers["Content-Range"]

$data = $r.Content | ConvertFrom-Json
Write-Host "Retrieved count:" $data.Count

$ids = $data | ForEach-Object { $_.id }
Write-Host "Min ID:" ($ids | Measure-Object -Minimum).Minimum
Write-Host "Max ID:" ($ids | Measure-Object -Maximum).Maximum

$missing = @()
for ($i = 1; $i -le 360; $i++) {
    if ($ids -notcontains $i) {
        $missing += $i
    }
}

if ($missing.Count -eq 0) {
    Write-Host "No missing IDs - all 360 present!"
} else {
    Write-Host "Missing $($missing.Count) IDs: $($missing -join ', ')"
}
