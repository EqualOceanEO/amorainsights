$pat = 'sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc'
$ref = 'jqppcuccqkxhhrvndsil'
$uri = "https://api.supabase.com/v1/projects/$ref/database/query"

function Q($label, $sql) {
    Write-Host ">> $label"
    $obj  = [PSCustomObject]@{ query = $sql }
    $json = $obj | ConvertTo-Json -Depth 20 -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $headers = @{ 'Authorization' = "Bearer $pat"; 'Content-Type' = 'application/json' }
    try {
        $r = Invoke-WebRequest -Uri $uri -Method POST -Headers $headers -Body $bytes -UseBasicParsing -TimeoutSec 60
        Write-Host "   $($r.StatusCode) $($r.Content.Substring(0, [Math]::Min(300, $r.Content.Length)))"
    } catch {
        Write-Host "   ERROR: $($_.Exception.Message)"
    }
}

# Step 1: Register admin via local API
Write-Host ">> register admin via API"
$regBody = '{"email":"admin@amorainsights.com","password":"Abc1234%","name":"Admin"}'
$regBytes = [System.Text.Encoding]::UTF8.GetBytes($regBody)
$regHeaders = @{ 'Content-Type' = 'application/json' }
try {
    $regResp = Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/register' -Method POST -Headers $regHeaders -Body $regBytes -UseBasicParsing -TimeoutSec 15
    Write-Host "   $($regResp.StatusCode) $($regResp.Content)"
} catch {
    $errMsg = $_.Exception.Message
    Write-Host "   WARN: $errMsg (may already exist)"
}

# Step 2: Set is_admin=true for admin email
Q "set is_admin" "UPDATE users SET is_admin = true WHERE email = 'admin@amorainsights.com';"

# Step 3: Verify
Q "verify admin" "SELECT id, email, is_admin FROM users WHERE email = 'admin@amorainsights.com';"

Write-Host "Admin setup done."
