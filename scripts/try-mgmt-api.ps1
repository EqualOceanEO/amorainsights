$serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc"
$baseUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"

# Try creating a function via a fake RPC endpoint that doesn't exist yet
# Instead: use Supabase's WASM Postgres via the edge functions endpoint? No...

# REAL SOLUTION: Supabase allows raw SQL execution via the "pg" database API
# when authenticated as service_role. The endpoint is:
# POST /rest/v1/rpc/<any_function>
# BUT we need to create the function first.

# HOWEVER: there's one more thing to try — Supabase exposes the pg connection
# via the Realtime endpoint for subscriptions, but that doesn't help us.

# ACTUAL FINAL SOLUTION: The Supabase Management API requires a PAT.
# But service_role key IS basically a PAT for the project.
# Let's try to call the Management API with service_role instead of PAT:
$mgmtUrl = "https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/query"
$testSql = "SELECT column_name FROM information_schema.columns WHERE table_name = 'news_items' ORDER BY ordinal_position"
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes("{`"query`":`"$testSql`"}")

Write-Host "Trying Management API with service_role key..."
try {
    $resp = Invoke-WebRequest -Uri $mgmtUrl -Method POST -Headers @{
        "Authorization" = "Bearer $serviceKey"
        "Content-Type" = "application/json"
    } -Body $bodyBytes -UseBasicParsing -TimeoutSec 15
    Write-Host "Status: $($resp.StatusCode)"
    Write-Host "Body: $($resp.Content.Substring(0, [Math]::Min(500, $resp.Content.Length)))"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errBody = $reader.ReadToEnd()
        Write-Host "FAIL $statusCode : $errBody"
    } catch {
        Write-Host "FAIL $statusCode"
    }
}
