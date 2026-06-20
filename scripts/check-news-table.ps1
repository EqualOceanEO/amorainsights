[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$supabaseUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"
$serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.placeholder"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"

# Check if news table exists
$headers = @{ "apikey" = $anonKey; "Authorization" = "Bearer $anonKey" }
try {
    $r = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/news?select=id&limit=1" -Method GET -Headers $headers -UseBasicParsing
    Write-Host "news table EXISTS, status:" $r.StatusCode
} catch {
    $err = $_.Exception.Response
    if ($err) {
        $reader = New-Object System.IO.StreamReader($err.GetResponseStream())
        $body = $reader.ReadToEnd()
        Write-Host "news table check response: $body"
    } else {
        Write-Host "Error: $($_.Exception.Message)"
    }
}
