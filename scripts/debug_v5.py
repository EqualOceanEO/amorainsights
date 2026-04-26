import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('HRI-2026-AMORA-Report-v5.0.html', 'r', encoding='utf-8') as f:
    html = f.read()

print(f"Total file length: {len(html)} chars")

# Find actual HTML usage
idx = html.find('<div class="paywall-overlay')
print('HTML paywall-overlay at:', idx)
if idx >= 0:
    print('Context:', repr(html[idx-100:idx+300]))

# Check for the opacity div
idx2 = html.find('opacity:0.4')
print('opacity:0.4 found at:', idx2)
if idx2 >= 0:
    print('Context:', repr(html[idx2-50:idx2+150]))

# Check for section-pro-badge
idx3 = html.find('section-pro-badge')
print('section-pro-badge found at:', idx3)
if idx3 >= 0:
    print('Context:', repr(html[idx3-50:idx3+100]))
