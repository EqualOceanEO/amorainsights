$ErrorActionPreference = 'Stop'
$pptxPath = 'C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v2.pptx'
$pdfPath = 'C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v2.pdf'

Write-Host "Converting PPTX to PDF..."
Write-Host "Source file exists: $(Test-Path $pptxPath)"
Write-Host "Source file size: $((Get-Item $pptxPath).Length) bytes"

try {
    $ppt = New-Object -ComObject PowerPoint.Application
    $ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue

    Write-Host "Opening presentation..."
    $presentation = $ppt.Presentations.Open($pptxPath, [Microsoft.Office.Core.MsoTriState]::msoFalse, $false, $false)
    Write-Host "Presentation opened successfully, saving as PDF..."
    $presentation.SaveAs($pdfPath, 32)  # 32 = ppSaveAsPDF
    Write-Host "PDF saved, closing..."
    $presentation.Close()
    Write-Host "Quitting PowerPoint..."
    $ppt.Quit()

    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($presentation) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null

    Write-Host "SUCCESS: PDF saved to $pdfPath"
    Write-Host "PDF size: $((Get-Item $pdfPath).Length) bytes"
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    try { $ppt.Quit() } catch {}
}
