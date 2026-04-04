import zipfile

pptx = r"C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v2.pptx"

with zipfile.ZipFile(pptx, 'r') as zf:
    names = zf.namelist()

    # All files with sizes
    for name in names:
        info = zf.getinfo(name)
        if info.file_size > 0:
            print(f"  {name}: {info.file_size:,}")

    print("\n--- presentation.xml ---")
    try:
        content = zf.read('ppt/presentation.xml').decode('utf-8')
        print(content[:3000])
    except Exception as e:
        print(f"Error: {e}")
