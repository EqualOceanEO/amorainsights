import urllib.request, json

SUPABASE_URL = 'https://jqppcuccqkxhhrvndsil.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc'

# First, get ALL companies and check columns
url = f'{SUPABASE_URL}/rest/v1/companies?select=*&limit=3&apikey={SERVICE_KEY}'
req = urllib.request.Request(url, headers={'apikey': SERVICE_KEY, 'Authorization': f'Bearer {SERVICE_KEY}'})
resp = urllib.request.urlopen(req)
data = json.loads(resp.read())
if data:
    print('Available columns:', list(data[0].keys()))
    print()
    print('Sample:', json.dumps(data[0], ensure_ascii=False, indent=2)[:2000])

# Count all companies
url2 = f'{SUPABASE_URL}/rest/v1/companies?select=id,name,industry_slug,amora_scores,sub_sector&limit=5&apikey={SERVICE_KEY}'
req2 = urllib.request.Request(url2, headers={'apikey': SERVICE_KEY, 'Authorization': f'Bearer {SERVICE_KEY}'})
resp2 = urllib.request.urlopen(req2)
data2 = json.loads(resp2.read())
print()
print('First 5 companies:')
for c in data2:
    print(f'  ID:{c["id"]} | name:{c.get("name")} | industry_slug:{c.get("industry_slug")} | sub_sector:{c.get("sub_sector")} | amora:{c.get("amora_scores")}')
