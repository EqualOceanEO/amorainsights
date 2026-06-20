import os
import sys
sys.path.insert(0, r'C:\Users\51229\.workbuddy\binaries\python\versions\3.13.12\Lib\site-packages')

from markitdown import MarkItDown
from pathlib import Path

md = MarkItDown()
reports_dir = Path(r"c:\Users\51229\WorkBuddy\Claw\reports\humanoid-robot")
output_dir = reports_dir / "markdown"
output_dir.mkdir(exist_ok=True)

pdf_files = list(reports_dir.glob("*.pdf"))
print(f"Found {len(pdf_files)} PDF files")

for pdf_file in pdf_files:
    print(f"\nConverting: {pdf_file.name} ...")
    try:
        result = md.convert(str(pdf_file))
        text = result.text_content
        print(f"  -> {len(text)} chars")
        out_file = output_dir / (pdf_file.stem + ".md")
        out_file.write_text(text, encoding="utf-8")
        print(f"  -> Saved to {out_file.name}")
    except Exception as e:
        print(f"  -> ERROR: {e}")

print("\nDone!")
