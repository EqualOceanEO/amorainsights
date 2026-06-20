import sys
print("Python version:", sys.version)

try:
    from markitdown import MarkItDown
    print("markitdown imported successfully")
    
    md = MarkItDown()
    print("MarkItDown initialized")
    
    pdf_path = r"C:\Users\51229\Desktop\中国储能企业出海中东研究报告2025 .pdf"
    print(f"Converting: {pdf_path}")
    
    result = md.convert(pdf_path)
    print(f"Conversion complete. Characters: {len(result.text_content)}")
    
    output_path = r"C:\Users\51229\WorkBuddy\Claw\pdf_content.md"
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(result.text_content)
    print(f"Saved to: {output_path}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
