import os, shutil, sys

src = r"C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v2.pptx"
tmp_pptx = r"C:\test_hri.pptx"
tmp_pdf = r"C:\test_hri.pdf"

# Copy to short path
shutil.copy2(src, tmp_pptx)
print(f"Copied to {tmp_pptx}")

import comtypes.client
print("Starting PowerPoint...")
ppt = comtypes.client.CreateObject("PowerPoint.Application")
ppt.Visible = 1

print("Opening presentation from short path...")
try:
    pres = ppt.Presentations.Open(tmp_pptx, WithWindow=False)
    print("Opened!")
    pres.SaveAs(tmp_pdf, 32)
    print("Saved!")
    pres.Close()
    ppt.Quit()
except Exception as e:
    print(f"ERROR: {e}")
    ppt.Quit()
    sys.exit(1)

if os.path.exists(tmp_pdf):
    print(f"SUCCESS: {os.path.getsize(tmp_pdf) / 1024 / 1024:.2f} MB")
    # Copy back
    dest = r"C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v2.pdf"
    shutil.copy2(tmp_pdf, dest)
    print(f"Copied to {dest}")
else:
    print("FAILED")
