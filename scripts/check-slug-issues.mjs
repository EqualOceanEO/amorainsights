// 检查 null slug 和重复 slug
const url = 'https://jqppcuccqkxhhrvndsil.supabase.co/rest/v1/companies?select=id,name,slug&order=slug';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc';
const res = await fetch(url, { headers: { apikey: key, Authorization: 'Bearer ' + key } });
const data = await res.json();

// null slugs
const nulls = data.filter(c => !c.slug);
console.log('Null slugs:', nulls.length);
nulls.forEach(c => console.log('  ', c.id, c.name));

// duplicate slugs
const counts = {};
data.forEach(c => { if (c.slug) counts[c.slug] = (counts[c.slug] || 0) + 1; });
const dups = Object.entries(counts).filter(([, v]) => v > 1);
console.log('\nDuplicate slugs:', dups.length);
dups.forEach(([slug, count]) => {
  const companies = data.filter(c => c.slug === slug);
  console.log(`  "${slug}" x${count}:`, companies.map(c => `${c.id}:${c.name}`).join(', '));
});
