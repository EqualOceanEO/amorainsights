/**
 * Execute SQL via PostgREST raw SQL endpoint
 * POST /rest/v1/  with Content-Type: application/sql
 * Requires PostgREST 12+ (Supabase rolled this out in late 2024)
 */
import { readFileSync } from 'fs';
import { config } from 'dotenv';
config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error('Usage: node scripts/exec-postgrest-sql.mjs <path-to-sql-file>');
  process.exit(1);
}

const sql = readFileSync(sqlFile, 'utf8');
console.log(`\n📄 File: ${sqlFile} (${sql.length} bytes)`);
console.log(`🔌 Endpoint: ${SUPABASE_URL}/rest/v1/\n`);

const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
  method: 'POST',
  headers: {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/sql',
    'Prefer': 'return=minimal',
  },
  body: sql,
});

const body = await res.text();
console.log(`Status: ${res.status} ${res.statusText}`);

if (res.status >= 200 && res.status < 300) {
  console.log('✅ SQL executed successfully!');
  if (body) console.log('Response:', body.slice(0, 500));
} else {
  console.log('❌ Error:', body.slice(0, 1000));
}
