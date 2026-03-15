$PAT = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$PROJECT_REF = "jqppcuccqkxhhrvndsil"
$API_URL = "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query"
$HEADERS = @{ "Authorization" = "Bearer $PAT"; "Content-Type" = "application/json" }

$sql1 = "ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_format TEXT NOT NULL DEFAULT 'markdown';"
$body1 = [System.Text.Encoding]::UTF8.GetBytes("{`"query`":`"$sql1`"}")
$r1 = Invoke-WebRequest -Uri $API_URL -Method POST -Headers $HEADERS -Body $body1
Write-Host "SQL1: $($r1.StatusCode)"
