// Query humanoid robot companies to check current state
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc';
const SUPABASE_URL = 'https://jqppcuccqkxhhrvndsil.supabase.co';

async function query(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/run_migration`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql_text: sql })
  });
  return { ok: res.ok, status: res.status, data: await res.text() };
}

async function main() {
  // Check Tesla Optimus (id=182)
  console.log('--- Tesla Optimus (id=182) ---');
  const t182 = await query("SELECT id, name, amora_total_score FROM companies WHERE id = 182");
  console.log(JSON.parse(t182.data));

  // Check if id 185, 186 exist
  console.log('\n--- Check id 185, 186, 361 ---');
  const check = await query("SELECT id, name FROM companies WHERE id IN (185, 186, 361)");
  console.log(JSON.parse(check.data));

  // List all humanoid robot companies
  console.log('\n--- All Humanoid Robot companies ---');
  const list = await query("SELECT id, name, name_cn, country, amora_total_score FROM companies WHERE sub_sector = 'Humanoid Robots' ORDER BY amora_total_score DESC NULLS LAST");
  console.log(JSON.parse(list.data));
}

main().catch(console.error);
