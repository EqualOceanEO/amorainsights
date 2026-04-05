"""Final verification of HRI-2026-Report-Presentation-v3.pptx"""
import zipfile, os, re, xml.etree.ElementTree as ET, sys

V3 = r'C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v3.pptx'
size = os.path.getsize(V3)
print('File: HRI-2026-Report-Presentation-v3.pptx')
print('Size: %.1f KB' % (size/1024))
print()

with zipfile.ZipFile(V3) as z:
    slides = sorted([n for n in z.namelist() if '/slides/slide' in n and n.endswith('.xml')])
    print('Total slides: %d' % len(slides))

    # Verify XML validity
    errors = []
    for s in slides:
        try:
            ET.fromstring(z.read(s))
        except ET.ParseError as e:
            errors.append((s, str(e)[:80]))

    if errors:
        print('XML ERRORS:')
        for s, e in errors:
            print('  %s: %s' % (s, e))
    else:
        print('All %d slides: STRICT XML VALID' % len(slides))

    # Check slide order and titles
    pres = z.read('ppt/presentation.xml').decode('utf-8')
    rels = z.read('ppt/_rels/presentation.xml.rels').decode('utf-8')

    rid_map = {}
    for m in re.finditer(r'Id="(rId\d+)"[^>]+Target="(slides/slide\d+\.xml)"', rels):
        rid_map[m.group(1)] = m.group(2)

    sld_ids = re.findall(r'<p:sldId id="\d+" r:id="(rId\d+)"', pres)
    print()
    print('Slide Order (%d slides):' % len(sld_ids))
    for i, rid in enumerate(sld_ids):
        fname = rid_map.get(rid, '?')
        texts = re.findall(r'<a:t>([^<]{4,})</a:t>', z.read(fname).decode('utf-8', 'replace'))
        title = next((t.strip() for t in texts if len(t.strip()) > 5), '?')
        print('  %2d. %-25s  [%s]' % (i + 1, fname, title[:65]))

print()
print('=== VERIFICATION COMPLETE ===')
