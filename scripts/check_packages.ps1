$pythonExe = "C:\Users\51229\.workbuddy\binaries\python\versions\3.13.12\python.exe"
$script = @"
import subprocess
result = subprocess.run(['$pythonExe', '-m', 'pip', 'list'], capture_output=True, text=True)
for line in result.stdout.split('\n'):
    low = line.lower()
    if any(k in low for k in ['pptx', 'pdf', 'reportlab', 'pillow', 'pymupdf']):
        print(line)
"@
$result = & $pythonExe -c $script 2>&1
Write-Host $result
