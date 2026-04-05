import zipfile, os

UNPACKED = r'C:\Users\51229\WorkBuddy\Claw\unpacked_pptx'

for slide_num in [24, 25]:
    fpath = os.path.join(UNPACKED, 'ppt', 'slides', 'slide%d.xml' % slide_num)
    with open(fpath, encoding='utf-8') as f:
        content = f.read()
    print('slide%d content length: %d' % (slide_num, len(content)))
    # Show around column 15139 / 16639
    col = 15139 if slide_num == 24 else 16639
    start = max(0, col - 200)
    end = min(len(content), col + 200)
    print('Around col %d:' % col)
    print(repr(content[start:end]))
    print()
