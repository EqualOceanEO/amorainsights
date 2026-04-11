import urllib.request, sys, time
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

print('Polling for Vercel deployment...')
for i in range(30):
    time.sleep(10)
    try:
        r = urllib.request.urlopen('https://amorainsights.vercel.app/api/hri-chapters/m', timeout=15)
        body = r.read(300).decode('utf-8', 'replace')
        hri_access = r.headers.get('X-HRI-Access', 'N/A')
        print('DEPLOYED! Status: %d X-HRI-Access: %s' % (r.status, hri_access))
        print('Preview:', body[:200])
        break
    except urllib.error.HTTPError as e:
        print('[%d] %s' % (i+1, e.code))
    except Exception as e:
        print('[%d] Error: %s' % (i+1, str(e)[:50]))
else:
    print('TIMED OUT after 5 minutes - checking old site...')
    try:
        r2 = urllib.request.urlopen('https://amorainsights.vercel.app/', timeout=10)
        print('Old site status: %d' % r2.status)
    except Exception as e2:
        print('Old site error: %s' % str(e2)[:80])
