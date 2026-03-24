$ErrorActionPreference = 'Continue'
$body = @{
    query = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'news_items' ORDER BY ordinal_position"
} | ConvertTo-Json

try {
    $r = Invoke-WebRequest -Uri 'http://localhost:3000/api/admin/news' -Method GET -TimeoutSec 10
    Write-Host "Status: $($r.StatusCode)"
    $content = $r.Content
    if ($content.Length -gt 1000) {
        Write-Host $content.Substring(0, 1000)
    } else {
        Write-Host $content
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errBody = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "Response: $errBody"
    }
}
