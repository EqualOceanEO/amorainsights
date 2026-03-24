Write-Host "Testing python..."
$pythonPath = "C:\Users\51229\AppData\Local\Microsoft\WindowsApps\python.exe"
$testResult = & $pythonPath -c "print('hello')" 2>&1
Write-Host "Result: $testResult"
Write-Host "Exit code: $LASTEXITCODE"
