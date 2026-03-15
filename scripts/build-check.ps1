Set-Location c:/Users/51229/WorkBuddy/Claw
$output = npm run build 2>&1
$output | Select-Object -Last 80 | ForEach-Object { Write-Host $_ }
Write-Host "EXIT: $LASTEXITCODE"
