$ErrorActionPreference = 'Stop'
$pptxPath = [System.IO.Path]::GetFullPath('C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v2.pptx')
$pdfPath = [System.IO.Path]::GetFullPath('C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v2.pdf')

Write-Host "PPTX: $pptxPath"
Write-Host "PDF: $pdfPath"
Write-Host "Exists: $(Test-Path $pptxPath)"

# Load Office type library
try {
    Add-Type -AssemblyName Microsoft.Office.Interop.PowerPoint
    Add-Type -AssemblyName Office
    Write-Host "Office assemblies loaded"
} catch {
    Write-Host "Could not load assemblies: $($_.Exception.Message)"
}

$ppt = $null
try {
    # Try to get running instance first
    $ppt = [System.Runtime.InteropServices.Marshal]::GetActiveObject('PowerPoint.Application')
    Write-Host "Using existing PowerPoint instance"
} catch {
    Write-Host "Creating new PowerPoint instance..."
    $ppt = New-Object -ComObject PowerPoint.Application
    Write-Host "New instance created"
}

# MsoTriState: msoTrue=-1, msoFalse=0, msoTriStateMixed=-2
$msoTrue = -1
$msoFalse = 0

$ppt.Visible = $msoTrue
$ppt.DisplayAlerts = $msoFalse  # ppAlertsNone = 2

Write-Host "Opening presentation..."
$pres = $ppt.Presentations.Open($pptxPath, $msoFalse, $msoFalse, $msoFalse)

Write-Host "Saving as PDF (format 32=PDF)..."
$pres.SaveAs($pdfPath, 32)

Write-Host "Closing..."
$pres.Close()
$pres = $null

Write-Host "Quitting..."
$ppt.Quit()

[System.Runtime.Interopservices.Marshal]::ReleaseComObject($pres) | Out-Null
$pptCom = $ppt
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($pptCom) | Out-Null

if (Test-Path $pdfPath) {
    $sizeMB = [math]::Round((Get-Item $pdfPath).Length / 1MB, 2)
    Write-Host "SUCCESS! PDF: $pdfPath ($sizeMB MB)"
} else {
    Write-Host "FAILED - PDF not created"
}
