$r = Invoke-WebRequest -Uri "http://localhost:3000/news" -TimeoutSec 20 -UseBasicParsing
Write-Host "HTTP Status: $($r.StatusCode)"
$html = $r.Content
Write-Host "HTML length: $($html.Length)"

# Check for error indicators
if ($html -match "Application error|Internal error|Something went wrong|__NEXT_DATA__.*error") {
    Write-Host "ERROR DETECTED in page"
}

# Extract __NEXT_DATA__ to see what data was loaded
if ($html -match '__NEXT_DATA__[^>]*>(\{[^<]+\})<') {
    Write-Host "Next data found"
} else {
    Write-Host "No __NEXT_DATA__ match"
}

# Look for the first 500 chars of body content
$bodyMatch = [regex]::Match($html, '<main[^>]*>(.*?)</main>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
if ($bodyMatch.Success) {
    Write-Host "Main content (first 500):"
    Write-Host $bodyMatch.Groups[1].Value.Substring(0, [Math]::Min(500, $bodyMatch.Groups[1].Value.Length))
}
