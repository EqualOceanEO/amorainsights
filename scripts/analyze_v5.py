import os
import sys
sys.stdout.reconfigure(encoding='utf-8')

path = 'HRI-2026-AMORA-Report-v5.0.html'
size = os.path.getsize(path)
print(f'File size: {size:,} bytes ({size/1024:.0f} KB)')

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
print(f'Line count: {len(lines)}')

# Count paywall remnants
count = sum(1 for l in lines if any(k in l for k in ['paywall-title', 'paywall-desc', 'paywall-feature', 'paywall-price', 'paywall-cta', 'paywall-badge']))
print(f'Paywall remnants: {count} lines')

# Show section markers
print('\nSection markers:')
for i, l in enumerate(lines):
    if '<section id=' in l or ('<div class="section-tag">' in l and 'Part' in l):
        print(f'  Line {i+1}: {l.strip()[:100]}')
