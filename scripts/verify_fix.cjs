// Verify humanoid robot companies - with retry
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc';
const SUPABASE_URL = 'https://jqppcuccqkxhhrvndsil.supabase.co';

async function rpcQuery(sql, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/run_migration`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql_text: sql }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      return await res.json();
    } catch (e) {
      console.log(`  Attempt ${i+1} failed: ${e.message}`);
      if (i < retries - 1) await new Promise(r => setTimeout(r, 3000));
    }
  }
  return null;
}

async function main() {
  // Warm up: make a simple request first
  console.log('Warming up connection...');
  await rpcQuery('SELECT 1');
  await new Promise(r => setTimeout(r, 2000));

  console.log('\n=== Humanoid Robot Companies ===\n');
  
  const sql = `SELECT id, name, name_cn, country,
    amora_total_score AS total,
    amora_advancement_score AS adv,
    amora_mastery_score AS mas,
    amora_operations_score AS ops,
    amora_reach_score AS reach,
    amora_affinity_score AS aff
  FROM companies
  WHERE sub_sector = 'Humanoid Robots'
  ORDER BY amora_total_score DESC NULLS LAST`;
  
  const result = await rpcQuery(sql);
  if (result && result.length !== undefined) {
    console.log(`${'ID'.padEnd(4)} ${'Name'.padEnd(22)} ${'CN'.padEnd(12)} ${'CT'}  Total  Adv   Mas   Ops   Reach Aff`);
    console.log('-'.repeat(85));
    for (const c of result) {
      console.log(
        `${String(c.id).padEnd(4)} ${(c.name||'').substring(0,20).padEnd(22)} ` +
        `${(c.name_cn||'').substring(0,10).padEnd(12)} ${(c.country||'').padEnd(3)} ` +
        `${String(c.total||'?').padEnd(7)} ${String(c.adv||'?').padEnd(5)} ${String(c.mas||'?').padEnd(5)} ${String(c.ops||'?').padEnd(5)} ${String(c.reach||'?').padEnd(6)} ${c.aff||'?'}`
      );
    }
    console.log(`\n✅ Total: ${result.length} companies`);
  } else {
    console.log('Result:', JSON.stringify(result).substring(0, 200));
  }
}

main().catch(console.error);
