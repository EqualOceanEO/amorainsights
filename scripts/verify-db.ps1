#!/usr/bin/env pwsh
# verify-db.ps1 — End-to-end DB validation after Franklyn's SQL batch
# Checks: users columns, reports table, subscribers table, compliance RPC

$SUPABASE_URL  = "https://jqppcuccqkxhhrvndsil.supabase.co"
$ANON_KEY      = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8"

$headers = @{
    "apikey"        = $ANON_KEY
    "Authorization" = "Bearer $ANON_KEY"
    "Content-Type"  = "application/json"
}

function Check($label, $url, $expectField) {
    try {
        $r = Invoke-RestMethod -Uri $url -Headers $headers -Method GET -TimeoutSec 10
        if ($r -and ($r.Count -gt 0 -or $r.PSObject.Properties)) {
            Write-Host "  [PASS] $label" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] $label — empty result" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [FAIL] $label — $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== AMORA DB End-to-End Verification ===" -ForegroundColor Cyan
Write-Host ""

# 1. users table — check subscription_tier column exists
Write-Host "1. users table (subscription_tier column)" -ForegroundColor White
Check "users with subscription_tier" `
    "$SUPABASE_URL/rest/v1/users?select=id,email,subscription_tier&limit=1" `
    "subscription_tier"

# 2. users table — subscription_expires_at column
Check "users with subscription_expires_at" `
    "$SUPABASE_URL/rest/v1/users?select=id,subscription_expires_at&limit=1" `
    "subscription_expires_at"

# 3. reports table
Write-Host ""
Write-Host "2. reports table" -ForegroundColor White
Check "reports basic query" `
    "$SUPABASE_URL/rest/v1/reports?select=id,title,is_premium&limit=3" `
    "id"

# 4. subscribers table
Write-Host ""
Write-Host "3. subscribers table" -ForegroundColor White
Check "subscribers table exists" `
    "$SUPABASE_URL/rest/v1/subscribers?select=id,email,subscribed_at&limit=1" `
    "id"

# 5. compliance tables
Write-Host ""
Write-Host "4. compliance tables" -ForegroundColor White
Check "entity_list_scans table" `
    "$SUPABASE_URL/rest/v1/entity_list_scans?select=id&limit=1" `
    "id"

# 6. Quick API test — /api/subscribe (OPTIONS to check route exists)
Write-Host ""
Write-Host "5. Next.js API routes (production)" -ForegroundColor White
try {
    $r = Invoke-WebRequest -Uri "https://amorainsights.com/api/subscribe" -Method OPTIONS -TimeoutSec 10 -UseBasicParsing
    Write-Host "  [PASS] /api/subscribe route reachable (HTTP $($r.StatusCode))" -ForegroundColor Green
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 405 -or $code -eq 200) {
        Write-Host "  [PASS] /api/subscribe route reachable (HTTP $code)" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] /api/subscribe — HTTP $code (may be ok)" -ForegroundColor Yellow
    }
}

# 7. Check Vercel deployment is live
try {
    $r = Invoke-WebRequest -Uri "https://amorainsights.com" -Method GET -TimeoutSec 10 -UseBasicParsing
    Write-Host "  [PASS] amorainsights.com reachable (HTTP $($r.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] amorainsights.com not reachable" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Verification complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step: manually set a user to subscription_tier='pro' and test ChartBlock interactive mode." -ForegroundColor Gray
Write-Host "SQL: UPDATE users SET subscription_tier='pro' WHERE email='your@email.com';" -ForegroundColor DarkGray
Write-Host ""
