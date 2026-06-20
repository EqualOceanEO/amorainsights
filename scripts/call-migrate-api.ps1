$uri = "http://localhost:3000/api/admin/migrate?secret=run-migration-now"
Write-Host "Calling: $uri"
try {
    $resp = Invoke-WebRequest -Uri $uri -Method GET -TimeoutSec 60 -UseBasicParsing
    Write-Host "Status: $($resp.StatusCode)"
    Write-Host $resp.Content
} catch {
    Write-Host "HTTP Error: $($_.Exception.Response.StatusCode.value__)"
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host $reader.ReadToEnd()
    } catch {
        Write-Host $_.Exception.Message
    }
}
