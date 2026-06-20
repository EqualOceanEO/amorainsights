"""Final verification of HRI-2026-Report-Presentation-v3.pptx"""
import zipfile, os, re, xml.etree.ElementTree as ET

V3 = r'C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v3.pptx'
size = os.path.getsize(V3)
print('File: HRI-2026-Report-Presentation-v3.pptx')
print('Size: %.1f KB' % (size/1024))
print()

with zipfile.ZipFile(V3) as z:
    all_names = z.namelist()
    slides = sorted([n for n in all_names if re.search(r'slides?/slide\d+\.xml$', n)])
    print('Slides in zip (%d):' % len(slides))
    for s in slides:
        print(' ', s)
    print()

    # XML validity
    errors = []
    for s in slides:
        try:
            ET.fromstring(z.read(s))
        except ET.ParseError as e:
            errors.append(s)
    if not errors:
        print('ALL %d slides: STRICT XML VALID' % len(slides))
    else:
        print('ERRORS in:', errors)

    # Slide order from presentation.xml
    pres = z.read('ppt/presentation.xml').decode('utf-8')
    rels = z.read('ppt/_rels/presentation.xml.rels').decode('utf-8')
    rid_map = {}
    for m in re.finditer(r'Id="(rId\d+)" Type="[^"]+slide[^"]*" Target="(slides/slide\d+\.xml)"', rels):
        rid_map[m.group(1)] = m.group(2)
    sld_ids = re.findall(r'r:id="(rId\d+)"', pres)
    print()
    print('Slide Order:')
    for i, rid in enumerate(sld_ids):
        fname = rid_map.get(rid, '?')
        if fname != '?':
            try:
                xml_content = z.read('ppt/' + fname)
            except KeyError:
                xml_content = z.read(fname)
        else:
            xml_content = b''
        texts = re.findall(r'<a:t>([^<]{4,})</a:t>', xml_content.decode('utf-8','replace'))
        title = next((t.strip() for t in texts if len(t.strip()) > 5), '?')
        print('  %2d. %-30s  [%s]' % (i+1, fname, title[:65]))

print()
print('=== DONE ===')
