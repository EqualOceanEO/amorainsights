Write-Host "Searching for Python installations..."
$pythonPaths = @(
    "C:\Python312\python.exe",
    "C:\Python311\python.exe",
    "C:\Python310\python.exe",
    "C:\Python39\python.exe",
    "C:\Users\51229\AppData\Local\Programs\Python\Python312\python.exe",
    "C:\Users\51229\AppData\Local\Programs\Python\Python311\python.exe",
    "C:\Users\51229\AppData\Local\Programs\Python\Python310\python.exe",
    "C:\Program Files\Python312\python.exe",
    "C:\Program Files (x86)\Python312\python.exe"
)

foreach ($path in $pythonPaths) {
    if (Test-Path $path) {
        Write-Host "Found: $path"
        $version = & $path --version 2>&1
        Write-Host "Version: $version"
    }
}

# Also check conda
$condaPaths = @(
    "C:\Users\51229\anaconda3\python.exe",
    "C:\Users\51229\miniconda3\python.exe",
    "C:\ProgramData\anaconda3\python.exe",
    "C:\ProgramData\miniconda3\python.exe"
)

foreach ($path in $condaPaths) {
    if (Test-Path $path) {
        Write-Host "Found conda: $path"
        $version = & $path --version 2>&1
        Write-Host "Version: $version"
    }
}
