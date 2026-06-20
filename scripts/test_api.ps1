try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/migrate?secret=run-migration-now" -Method GET -TimeoutSec 15
    Write-Host "Status:" $r.StatusCode
    Write-Host "Content:" $r.Content
} catch {
    Write-Host "Error:" $_.Exception.Message
}
