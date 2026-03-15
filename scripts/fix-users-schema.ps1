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

Write-Host "=== Add missing columns to users table ==="
RunSQL "ALTER TABLE users ADD COLUMN IF NOT EXISTS acquisition_channel TEXT"
RunSQL "ALTER TABLE users ADD COLUMN IF NOT EXISTS conversion_last_touch TEXT"
RunSQL "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_content_slug TEXT"

Write-Host ""
Write-Host "=== Check page_views user_id distribution ==="
RunSQL "SELECT user_id, COUNT(*) as cnt FROM page_views GROUP BY user_id ORDER BY cnt DESC"

Write-Host ""
Write-Host "=== Check user_events user_id distribution ==="
RunSQL "SELECT user_id, COUNT(*) as cnt FROM user_events GROUP BY user_id ORDER BY cnt DESC"
