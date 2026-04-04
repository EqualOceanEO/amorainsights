# -*- coding: utf-8 -*-
import urllib.request
import json

SUPABASE_URL = 'https://jqppcuccqkxhhrvndsil.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc'

headers = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
}

url = f'{SUPABASE_URL}/rest/v1/companies?select=id,name,amora_total_score,amora_advancement_score,amora_mastery_score,amora_operations_score,amora_reach_score,amora_affinity_score&sub_sector=eq.Humanoid%20Robots&amora_total_score=not.is.null&order=amora_total_score.desc&limit=10'
req = urllib.request.Request(url, headers=headers)
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())
print(f'Humanoid Robot companies with AMORA scores: {len(data)}')
for c in data:
    print(f'  [{c["amora_total_score"]}] {c["name"]} - A:{c["amora_advancement_score"]} M:{c["amora_mastery_score"]} O:{c["amora_operations_score"]} R:{c["amora_reach_score"]} A:{c["amora_affinity_score"]}')
