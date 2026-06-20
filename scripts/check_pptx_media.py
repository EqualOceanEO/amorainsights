import zipfile, os

def check_pptx(path):
    size = os.path.getsize(path)
    with zipfile.ZipFile(path) as z:
        names = z.namelist()
        media = [n for n in names if 'media' in n.lower() or 'image' in n.lower()]
        slides = [n for n in names if n.startswith('ppt/slides/slide') and n.endswith('.xml')]
        charts = [n for n in names if 'chart' in n.lower()]
        print(f"Size: {size/1024:.1f} KB, Slides: {len(slides)}, Media: {len(media)}, Charts: {len(charts)}")
        if media:
            print(f"Media: {media[:8]}")

check_pptx(r"C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v2.pptx")
check_pptx(r"C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v3.pptx")
