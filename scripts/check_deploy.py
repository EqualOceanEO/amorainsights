import urllib.request, sys, re
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

try:
    r = urllib.request.urlopen('https://amorainsights.vercel.app/reports/humanoid-robotics-intelligence-2026', timeout=15)
    html = r.read(5000).decode('utf-8', 'replace')
    print('Status:', r.status)
    print('Has h5-report-content:', 'h5-report-content' in html)
    print('Has CoverPage:', 'CoverPage' in html)
    print('Has Chapter:', 'chapter' in html.lower())
    print('Body size:', len(html))
    scripts = re.findall(r'script src="([^"]+)"', html)
    print('Scripts:', scripts[:5])
except Exception as e:
    print('Error:', e)
