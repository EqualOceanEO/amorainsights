$files = Get-ChildItem "C:\Users\51229\Desktop\*.pdf" | Where-Object { $_.Name -like "*储能*" }
foreach ($f in $files) {
    Write-Host "Found: $($f.FullName)"
    Copy-Item -Path $f.FullName -Destination "C:\Users\51229\WorkBuddy\Claw\report.pdf" -Force
    Write-Host "Copied!"
}
