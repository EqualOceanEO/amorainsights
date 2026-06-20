$r = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10
Write-Host "Status:" $r.StatusCode
