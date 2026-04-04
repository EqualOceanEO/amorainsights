import subprocess
import sys
import os

# Check if comtypes is available
try:
    import comtypes.client
    print("comtypes available")
except ImportError:
    print("comtypes NOT available, trying pywin32...")

# Check available packages
result = subprocess.run([sys.executable, "-m", "pip", "list"], 
                       capture_output=True, text=True)
for line in result.stdout.split("\n"):
    if any(x in line.lower() for x in ["pptx", "comtypes", "win32", "libre", "office", "pdf"]):
        print(line)
