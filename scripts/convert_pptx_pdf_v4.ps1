$ErrorActionPreference = 'Stop'
$pptxPath = [System.IO.Path]::GetFullPath('C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v2.pptx')
$pdfPath = [System.IO.Path]::GetFullPath('C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v2.pdf')

Write-Host "PPTX: $pptxPath"
Write-Host "PDF: $pdfPath"
Write-Host "Exists: $(Test-Path $pptxPath)"

$ppt = $null
try {
    $ppt = [System.Runtime.InteropServices.Marshal]::GetActiveObject('PowerPoint.Application')
    Write-Host "Using existing PowerPoint instance (PID: $($ppt.Application.ActiveWindow))"
} catch {
    Write-Host "Creating new PowerPoint instance..."
    $ppt = New-Object -ComObject PowerPoint.Application
}

$ppt.Visible = -1  # msoTrue
$ppt.DisplayAlerts = 2  # ppAlertsNone

Write-Host "Opening presentation..."
try {
    $pres = $ppt.Presentations.Open($pptxPath, $false, $false, $false)
    Write-Host "Presentation opened"
} catch {
    Write-Host "OPEN ERROR: $($_.Exception.Message)"
    $ppt.Quit()
    exit 1
}

Write-Host "Saving as PDF (format 32)..."
try {
    $pres.SaveAs($pdfPath, 32)
    Write-Host "SaveAs completed"
} catch {
    Write-Host "SAVE ERROR: $($_.Exception.Message)"
    $pres.Close()
    $ppt.Quit()
    exit 1
}

$pres.Close()
Write-Host "Quitting PowerPoint..."
$ppt.Quit()

[System.Runtime.Interopservices.Marshal]::ReleaseComObject($pres) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null

if (Test-Path $pdfPath) {
    $sizeMB = [math]::Round((Get-Item $pdfPath).Length / 1MB, 2)
    Write-Host "SUCCESS! PDF: $sizeMB MB"
} else {
    Write-Host "FAILED"
}
