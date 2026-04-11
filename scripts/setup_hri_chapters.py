"""Setup HRI chapters: add column + upload 5 HTML chapters to DB."""
import urllib.request, urllib.error, json, os
from pathlib import Path

PROJECT_ID = 'jqppcuccqkxhhrvndsil'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc'

BASE_DIR = Path(r'C:\Users\51229\WorkBuddy\Claw\public')

def rpc(sql: str) -> dict:
    """Run DDL via run_migration RPC."""
    url = f'https://{PROJECT_ID}.supabase.co/rest/v1/rpc/run_migration'
    payload = json.dumps({'sql_text': sql}).encode()
    req = urllib.request.Request(url, data=payload, method='POST')
    req.add_header('Content-Type', 'application/json')
    req.add_header('apikey', SERVICE_KEY)
    req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return {'ok': True, 'body': r.read().decode()}
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:300]
        return {'ok': False, 'error': body}

def patch(table: str, id_val: int, data: dict) -> dict:
    """PATCH a row by id."""
    url = f'https://{PROJECT_ID}.supabase.co/rest/v1/{table}?id=eq.{id_val}'
    payload = json.dumps(data).encode()
    req = urllib.request.Request(url, data=payload, method='PATCH')
    req.add_header('Content-Type', 'application/json')
    req.add_header('apikey', SERVICE_KEY)
    req.add_header('Authorization', f'Bearer {SERVICE_KEY}')
    req.add_header('Prefer', 'return=minimal')
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return {'ok': True, 'status': r.status}
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:300]
        return {'ok': False, 'error': body}

def main():
    import sys
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

    # Step 1: Add column
    print('Step 1: Adding chapters_json column...')
    result = rpc("ALTER TABLE reports ADD COLUMN IF NOT EXISTS chapters_json JSONB DEFAULT '{}'::jsonb;")
    if result['ok']:
        print('  ✓ Column added (or already exists)')
    else:
        err = result.get('error', '')
        if 'already exists' in err.lower() or 'duplicate' in err.lower():
            print('  ✓ Column already exists')
        else:
            print(f'  ✗ Error: {err[:200]}')

    # Step 2: Read HTML files
    print('\nStep 2: Reading chapter HTML files...')
    chapter_defs = [
        ('m',  'hri-report-part-m-mapping-v3.html',     True),
        ('a',  'hri-report-part-a-advancement-v1.html',  False),
        ('o',  'hri-report-part-o-operations-v1.html',   False),
        ('r',  'hri-report-part-r-reach-v1.html',        False),
        ('a2', 'hri-report-part-a2-assets-v1.html',      False),
    ]

    chapters = {}
    total = 0
    for key, fname, free in chapter_defs:
        fpath = BASE_DIR / fname
        if fpath.exists():
            html = fpath.read_text(encoding='utf-8')
            chapters[key] = {'html': html, 'free': free}
            total += len(html)
            print(f'  ✓ {key}: {(len(html)/1024):.0f} KB')
        else:
            print(f'  ✗ Missing: {fname}')

    print(f'  Total: {(total/1024):.0f} KB, {len(chapters)} chapters')

    # Step 3: Upload to DB
    print('\nStep 3: Uploading to reports table (id=44)...')
    result = patch('reports', 44, {
        'chapters_json': chapters,
        'is_premium': True,
    })
    if result['ok']:
        print('  ✓ Upload complete!')
    else:
        print(f'  ✗ Error: {result.get("error", "")}')

    print('\n✅ Done!')

if __name__ == '__main__':
    main()
