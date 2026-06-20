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
        Write-Host "   $($r.StatusCode) $($r.Content.Substring(0, [Math]::Min(200, $r.Content.Length)))"
    } catch {
        Write-Host "   ERROR: $($_.Exception.Message)"
    }
}

# Step 1: Add is_admin column
Q "1 add is_admin" "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;"
Q "2 idx is_admin"  "CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = true;"

# Step 3: Verify column added
Q "3 verify" "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name='users' AND column_name='is_admin';"

Write-Host "DB migration done."
