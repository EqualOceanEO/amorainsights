$attempts = 0
while ($attempts -lt 30) {
    try {
        $r = Invoke-WebRequest -Uri 'http://localhost:3000' -Method HEAD -TimeoutSec 3 -ErrorAction Stop
        Write-Host 'READY'
        break
    } catch {
        $attempts++
        Start-Sleep -Seconds 2
    }
}
if ($attempts -eq 30) { Write-Host 'TIMEOUT' }
