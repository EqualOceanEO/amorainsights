import os, re

UNPACK_DIR = r"C:\Users\51229\WorkBuddy\Claw\unpacked_pptx"

# Check presentation.xml.rels
pres_rels = os.path.join(UNPACK_DIR, 'ppt', '_rels', 'presentation.xml.rels')
with open(pres_rels, 'r', encoding='utf-8') as f:
    pres_rels_content = f.read()
print("presentation.xml.rels:")
# Find all slide relationships
for m in re.finditer(r'Id="(rId\d+)"[^>]*Target="([^"]+)"', pres_rels_content):
    rid, target = m.group(1), m.group(2)
    if 'slide' in target.lower():
        print(f"  {rid} -> {target}")

# Check Content_Types for slide entries
ct_path = os.path.join(UNPACK_DIR, '[Content_Types].xml')
with open(ct_path, 'r', encoding='utf-8') as f:
    ct = f.read()
print("\n[Content_Types] slide entries:")
for m in re.finditer(r'<Override[^>]*PartName="/ppt/slides/([^"]+\.xml)"[^>]*/>', ct):
    print(f"  {m.group(1)}")
