import urllib.request, json

url = "https://jqppcuccqkxhhrvndsil.supabase.co/rest/v1/reports?id=eq.44&select=id,report_format"
req = urllib.request.Request(url)
req.add_header("apikey", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc")

try:
    r = urllib.request.urlopen(req, timeout=8)
    data = json.loads(r.read())
    print("OK:", data)
except Exception as e:
    print("FAIL:", e)
