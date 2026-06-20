# Check humanoid-robot companies in database

$body = @"
select id, name, name_cn, industry_slug, country, hq_city, is_tracked, is_public
from companies
where industry_slug = 'humanoid-robots'
order by name;
"@

$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
$response = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/query" `
    -Method POST `
    -Headers @{
        "Authorization" = "Bearer sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
        "Content-Type" = "application/json"
    } `
    -Body $bytes

$response | ConvertTo-Json -Depth 10
