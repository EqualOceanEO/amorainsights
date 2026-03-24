$pages = Get-ChildItem "c:\Users\51229\WorkBuddy\Claw\src\app" -Recurse -Filter "page.tsx"
foreach ($f in $pages) {
    $lines = Get-Content $f.FullName
    $lineNum = 0
    foreach ($line in $lines) {
        $lineNum++
        if ($line -match "max-w-(5xl|4xl|3xl|6xl)" -and $line -match "mx-auto") {
            $rel = $f.FullName.Replace("c:\Users\51229\WorkBuddy\Claw\src\app\", "")
            Write-Host "$rel : $lineNum : $($line.Trim())"
        }
    }
}
