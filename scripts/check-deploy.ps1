$html = (Invoke-WebRequest -Uri 'https://www.amorainsights.com/news' -UseBasicParsing).Content
$scripts = [regex]::Matches($html, 'src="(/_next/static/chunks/[^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique
Write-Host "=== JS chunks on live site ==="
$scripts | ForEach-Object { Write-Host $_ }

Write-Host ""
Write-Host "=== Checking for 'scrollbar-none' in each chunk ==="
foreach ($s in $scripts) {
    $url = "https://www.amorainsights.com$s"
    $content = (Invoke-WebRequest -Uri $url -UseBasicParsing).Content
    if ($content -match "scrollbar-none|INDUSTRY_HIERARCHY|level2|Level 1") {
        Write-Host "FOUND in: $s"
        $match = [regex]::Match($content, '.{100}(scrollbar-none|INDUSTRY_HIERARCHY|level2).{100}')
        Write-Host $match.Value
    }
}
