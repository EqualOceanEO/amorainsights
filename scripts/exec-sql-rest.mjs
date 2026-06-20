// exec-sql-rest.mjs — Execute SQL via Supabase Management API
// Supabase Management API supports running arbitrary SQL via:
// POST https://api.supabase.com/v1/projects/{ref}/database/query
// Requires a Supabase Personal Access Token (not the anon/service key)
//
// Fallback: use the pg REST wrapper approach via /rest/v1/rpc

import { readFileSync } from 'fs';

const PROJECT_REF = 'jqppcuccqkxhhrvndsil';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error('Usage: node scripts/exec-sql-rest.mjs <path-to-sql-file>');
  process.exit(1);
}

const sql = readFileSync(sqlFile, 'utf8');
console.log(`\n📄 File: ${sqlFile} (${sql.length} bytes)`);

// Try Supabase Management API (requires PAT, will fail with service key — just testing)
console.log('\n🔌 Trying Management API...');
const mgmtResp = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  },
  body: JSON.stringify({ query: sql }),
});

console.log('Management API status:', mgmtResp.status);
const mgmtBody = await mgmtResp.text();
console.log(mgmtBody.slice(0, 500));
