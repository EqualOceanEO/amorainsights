"""Repack unpacked_pptx/ into a .pptx (ZIP with DEFLATE)."""
import zipfile, os

SRC = r"C:\Users\51229\WorkBuddy\Claw\unpacked_pptx"
OUT = r"C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v3.pptx"

# Build file list
all_files = []
for root, dirs, filenames in os.walk(SRC):
    for f in filenames:
        fp = os.path.join(root, f)
        rel = os.path.relpath(fp, SRC).replace(os.sep, '/')
        all_files.append((fp, rel))

all_files.sort(key=lambda x: x[1])

# Write zip
with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as zout:
    for fp, rel in all_files:
        zout.write(fp, rel)

size = os.path.getsize(OUT)
print(f"Written: {OUT}")
print(f"Size: {size/1024:.1f} KB ({len(all_files)} files)")
