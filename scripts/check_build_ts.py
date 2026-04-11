import urllib.request, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Decode a static chunk hash to figure out build timestamp
try:
    r = urllib.request.urlopen('https://amorainsights.vercel.app/_next/static/chunks/turbopack-1d764d28d0374259.js', timeout=10)
    chunk = r.read(300).decode('utf-8', 'replace')
    print('Chunk first 300:', chunk[:300])
    # Check headers
    headers = dict(r.getheaders())
    print('Last-Modified:', headers.get('Last-Modified', 'N/A'))
    print('Date:', headers.get('Date', 'N/A'))
except Exception as e:
    print('Error:', e)
