$ErrorActionPreference = 'Continue'
Set-Location "c:\Users\51229\WorkBuddy\Claw"

git add -A
git commit --file=commitmsg.txt

$maxRetries = 3
for ($i = 1; $i -le $maxRetries; $i++) {
    Write-Host "Push attempt $i..."
    git push origin master
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Push succeeded."
        break
    }
    if ($i -lt $maxRetries) {
        Write-Host "Push failed, retrying in 3s..."
        Start-Sleep -Seconds 3
    } else {
        Write-Host "Push failed after $maxRetries attempts."
    }
}
