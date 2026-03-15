try {
    $r = Invoke-WebRequest -Uri 'http://localhost:3000/admin/reports' -UseBasicParsing -TimeoutSec 10
    Write-Host "HTTP $($r.StatusCode)"
} catch {
    Write-Host "ERR: $($_.Exception.Message)"
}
