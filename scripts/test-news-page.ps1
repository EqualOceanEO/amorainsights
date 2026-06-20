try {
    $r = Invoke-WebRequest -Uri 'http://localhost:3000/news' -TimeoutSec 20 -UseBasicParsing
    Write-Host "Status:" $r.StatusCode
    $content = $r.Content
    if ($content.Length -gt 1000) { $content = $content.Substring(0, 1000) }
    Write-Host $content
} catch {
    Write-Host "HTTP Error:" $_.Exception.Message
    if ($_.Exception.Response) {
        Write-Host "StatusCode:" ([int]$_.Exception.Response.StatusCode)
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        if ($body.Length -gt 500) { $body = $body.Substring(0, 500) }
        Write-Host "Body:" $body
    }
}
