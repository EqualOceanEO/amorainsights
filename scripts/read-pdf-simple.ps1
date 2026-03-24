$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Try using Edge/Chrome to print PDF to text
$pdfPath = "C:\Users\51229\Desktop\中国储能企业出海中东研究报告2025 .pdf"
$outputPath = "c:\Users\51229\WorkBuddy\Claw\pdf_content.txt"

# Check if file exists
if (-not (Test-Path $pdfPath)) {
    Write-Host "PDF file not found: $pdfPath"
    exit 1
}

Write-Host "PDF exists: $pdfPath"
Write-Host "File size: $((Get-Item $pdfPath).Length) bytes"

# Try reading as raw bytes and extract text patterns
$bytes = [System.IO.File]::ReadAllBytes($pdfPath)
Write-Host "Read $($bytes.Length) bytes"

# Look for text markers in PDF
$content = [System.Text.Encoding]::UTF8.GetString($bytes)
$textContent = ""

# Extract text between BT and ET markers (PDF text objects)
if ($content -match 'BT(.*?)ET' -Replace 'BT', '' -Replace 'ET', '') {
    Write-Host "Found text objects"
}

# Try to find readable text
$matches = [regex]::Matches($content, '\(((?:[^()\\]|\\.)*)\)')
$textParts = @()
foreach ($m in $matches) {
    $t = $m.Groups[1].Value
    # Filter for readable Chinese/English
    if ($t -match '[\u4e00-\u9fff]|[a-zA-Z]{3,}') {
        $textParts += $t
    }
}

if ($textParts.Count -gt 0) {
    $textContent = $textParts -join " "
    Write-Host "Extracted $($textParts.Count) text fragments"
    Write-Host "First 2000 chars: $($textContent.Substring(0, [Math]::Min(2000, $textContent.Length)))"
} else {
    Write-Host "No text fragments found"
}

# Save what we have
[System.IO.File]::WriteAllText($outputPath, $textContent, [System.Text.Encoding]::UTF8)
Write-Host "Saved to $outputPath"
