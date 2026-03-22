Set-Location c:/Users/51229/WorkBuddy/Claw
Start-Job -ScriptBlock { Set-Location c:/Users/51229/WorkBuddy/Claw; npm run dev } | Out-Null
Write-Host "Dev server starting..."
Start-Sleep -Seconds 8
Write-Host "Done"
