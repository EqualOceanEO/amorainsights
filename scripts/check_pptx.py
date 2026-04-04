import sys
python_exe = r"C:\Users\51229\.workbuddy\binaries\python\versions\3.13.12\python.exe"

# Check for pptx
try:
    import pptx
    print(f"python-pptx available: {pptx.__version__}")
except ImportError:
    print("python-pptx NOT available")

# Check for pymupdf
try:
    import fitz
    print(f"PyMuPDF available: {fitz.__version__}")
except ImportError:
    print("PyMuPDF NOT available")

# Check for reportlab
try:
    import reportlab
    print(f"reportlab available: {reportlab.Version}")
except ImportError:
    print("reportlab NOT available")
