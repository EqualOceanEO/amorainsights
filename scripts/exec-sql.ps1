$sqlFile = $args[0]
$label   = $args[1]
$pat = "sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc"
$projectRef = "jqppcuccqkxhhrvndsil"

$sql = Get-Content $sqlFile -Raw -Encoding UTF8
Write-Host ""
Write-Host "=== $label ==="
Write-Host "File: $sqlFile ($($sql.Length) bytes)"

# Build JSON body manually to avoid encoding issues
$bodyObj = [PSCustomObject]@{ query = $sql }
$body = $bodyObj | ConvertTo-Json -Depth 5 -Compress

$headers = @{
    "Authorization" = "Bearer $pat"
    "Content-Type"  = "application/json"
}

Write-Host "Executing..."
try {
    $response = Invoke-WebRequest `
        -Uri "https://api.supabase.com/v1/projects/$projectRef/database/query" `
        -Method POST `
        -Headers $headers `
        -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) `
        -UseBasicParsing `
        -TimeoutSec 120

    Write-Host "Status: $($response.StatusCode)"
    $content = $response.Content
    if ($content.Length -gt 800) { $content = $content.Substring(0, 800) + "..." }
    Write-Host "Result: $content"
    Write-Host "✅ SUCCESS: $label"
    exit 0
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)"
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $err = $reader.ReadToEnd()
        if ($err.Length -gt 800) { $err = $err.Substring(0, 800) }
        Write-Host "Error details: $err"
    } catch {}
    exit 1
}
