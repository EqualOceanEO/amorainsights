import xml.etree.ElementTree as ET, zipfile, sys

V3 = r'C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v3.pptx'

for n in range(23, 28):
    fname = 'ppt/slides/slide%d.xml' % n
    try:
        with zipfile.ZipFile(V3) as z:
            content = z.read(fname)
        ET.fromstring(content)
        print('%s: OK' % fname)
    except ET.ParseError as e:
        print('%s: XML ERROR - %s' % (fname, e))
        text = content.decode('utf-8')
        col_no = 885
        start = max(0, col_no - 200)
        end = min(len(text), col_no + 200)
        snippet = text[start:end]
        print('Around column %d:' % col_no)
        print(repr(snippet))
        print()
