$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$projectRef = "jqppcuccqkxhhrvndsil"
$url = "https://api.supabase.com/v1/projects/$projectRef/database/query"

$headers = @{
    "Authorization" = "Bearer $pat"
    "Content-Type" = "application/json"
    "apikey" = $pat
}

# First check the two duplicate records
$checkQuery = @{
    query = "SELECT id, name, name_cn, ticker, exchange, industry_slug, sub_sector, country FROM companies WHERE name LIKE '%CATL%' ORDER BY id;"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $checkQuery
Write-Host "Current CATL records:"
$response.result | ForEach-Object { Write-Host "ID: $($_.id), Name: $($_.name), Ticker: $($_.ticker)" }

# Delete the duplicate (ID 324)
$deleteQuery = @{
    query = "DELETE FROM companies WHERE id = 324;"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $deleteQuery
Write-Host "`nDeleted ID 324, status: $($response.status)"

# Verify deletion
$verifyQuery = @{
    query = "SELECT id, name FROM companies WHERE name LIKE '%CATL%' ORDER BY id;"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $verifyQuery
Write-Host "`nRemaining CATL records:"
$response.result | ForEach-Object { Write-Host "ID: $($_.id), Name: $($_.name)" }
