$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$projectRef = "jqppcuccqkxhhrvndsil"
$url = "https://api.supabase.com/v1/projects/$projectRef/database/query"

$headers = @{
    "Authorization" = "Bearer $pat"
    "Content-Type" = "application/json"
    "apikey" = $pat
}

$body = @{
    query = "SELECT id, name, slug FROM companies WHERE slug = 'catl' ORDER BY id;"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
Write-Host "Records with slug = 'catl':"
$response.result | ForEach-Object { Write-Host "ID: $($_.id), Name: $($_.name), Slug: $($_.slug)" }
