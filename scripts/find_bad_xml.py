import zipfile, re

V3 = r'C:\Users\51229\WorkBuddy\Claw\HRI-2026-Report-Presentation-v3.pptx'

with zipfile.ZipFile(V3) as z:
    content = z.read('ppt/slides/slide23.xml').decode('utf-8')

# Look for the problematic pattern: p:nvSpPr containing p:spPr
# Find all p:sp elements
sp_pattern = re.compile(r'<p:sp>(.*?)</p:sp>', re.DOTALL)
matches = list(sp_pattern.finditer(content))

print('Total p:sp elements:', len(matches))

# Check each for malformed nvSpPr
for i, m in enumerate(matches):
    sp_content = m.group(1)
    # Check: if there's a p:spPr inside p:nvSpPr (should be after)
    nvsppr_match = re.search(r'<p:nvSpPr>(.*?)</p:nvSpPr>', sp_content, re.DOTALL)
    if nvsppr_match:
        nvpr_content = nvsppr_match.group(1)
        if '<p:spPr>' in nvpr_content or '<p:spPr/>' in nvpr_content:
            print('FOUND BAD: p:spPr inside p:nvSpPr!')
            print('Context:')
            start = max(0, m.start() - 50)
            print(repr(sp_content[:500]))
            print('---')

# Also find the specific text a:spPr inside nvSpPr
if '<p:nvSpPr><p:cNvPr' in content:
    idx = content.index('<p:nvSpPr><p:cNvPr')
    print()
    print('Looking at nvSpPr area:')
    print(repr(content[idx:idx+400]))
