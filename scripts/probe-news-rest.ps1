$supaUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"

# GET columns via REST
try {
    $url = "$supaUrl/rest/v1/news_items?select=*&limit=1"
    $r = Invoke-WebRequest -Uri $url -Headers @{
        "apikey" = $anonKey
        "Authorization" = "Bearer $anonKey"
    } -UseBasicParsing -TimeoutSec 10
    Write-Host "Status:" $r.StatusCode
    Write-Host "Headers:" ($r.Headers | ConvertTo-Json)
    Write-Host "Body:" $r.Content
} catch {
    Write-Host "Error:" $_.Exception.Message
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host $reader.ReadToEnd()
    }
}
