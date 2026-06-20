$ErrorActionPreference = 'Stop'
$pptxPath = [System.IO.Path]::GetFullPath('C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v2.pptx')
$pdfPath = [System.IO.Path]::GetFullPath('C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v2.pdf')

Write-Host "PPTX Path: $pptxPath"
Write-Host "PDF Path: $pdfPath"
Write-Host "File exists: $(Test-Path $pptxPath)"
Write-Host "File size: $((Get-Item $pptxPath).Length)"

# Try different ways to get PowerPoint
$ppt = $null
try {
    Write-Host "Trying GetObject (existing instance)..."
    $ppt = [System.Runtime.InteropServices.Marshal]::GetActiveObject('PowerPoint.Application')
    Write-Host "Got existing PowerPoint instance"
} catch {
    Write-Host "No existing instance, trying NewObject..."
    try {
        $ppt = New-Object -ComObject PowerPoint.Application
        Write-Host "Created new PowerPoint instance"
    } catch {
        Write-Host "Failed to create PowerPoint: $($_.Exception.Message)"
        exit 1
    }
}

$ppt.Visible = $true
$ppt.DisplayAlerts = 0  # ppAlertsNone

Write-Host "Opening presentation..."
$pres = $ppt.Presentations.Open($pptxPath, $false, $false, $false)

Write-Host "Saving as PDF (format=32)..."
$pres.SaveAs($pdfPath, 32)

Write-Host "Closing presentation..."
$pres.Close()

Write-Host "Quitting PowerPoint..."
$ppt.Quit()

[System.Runtime.Interopservices.Marshal]::ReleaseComObject($pres) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null

if (Test-Path $pdfPath) {
    Write-Host "SUCCESS! PDF size: $((Get-Item $pdfPath).Length) bytes"
} else {
    Write-Host "PDF file not created!"
}
