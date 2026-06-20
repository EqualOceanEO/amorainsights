$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$uri = "https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/query"
$q = "SELECT slug, name, name_cn FROM industries WHERE slug IN ('manufacturing','intelligent-manufacturing');"
$resp = Invoke-WebRequest -Uri $uri -Method POST -Headers @{"Authorization"="Bearer $pat";"Content-Type"="application/json"} -Body ([System.Text.Encoding]::UTF8.GetBytes(([PSCustomObject]@{query=$q}|ConvertTo-Json -Compress))) -UseBasicParsing -TimeoutSec 60
Write-Host $resp.Content
