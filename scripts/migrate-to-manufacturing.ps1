# Migrate intelligent-manufacturing to manufacturing
$api = "https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/query"
$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$headers = @{
    "Authorization" = "Bearer $pat"
    "Content-Type" = "application/json"
}

# Update industries table
$sql1 = "UPDATE industries SET slug='manufacturing', name='Manufacturing', name_cn='未来制造' WHERE slug='intelligent-manufacturing';"
$body1 = @{ q = $sql1 } | ConvertTo-Json
Write-Host "Updating industries..."
try {
    $r1 = Invoke-RestMethod -Uri $api -Method POST -Headers $headers -Body $body1
    Write-Host "Industries updated: $($r1 | ConvertTo-Json)"
} catch {
    Write-Host "Error: $_"
}

# Update reports
$sql2 = "UPDATE reports SET industry_slug='manufacturing' WHERE industry_slug='intelligent-manufacturing';"
$body2 = @{ q = $sql2 } | ConvertTo-Json
Write-Host "Updating reports..."
try {
    $r2 = Invoke-RestMethod -Uri $api -Method POST -Headers $headers -Body $body2
    Write-Host "Reports updated: $($r2 | ConvertTo-Json)"
} catch {
    Write-Host "Error: $_"
}

# Update news_items
$sql3 = "UPDATE news_items SET industry_slug='manufacturing' WHERE industry_slug='intelligent-manufacturing';"
$body3 = @{ q = $sql3 } | ConvertTo-Json
Write-Host "Updating news_items..."
try {
    $r3 = Invoke-RestMethod -Uri $api -Method POST -Headers $headers -Body $body3
    Write-Host "News updated: $($r3 | ConvertTo-Json)"
} catch {
    Write-Host "Error: $_"
}

# Update companies
$sql4 = "UPDATE companies SET industry_slug='manufacturing' WHERE industry_slug='intelligent-manufacturing';"
$body4 = @{ q = $sql4 } | ConvertTo-Json
Write-Host "Updating companies..."
try {
    $r4 = Invoke-RestMethod -Uri $api -Method POST -Headers $headers -Body $body4
    Write-Host "Companies updated: $($r4 | ConvertTo-Json)"
} catch {
    Write-Host "Error: $_"
}

# Verify result
$verify = "SELECT slug, name, name_cn FROM industries WHERE slug='manufacturing';"
$bodyV = @{ q = $verify } | ConvertTo-Json
Write-Host "Verifying..."
try {
    $rv = Invoke-RestMethod -Uri $api -Method POST -Headers $headers -Body $bodyV
    Write-Host "Result: $($rv | ConvertTo-Json)"
} catch {
    Write-Host "Error: $_"
}

Write-Host "Migration complete!"
