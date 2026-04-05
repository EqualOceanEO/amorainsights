# -*- coding: utf-8 -*-
import urllib.request, json

url = 'https://amorainsights.com/api/companies?page=1&pageSize=3'
req = urllib.request.Request(url)
try:
    resp = urllib.request.urlopen(req, timeout=30)
    data = json.loads(resp.read())
    print(f'Status: {resp.status}')
    if data.get('data'):
        for c in data['data'][:2]:
            score = c.get('amora_total_score')
            name = c.get('name')
            print(f'  {name}: AMORA={score}')
    print('Production site is LIVE!')
except Exception as e:
    print(f'Error: {e}')
