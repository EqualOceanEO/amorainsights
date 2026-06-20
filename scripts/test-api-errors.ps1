$url = "https://www.amorainsights.com/api/admin/analytics/users?page=1&pageSize=20&q=&tier="
try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction Stop
    Write-Host "STATUS:" $r.StatusCode
    Write-Host "BODY:" $r.Content
} catch {
    Write-Host "STATUS:" $_.Exception.Response.StatusCode.value__
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "BODY:" $reader.ReadToEnd()
}

$url2 = "https://www.amorainsights.com/api/admin/analytics/user/5"
try {
    $r2 = Invoke-WebRequest -Uri $url2 -UseBasicParsing -ErrorAction Stop
    Write-Host "USER STATUS:" $r2.StatusCode
    Write-Host "USER BODY:" $r2.Content
} catch {
    Write-Host "USER STATUS:" $_.Exception.Response.StatusCode.value__
    $stream2 = $_.Exception.Response.GetResponseStream()
    $reader2 = New-Object System.IO.StreamReader($stream2)
    Write-Host "USER BODY:" $reader2.ReadToEnd()
}
