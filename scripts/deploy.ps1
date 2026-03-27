$ErrorActionPreference = "Continue"
$repo = "C:\Users\51229\WorkBuddy\Claw"
$proxy = "http://localhost:15236"

Set-Location $repo
$env:HTTP_PROXY = $proxy
$env:HTTPS_PROXY = $proxy
git config --global http.proxy $proxy
git config --global https.proxy $proxy

git add -A
git commit --file=commitmsg.txt
$success = $?
Remove-Item commitmsg.txt -Force -EA SilentlyContinue

if ($success) {
    for ($i = 1; $i -le 3; $i++) {
        Write-Host "[$i/3] Pushing to origin master..."
        git push origin master 2>&1
        if ($LASTEXITCODE -eq 0) { Write-Host "Push OK"; break }
        Write-Host "Retry in 5s..."; Start-Sleep 5
    }
}
