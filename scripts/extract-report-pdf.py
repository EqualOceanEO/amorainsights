import sys
import pdfplumber

pdf_path = r"C:\Users\51229\Desktop\2026年中国光伏企业出海沙特深度研究报告_v3.pdf"

try:
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Total pages: {len(pdf.pages)}")
        for i, page in enumerate(pdf.pages):
            print(f"\n===== PAGE {i+1} =====")
            text = page.extract_text()
            if text:
                print(text)
            # Also try to extract tables
            tables = page.extract_tables()
            if tables:
                for j, table in enumerate(tables):
                    print(f"\n--- TABLE {j+1} on PAGE {i+1} ---")
                    for row in table:
                        print(row)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc()
