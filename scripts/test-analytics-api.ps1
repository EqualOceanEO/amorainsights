$url = "https://www.amorainsights.com/api/admin/analytics/overview?days=30"
$r = Invoke-WebRequest -Uri $url -UseBasicParsing
Write-Host "STATUS:" $r.StatusCode
Write-Host "BODY:" $r.Content
