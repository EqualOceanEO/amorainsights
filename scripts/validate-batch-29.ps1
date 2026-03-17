$raw = [System.IO.File]::ReadAllBytes('c:/Users/51229/WorkBuddy/Claw/scripts/insert-batch-29.ps1')
Write-Host "First 3 bytes (BOM check):" $raw[0] $raw[1] $raw[2]
Write-Host "File size bytes:" $raw.Length
