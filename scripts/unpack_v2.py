"""
Proper PPTX modification: unpack v2, add new slide XMLs, repack.
This preserves all original charts and media.
"""
import zipfile, os, shutil, re
from pathlib import Path

V2_PATH = r"C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v2.pptx"
OUT_PATH = r"C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v3.pptx"
UNPACK_DIR = r"C:\Users\51229\WorkBuddy\Claw\unpacked_pptx"

# Clean
if os.path.exists(UNPACK_DIR):
    shutil.rmtree(UNPACK_DIR)

# Unpack v2
with zipfile.ZipFile(V2_PATH, 'r') as z:
    z.extractall(UNPACK_DIR)
    all_names = z.namelist()

print(f"Unpacked {len(all_names)} entries")

# Check existing slides
slide_files = sorted([n for n in all_names if re.match(r'ppt/slides/slide\d+\.xml', n)])
print(f"Existing slides: {slide_files}")

# Check slide layouts
layouts = sorted([n for n in all_names if re.match(r'ppt/slideLayouts/slideLayout\d+\.xml', n)])
print(f"Slide layouts: {len(layouts)}")

# Check presentation.xml for slide order
pres_xml_path = os.path.join(UNPACK_DIR, 'ppt', 'presentation.xml')
with open(pres_xml_path, 'r', encoding='utf-8') as f:
    pres_content = f.read()
# Find sldIdLst
sldid_match = re.search(r'<p:sldIdLst>(.*?)</p:sldIdLst>', pres_content, re.DOTALL)
if sldid_match:
    print(f"sldIdLst found, length: {len(sldid_match.group(1))}")
    # Count entries
    entries = re.findall(r'<p:sldId', sldid_match.group(1))
    print(f"Slide entries in sldIdLst: {len(entries)}")

print("Unpack complete. Now need to create slide XMLs.")
