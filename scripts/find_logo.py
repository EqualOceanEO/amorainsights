"""Find logo elements across all slides."""
import zipfile, re

V3 = r'C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v3.pptx'
with zipfile.ZipFile(V3) as z:
    for n in [1, 2, 3, 4, 7]:
        content = z.read('ppt/slides/slide%d.xml' % n).decode('utf-8', 'replace')
        texts = re.findall(r'<a:t>([^<]+)</a:t>', content)
        print('=== Slide %d ===' % n)
        for t in texts:
            print('  text:', repr(t))

        # Find AMORA/Insights text positions
        for m in re.finditer(r'(AMORA|Insights)', content):
            pos = m.start()
            before = content[max(0, pos-400):pos]
            # Get the closest xfrm offset
            xfrms = re.findall(r'<a:off x="(\d+)" y="(\d+)"', before)
            if xfrms:
                x, y = xfrms[-1]
                print('  -> x=%s y=%s text around: ...%s' % (x, y, repr(content[pos:pos+30])))
        print()
