cd c:\Users\51229\WorkBuddy\Claw
& "C:\Users\51229\AppData\Local\Microsoft\WindowsApps\python.exe" translate_en.py
Write-Host "Done. File exists: $(Test-Path 'HRI-2026-AMORA-Report-v5.0-en.html')"
if (Test-Path 'HRI-2026-AMORA-Report-v5.0-en.html') {
    Write-Host "File size: $((Get-Item 'HRI-2026-AMORA-Report-v5.0-en.html').Length)"
}
