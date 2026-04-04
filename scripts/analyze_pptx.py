import zipfile

pptx = r"C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v2.pptx"

with zipfile.ZipFile(pptx, 'r') as zf:
    names = zf.namelist()
    print(f"Total entries: {len(names)}")

    # Check for potentially problematic entries
    for name in names:
        if 'chart' in name.lower() or 'drawing' in name.lower() or 'image' in name.lower() or 'media' in name.lower():
            info = zf.getinfo(name)
            print(f"  {name} ({info.file_size:,} bytes)")

    # Check for SVG
    svgs = [n for n in names if n.endswith('.svg')]
    print(f"\nSVG files: {len(svgs)}")
    for s in svgs[:5]:
        print(f"  {s}")

    # Check for EMF/WMF
    emfs = [n for n in names if n.endswith('.emf') or n.endswith('.wmf')]
    print(f"\nEMF/WMF files: {len(emfs)}")

    # Check for binary OLE objects
    bins = [n for n in names if 'ole' in n.lower() or 'binary' in n.lower()]
    print(f"\nBinary/OLE: {bins[:5]}")

    # Check presentation.xml for special settings
    try:
        content = zf.read('ppt/presentation.xml').decode('utf-8')
        print(f"\npresentation.xml size: {len(content):,}")
        # Look for special elements
        if 'extUri' in content:
            print("Contains extension URIs")
        if '14' in content:  # OOXML extensions
            print("Contains OOXML extensions")
    except:
        print("Could not read presentation.xml")
