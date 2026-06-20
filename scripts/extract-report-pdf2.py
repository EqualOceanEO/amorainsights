import sys
import pdfplumber
import io

# Set UTF-8 encoding for stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

pdf_path = r"C:\Users\51229\Desktop\2026年中国光伏企业出海沙特深度研究报告_v3.pdf"
output_path = r"C:\Users\51229\WorkBuddy\Claw\pdf_extracted.txt"

try:
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Total pages: {len(pdf.pages)}", file=sys.stderr)
        all_text = []
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                all_text.append(f"\n===== PAGE {i+1} =====\n{text}")
        
        full_text = "\n".join(all_text)
        # Write to file with UTF-8 encoding
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(full_text)
        print(f"Extracted to: {output_path}", file=sys.stderr)
        print(full_text)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc()
