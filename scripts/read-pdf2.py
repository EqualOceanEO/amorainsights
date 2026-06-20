import pdfplumber
import sys
import os

pdf_path = r"C:\Users\51229\Desktop\中国储能企业出海中东研究报告2025 .pdf"
output_path = r"C:\Users\51229\WorkBuddy\Claw\pdf_content.txt"

try:
    with pdfplumber.open(pdf_path) as pdf:
        print(f"总页数: {len(pdf.pages)}")

        full_text = ""
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                full_text += f"\n{'='*60}\n第 {i+1} 页\n{'='*60}\n"
                full_text += text

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(full_text)

        print(f"内容已保存到: {output_path}")
        print(f"总字符数: {len(full_text)}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
