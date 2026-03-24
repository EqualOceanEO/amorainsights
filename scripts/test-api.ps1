try {
    $r = Invoke-WebRequest -Uri 'http://localhost:3000/api/news?page=1&pageSize=3' -TimeoutSec 15 -UseBasicParsing
    Write-Host "Status:" $r.StatusCode
    $content = $r.Content
    if ($content.Length -gt 800) { $content = $content.Substring(0, 800) }
    Write-Host $content
} catch {
    Write-Host "Error:" $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host $reader.ReadToEnd()
    }
}
