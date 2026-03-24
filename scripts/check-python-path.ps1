Write-Host "Checking python..."
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if ($pythonCmd) {
    Write-Host "Python found: $($pythonCmd.Source)"
    $result = & python --version 2>&1
    Write-Host "Version: $result"
} else {
    Write-Host "Python not found in PATH"
}
