$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$pythonScript = @"
import pdfplumber
import sys

pdf_path = r'C:\Users\51229\Desktop\中国储能企业出海中东研究报告2025 .pdf'
output_path = r'C:\Users\51229\WorkBuddy\Claw\pdf_content.txt'

try:
    with pdfplumber.open(pdf_path) as pdf:
        print(f'Total pages: {len(pdf.pages)}')
        full_text = ''
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                full_text += f'\n=== Page {i+1} ===\n'
                full_text += text
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(full_text)
        print(f'Saved {len(full_text)} characters to {output_path}')
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
"@

$pythonScript | python.exe
