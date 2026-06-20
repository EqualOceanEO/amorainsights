// Retry DELETE statements
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc';
const SUPABASE_URL = 'https://jqppcuccqkxhhrvndsil.supabase.co';

async function runSql(sql, retries = 5) {
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
      const text = await res.text();
      return { ok: res.ok, status: res.status, data: text };
    } catch (e) {
      console.log(`  Attempt ${i+1} failed: ${e.message}`);
      if (i < retries - 1) await new Promise(r => setTimeout(r, 3000));
    }
  }
  return null;
}

async function main() {
  const deletes = [
    "DELETE FROM companies WHERE id = 185",
    "DELETE FROM companies WHERE id = 186"
  ];
  for (const sql of deletes) {
    process.stdout.write(`${sql}... `);
    const result = await runSql(sql);
    if (result && result.ok) {
      console.log(`✅ OK: ${result.data}`);
    } else if (result) {
      console.log(`❌ Error (${result.status}): ${result.data}`);
    } else {
      console.log(`❌ All retries failed`);
    }
  }
}

main();
