# Update humanoid robot companies to use humanoid-robots industry

$supabaseUrl = "https://jqppcuccqkxhhrvndsil.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"
$patchHeaders = @{ "apikey" = $anonKey; "Authorization" = "Bearer $anonKey"; "Content-Type" = "application/json; charset=utf-8"; "Prefer" = "return=minimal" }

# List of humanoid robot company IDs (from batch 19)
$companyIds = @(181, 182, 183, 184, 185, 186, 187, 188, 189, 190)

foreach ($id in $companyIds) {
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes('{"industry_slug":"humanoid-robots"}')
    try {
        $r = Invoke-WebRequest -Uri "$supabaseUrl/rest/v1/companies?id=eq.$id" -Method PATCH -Headers $patchHeaders -Body $bodyBytes -UseBasicParsing
        Write-Host "OK: Company $id updated to humanoid-robots"
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "ERR $id : $statusCode"
    }
}
