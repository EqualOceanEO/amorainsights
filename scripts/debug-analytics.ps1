$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$ref = "jqppcuccqkxhhrvndsil"
$api = "https://api.supabase.com/v1/projects/$ref/database/query"
$headers = @{ "Authorization" = "Bearer $pat"; "Content-Type" = "application/json" }

function RunSQL($sql) {
    $body = [System.Text.Encoding]::UTF8.GetBytes(("{""query"":""$sql""}"))
    try {
        $r = Invoke-WebRequest -Uri $api -Method POST -Headers $headers -Body $body -UseBasicParsing
        return $r.Content
    } catch {
        return "ERROR: $($_.Exception.Message) | $($_.Exception.Response.StatusCode)"
    }
}

Write-Host "=== page_views count ==="
RunSQL "SELECT COUNT(*) as cnt FROM page_views"

Write-Host ""
Write-Host "=== page_views sample (last 5) ==="
RunSQL "SELECT id, path, session_id, device_type, country, created_at FROM page_views ORDER BY created_at DESC LIMIT 5"

Write-Host ""
Write-Host "=== user_events count ==="
RunSQL "SELECT COUNT(*) as cnt FROM user_events"

Write-Host ""
Write-Host "=== user_events sample (last 5) ==="
RunSQL "SELECT id, event_name, user_id, created_at FROM user_events ORDER BY created_at DESC LIMIT 5"

Write-Host ""
Write-Host "=== page_views table columns ==="
RunSQL "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'page_views' ORDER BY ordinal_position"

Write-Host ""
Write-Host "=== user_events table columns ==="
RunSQL "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_events' ORDER BY ordinal_position"

Write-Host ""
Write-Host "=== RLS policies on page_views ==="
RunSQL "SELECT tablename, policyname, permissive, roles, cmd FROM pg_policies WHERE tablename = 'page_views'"

Write-Host ""
Write-Host "=== RLS policies on user_events ==="
RunSQL "SELECT tablename, policyname, permissive, roles, cmd FROM pg_policies WHERE tablename = 'user_events'"
