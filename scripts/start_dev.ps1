Set-Location 'c:\Users\51229\WorkBuddy\Claw'
Start-Process powershell -ArgumentList '-NoProfile -Command "npm run dev 2>&1 | Out-File -Encoding utf8 .workbuddy\dev3000.log"' -WindowStyle Hidden
