import zipfile, os
from lxml import etree

V3 = r'C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v3.pptx'
parser = etree.XMLParser(recover=True)
errors = []

for n in range(1, 28):
    fname = 'ppt/slides/slide%d.xml' % n
    try:
        with zipfile.ZipFile(V3) as z:
            content = z.read(fname)
        tree = etree.fromstring(content, parser)
        print('slide%d: VALID' % n)
    except Exception as e:
        print('slide%d: ERROR - %s' % (n, e))
        errors.append(n)

print()
print('Total errors:', len(errors))
if not errors:
    print('ALL 27 SLIDES VALID!')
else:
    print('Broken slides:', errors)
