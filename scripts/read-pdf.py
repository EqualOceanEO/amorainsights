import pdfplumber
import sys

pdf_path = r"C:\Users\51229\Desktop\中国储能企业出海中东研究报告2025 .pdf"

try:
    with pdfplumber.open(pdf_path) as pdf:
        print(f"总页数: {len(pdf.pages)}\n")

        full_text = ""
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                full_text += f"\n{'='*60}\n第 {i+1} 页\n{'='*60}\n"
                full_text += text

        print(full_text)
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
