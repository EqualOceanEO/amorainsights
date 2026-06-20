const url = 'https://jqppcuccqkxhhrvndsil.supabase.co/rest/v1/';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc';

try {
  const r = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  console.log('HTTP', r.status, r.statusText);
  const body = await r.text();
  console.log(body.slice(0, 200));
} catch (e) {
  console.error('FAIL:', e.message);
}
