import zipfile

pptx = r"C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v2.pptx"

with zipfile.ZipFile(pptx, 'r') as zf:
    # Check presentation.xml.rels
    print("--- ppt/_rels/presentation.xml.rels ---")
    content = zf.read('ppt/_rels/presentation.xml.rels').decode('utf-8')
    print(content[:3000])

    # Check a slide rels file
    print("\n--- ppt/slides/_rels/slide1.xml.rels ---")
    content = zf.read('ppt/slides/_rels/slide1.xml.rels').decode('utf-8')
    print(content)

    print("\n--- ppt/slides/slide1.xml (first 2000 chars) ---")
    content = zf.read('ppt/slides/slide1.xml').decode('utf-8')
    print(content[:2000])

    print("\n--- ppt/theme/theme1.xml (first 1000 chars) ---")
    content = zf.read('ppt/theme/theme1.xml').decode('utf-8')
    print(content[:1000])
