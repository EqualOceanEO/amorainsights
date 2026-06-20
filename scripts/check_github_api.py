import urllib.request, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

try:
    req = urllib.request.Request('https://api.github.com')
    r = urllib.request.urlopen(req, timeout=8)
    print('api.github.com: OK', r.status)
except Exception as e:
    print('api.github.com: FAIL', e)

try:
    req = urllib.request.Request('https://github.com')
    r = urllib.request.urlopen(req, timeout=8)
    print('github.com: OK', r.status)
except Exception as e:
    print('github.com: FAIL', e)
