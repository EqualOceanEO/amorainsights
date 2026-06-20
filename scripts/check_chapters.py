import urllib.request
import json
import re
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SUPABASE_URL = 'https://jqppcuccqkxhhrvndsil.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc'

url = f'{SUPABASE_URL}/rest/v1/reports?id=eq.44&select=chapters_json'
req = urllib.request.Request(url, headers={'apikey': SERVICE_KEY, 'Authorization': f'Bearer {SERVICE_KEY}', 'Prefer': 'raw'})
r = urllib.request.urlopen(req, timeout=15)
data = json.loads(r.read())[0]['chapters_json']

# Extract and display content info
for key in ['m', 'a', 'o', 'r', 'a2']:
    ch = data[key]
    html = ch['html']
    # Strip tags to get text
    text = re.sub(r'<[^>]+>', ' ', html)
    text = re.sub(r'\s+', ' ', text).strip()

    cn_chars = sum(1 for c in text if '\u4e00' <= c <= '\u9fff')
    en_chars = sum(1 for c in text if 'a' <= c <= 'z' or 'A' <= c <= 'Z')
    total = cn_chars + en_chars
    pct_cn = cn_chars * 100 // max(total, 1)
    pct_en = en_chars * 100 // max(total, 1)

    print(f'=== Part {key.upper()} (free={ch["free"]}) ===')
    print(f'  Total: {len(text)} chars | CN: {cn_chars} ({pct_cn}%) | EN: {en_chars} ({pct_en}%)')
    print(f'  Preview: {text[:600]}')
    print()
