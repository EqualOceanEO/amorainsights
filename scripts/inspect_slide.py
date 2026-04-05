import os, re

UNPACK_DIR = r"C:\Users\51229\WorkBuddy\Claw\unpacked_pptx"

# Read slide1 structure
slide1 = os.path.join(UNPACK_DIR, 'ppt', 'slides', 'slide1.xml')
with open(slide1, 'r', encoding='utf-8') as f:
    content = f.read()

# Find spTree content
print(f"slide1.xml size: {len(content)} bytes")

# Count shapes
sp_count = len(re.findall(r'<p:sp>', content))
print(f"Shapes in slide1: {sp_count}")

# Check background
if '<p:bg>' in content:
    print("Has background element")
    bg_match = re.search(r'<p:bg>(.*?)</p:bg>', content, re.DOTALL)
    if bg_match:
        print(f"BG sample: {bg_match.group(1)[:200]}")
else:
    print("No explicit background (uses slide master)")

# Check slide relationships
rels_path = os.path.join(UNPACK_DIR, 'ppt', 'slides', '_rels', 'slide1.xml.rels')
with open(rels_path, 'r', encoding='utf-8') as f:
    rels_content = f.read()
print(f"\nSlide1 rels: {rels_content[:500]}")

# Check presentation.xml for slide references
pres_path = os.path.join(UNPACK_DIR, 'ppt', 'presentation.xml')
with open(pres_path, 'r', encoding='utf-8') as f:
    pres = f.read()
sldid = re.search(r'<p:sldIdLst>(.*?)</p:sldIdLst>', pres, re.DOTALL)
if sldid:
    print(f"\nSlide ID list (first 800 chars):\n{sldid.group(1)[:800]}")

# Check [Content_Types].xml for slide entries
ct_path = os.path.join(UNPACK_DIR, '[Content_Types].xml')
with open(ct_path, 'r', encoding='utf-8') as f:
    ct = f.read()
slide_ct = re.findall(r'PartName="/ppt/slides/slide\d+\.xml"', ct)
print(f"\n[Content_Types] slide entries: {len(slide_ct)}")
print("Content_Types sample:")
ct_match = re.search(r'<Override PartName="/ppt/slides/[^"]+\.xml"[^/]*/>', ct)
if ct_match:
    print(ct_match.group(0))
