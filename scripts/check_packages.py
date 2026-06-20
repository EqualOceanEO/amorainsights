import subprocess
import sys

result = subprocess.run([sys.executable, "-m", "pip", "list"], capture_output=True, text=True)
lines = result.stdout.split("\n")
keywords = ["pptx", "comtypes", "win32", "pdf", "reportlab", "pillow", "pil", "pymupdf", "fitz", "pdfkit", "weasyprint", "fpdf", "cairosvg"]
for line in lines:
    low = line.lower()
    if any(k in low for k in keywords):
        print(line)
print("---checking pdf---")
for line in lines:
    low = line.lower()
    if "pdf" in low or "image" in low or "render" in low:
        print(line)
