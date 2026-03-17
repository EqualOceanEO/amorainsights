Set-Location 'c:/Users/51229/WorkBuddy/Claw'
$result = & npx next build 2>&1
$result | Out-File -FilePath 'c:/Users/51229/WorkBuddy/Claw/build-output.txt' -Encoding UTF8
Write-Host "Done. Lines: $($result.Count)"
