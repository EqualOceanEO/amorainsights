$base = "https://www.amorainsights.com"

function TestApi($path) {
    try {
        $r = Invoke-WebRequest -Uri "$base$path" -UseBasicParsing -ErrorAction Stop
        $body = $r.Content | ConvertFrom-Json
        Write-Host "OK $path - status:$($r.StatusCode)"
        return $body
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errBody = $reader.ReadToEnd()
            Write-Host "FAIL $path - status:$code - $errBody"
        } catch {
            Write-Host "FAIL $path - status:$code"
        }
    }
}

Write-Host "=== Testing all analytics APIs ==="
$overview = TestApi "/api/admin/analytics/overview?days=30"
if ($overview) {
    Write-Host "  -> pageViews:$($overview.summary.totalPageViews) sessions:$($overview.summary.uniqueSessions) users:$($overview.summary.totalUsers) events:$($overview.summary.totalEvents)"
}

Write-Host ""
$users = TestApi "/api/admin/analytics/users?page=1&pageSize=20&q=&tier="
if ($users) {
    Write-Host "  -> total users:$($users.total)"
    foreach ($u in $users.data) {
        Write-Host "     User $($u.id): $($u.email) | pvs:$($u.pageViews) events:$($u.totalEvents) lastSeen:$($u.lastSeen)"
    }
}

Write-Host ""
$journey = TestApi "/api/admin/analytics/user/5"
if ($journey) {
    Write-Host "  -> user: $($journey.user.email)"
    Write-Host "     pvs:$($journey.stats.totalPvs) events:$($journey.stats.totalEvents) sessions:$($journey.stats.sessionCount)"
    Write-Host "     firstSeen:$($journey.stats.firstSeen) lastSeen:$($journey.stats.lastSeen)"
    Write-Host "     topPages: $($journey.topPages | ConvertTo-Json -Compress)"
}
