Set-Location 'c:\Users\51229\WorkBuddy\Claw'
$output = & node 'C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js' next build 2>&1
$output | Where-Object { $_ -match 'Type error|error TS|Failed|Cannot find' } | Select-Object -First 20
Write-Host "--- Last 10 lines ---"
$output | Select-Object -Last 10
