const url = 'https://jqppcuccqkxhhrvndsil.supabase.co/rest/v1/companies?select=name,slug&order=name';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc';
const res = await fetch(url, { headers: { apikey: key, Authorization: 'Bearer ' + key } });
const data = await res.json();
data.forEach(c => console.log(c.name.padEnd(30), c.slug || '(null)'));
