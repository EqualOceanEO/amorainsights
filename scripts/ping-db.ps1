$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$uri = "https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/query"
$body = '{"query":"SELECT current_database();"}'
$resp = Invoke-WebRequest -Uri $uri -Method POST -Headers @{"Authorization"="Bearer $pat";"Content-Type"="application/json"} -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) -UseBasicParsing -TimeoutSec 30
Write-Host $resp.StatusCode
Write-Host $resp.Content
