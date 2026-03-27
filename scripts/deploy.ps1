Set-Location "c:\Users\51229\WorkBuddy\Claw"
git add -A
git commit --file=commitmsg.txt
$retryCount = 0
$maxRetries = 3
$success = $false
while (-not $success -and $retryCount -lt $maxRetries) {
    $result = git push origin master 2>&1
    if ($LASTEXITCODE -eq 0) {
        $success = $true
        Write-Host "Push succeeded."
    } else {
        $retryCount++
        Write-Host "Push failed (attempt $retryCount). Retrying..."
        Start-Sleep -Seconds 3
    }
}
if (-not $success) { Write-Host "Push failed after $maxRetries attempts." }
