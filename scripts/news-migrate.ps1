$headers = @{
    "Authorization" = "Bearer sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
    "ContentType" = "application/json"
}

$body = '{"query":"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ''news_items'' ORDER BY ordinal_position;"}'

$response = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/query" -Method POST -Headers $headers -Body $body
$response | ConvertTo-Json -Depth 10
