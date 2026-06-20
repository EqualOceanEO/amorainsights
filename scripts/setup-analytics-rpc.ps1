$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$projectRef = "jqppcuccqkxhhrvndsil"
$apiUrl = "https://api.supabase.com/v1/projects/$projectRef/database/query"
$headers = @{ "Authorization" = "Bearer $pat"; "Content-Type" = "application/json" }

# Use $BODY$ as dollar-quote delimiter to avoid issues with $$ in PowerShell
$sql = "CREATE OR REPLACE FUNCTION count_unique_sessions(since_ts TIMESTAMPTZ) RETURNS BIGINT LANGUAGE sql STABLE AS " + [char]36 + [char]36 + " SELECT COUNT(DISTINCT session_id) FROM page_views WHERE session_id IS NOT NULL AND created_at >= since_ts " + [char]36 + [char]36

$body = @{ query = $sql } | ConvertTo-Json -Compress
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)

try {
  $r = Invoke-WebRequest -Uri $apiUrl -Method POST -Headers $headers -Body $bodyBytes -UseBasicParsing
  Write-Host "Status: $($r.StatusCode)"
  Write-Host $r.Content
} catch {
  $stream = $_.Exception.Response.GetResponseStream()
  $reader = New-Object System.IO.StreamReader($stream)
  Write-Host "ERR: $($reader.ReadToEnd())"
}
