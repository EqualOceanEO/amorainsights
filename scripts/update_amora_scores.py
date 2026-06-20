# -*- coding: utf-8 -*-
import urllib.request
import json
import time

SUPABASE_URL = 'https://jqppcuccqkxhhrvndsil.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc'

headers = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

body = {
    'amora_total_score': 6.30,
    'amora_advancement_score': 6.5,
    'amora_mastery_score': 7.0,
    'amora_operations_score': 6.5,
    'amora_reach_score': 6.0,
    'amora_affinity_score': 5.5,
}

url = f'{SUPABASE_URL}/rest/v1/companies?id=eq.365'
req = urllib.request.Request(
    url,
    data=json.dumps(body).encode('utf-8'),
    headers=headers,
    method='PATCH'
)

time.sleep(1)
try:
    resp = urllib.request.urlopen(req, timeout=15)
    print(f'OK: Robotera updated - Status {resp.status}')
except Exception as e:
    print(f'Failed: {e}')
