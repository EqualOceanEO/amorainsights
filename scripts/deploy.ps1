$ErrorActionPreference = "Stop"
$projectRoot = "c:\Users\51229\WorkBuddy\Claw"

Set-Location $projectRoot

Write-Host "=== Claw Deploy Script ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: git add
Write-Host "[1/3] git add -A ..." -ForegroundColor Yellow
git add -A
if ($LASTEXITCODE -ne 0) { Write-Host "git add failed" -ForegroundColor Red; exit 1 }

# Step 2: git commit
$msgFile = Join-Path $projectRoot "commitmsg.txt"
if (-not (Test-Path $msgFile)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    "chore: update $timestamp" | Out-File -FilePath $msgFile -Encoding UTF8
}

Write-Host "[2/3] git commit ..." -ForegroundColor Yellow
git commit --file=$msgFile
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nothing to commit or commit failed" -ForegroundColor Yellow
}

# Step 3: git push (retry 3 times)
Write-Host "[3/3] git push origin master ..." -ForegroundColor Yellow
$maxRetry = 3
for ($i = 1; $i -le $maxRetry; $i++) {
    git push origin master
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=== Push SUCCESS! Vercel will auto-deploy in 2-3 min ===" -ForegroundColor Green
        Write-Host "Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor Cyan
        break
    }
    if ($i -lt $maxRetry) {
        Write-Host "Push failed (attempt $i/$maxRetry), retrying in 5s..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    } else {
        Write-Host "Push failed after $maxRetry attempts. Code is committed locally." -ForegroundColor Red
        Write-Host "Run manually later: git push origin master" -ForegroundColor Yellow
    }
}
