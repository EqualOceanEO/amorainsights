import zipfile, re

V3 = r'C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v3.pptx'

with zipfile.ZipFile(V3) as z:
    # presentation.xml - slide order
    pres = z.read('ppt/presentation.xml').decode('utf-8')
    sld_ids = re.findall(r'<p:sldId id="(\d+)" r:id="(rId\d+)"', pres)
    print('Slide order in presentation.xml (%d slides):' % len(sld_ids))
    for i,(sid,rid) in enumerate(sld_ids):
        print('  Position %d: id=%s rId=%s' % (i+1, sid, rid))

    print()
    # presentation.xml.rels - rId to slide file mapping
    rels = z.read('ppt/_rels/presentation.xml.rels').decode('utf-8')
    mappings = re.findall(r'Id="(rId\d+)" Type="[^"]*slide[^"]*" Target="(slides/slide\d+\.xml)"', rels)
    print('rId -> slide file mappings:')
    for rid, target in sorted(mappings, key=lambda x:int(re.search(r'\d+',x[0]).group())):
        print('  %s -> %s' % (rid, target))

    print()
    # Get slide titles to verify content
    def get_title(z, name):
        xml = z.read(name).decode('utf-8', errors='replace')
        texts = re.findall(r'<a:t>([^<]+)</a:t>', xml)
        return [t.strip() for t in texts if t.strip() and len(t.strip()) > 2][:5]

    print('Slide content (first texts):')
    for i,(sid,rid) in enumerate(sld_ids):
        mapping = next((m for m in mappings if m[0]==rid), None)
        if mapping:
            fname = 'ppt/' + mapping[1]
            texts = get_title(z, fname)
            safe_texts = [t.encode('ascii','replace').decode('ascii')[:60] for t in texts]
            print('  Position %d: %s -> %s' % (i+1, rid, ' / '.join(safe_texts[:3])))
