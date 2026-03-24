from markitdown import MarkItDown

md = MarkItDown()
result = md.convert(r"C:\Users\51229\Desktop\中国储能企业出海中东研究报告2025 .pdf")

with open(r"C:\Users\51229\WorkBuddy\Claw\pdf_content.md", 'w', encoding='utf-8') as f:
    f.write(result.text_content)

print(f"Conversion complete. Characters: {len(result.text_content)}")
