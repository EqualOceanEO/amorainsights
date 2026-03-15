$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$ref = "jqppcuccqkxhhrvndsil"
$api = "https://api.supabase.com/v1/projects/$ref/database/query"
$headers = @{ "Authorization" = "Bearer $pat"; "Content-Type" = "application/json" }

function RunSQL($sql) {
    $body = [System.Text.Encoding]::UTF8.GetBytes("{""query"":""$sql""}")
    try {
        $r = Invoke-WebRequest -Uri $api -Method POST -Headers $headers -Body $body -UseBasicParsing
        Write-Host "OK:" $r.Content
    } catch {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "ERR:" $reader.ReadToEnd()
    }
}

Write-Host "=== Test: select all needed user columns ==="
RunSQL "SELECT id, email, name, created_at, is_admin, subscription_tier, subscription_expires_at, acquisition_channel, conversion_last_touch, last_content_slug FROM users WHERE id = 5"

Write-Host ""
Write-Host "=== Test: users list query (same as API) ==="
RunSQL "SELECT id, email, name, created_at, is_admin, subscription_tier, subscription_expires_at, acquisition_channel FROM users ORDER BY created_at DESC LIMIT 20"
