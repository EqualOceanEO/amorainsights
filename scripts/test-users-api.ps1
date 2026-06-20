$r1 = Invoke-WebRequest -Uri "https://www.amorainsights.com/api/admin/analytics/users?page=1&pageSize=20&q=&tier=" -UseBasicParsing
Write-Host "USERS STATUS:" $r1.StatusCode
Write-Host "USERS BODY:" $r1.Content

Write-Host ""

$r2 = Invoke-WebRequest -Uri "https://www.amorainsights.com/api/admin/analytics/user/5" -UseBasicParsing
Write-Host "USER JOURNEY STATUS:" $r2.StatusCode
Write-Host "USER JOURNEY BODY:" $r2.Content
