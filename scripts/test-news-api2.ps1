$ErrorActionPreference = 'Continue'
try {
    $r = Invoke-WebRequest -Uri 'http://localhost:3000/api/news?page=1&pageSize=3' -TimeoutSec 15
    Write-Host "Status: $($r.StatusCode)"
    Write-Host "Content: $($r.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errBody = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "Response body: $errBody"
    }
}
