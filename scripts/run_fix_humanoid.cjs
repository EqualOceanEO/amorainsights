// Execute humanoid companies fix SQL via Supabase REST API
// Uses service_role key + run_migration RPC

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc';
const SUPABASE_URL = 'https://jqppcuccqkxhhrvndsil.supabase.co';

const statements = [
  "DELETE FROM companies WHERE id = 185",
  "DELETE FROM companies WHERE id = 186",
  "UPDATE companies SET amora_total_score = 8.9, amora_advancement_score = 8.8, amora_mastery_score = 7.8, amora_operations_score = 9.5, amora_reach_score = 8.5, amora_affinity_score = 8.2 WHERE id = 361",
  "UPDATE companies SET amora_total_score = 7.8, amora_advancement_score = 9.2, amora_mastery_score = 8.8, amora_operations_score = 4.5, amora_reach_score = 8.5, amora_affinity_score = 8.0 WHERE id = 182",
  "INSERT INTO companies (name, name_cn, country, industry_slug, sub_sector, description, founded_year, employee_count, is_public, is_tracked, amora_total_score, amora_advancement_score, amora_mastery_score, amora_operations_score, amora_reach_score, amora_affinity_score, slug) VALUES ('Sanctuary AI', 'Sanctuary AI', 'CA', 'manufacturing', 'Humanoid Robots', 'Canadian humanoid robot company developing Phoenix, a general-purpose humanoid robot with advanced cognitive AI capabilities.', 2018, 200, false, true, 6.8, 8.0, 8.5, 4.0, 5.5, 6.0, 'sanctuary-ai') ON CONFLICT (slug) DO UPDATE SET amora_total_score = EXCLUDED.amora_total_score, amora_advancement_score = EXCLUDED.amora_advancement_score, amora_mastery_score = EXCLUDED.amora_mastery_score, amora_operations_score = EXCLUDED.amora_operations_score, amora_reach_score = EXCLUDED.amora_reach_score, amora_affinity_score = EXCLUDED.amora_affinity_score"
];

async function runSql(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/run_migration`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql_text: sql })
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, data: text };
}

async function main() {
  let allOk = true;
  for (const sql of statements) {
    process.stdout.write(`Executing: ${sql.substring(0, 80)}... `);
    try {
      const result = await runSql(sql);
      if (result.ok) {
        console.log(`✅ OK: ${result.data}`);
      } else {
        console.log(`❌ Error (${result.status}): ${result.data}`);
        allOk = false;
      }
    } catch (e) {
      console.log(`❌ Exception: ${e.message}`);
      allOk = false;
    }
  }
  console.log('');
  console.log(allOk ? '✅ All SQL statements executed successfully!' : '⚠️ Some statements failed.');
}

main();
