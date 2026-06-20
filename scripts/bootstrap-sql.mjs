/**
 * Execute DDL via PostgREST 12+ raw SQL feature
 * POST /rest/v1/ with Content-Type: application/sql
 */
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

config({ path: '.env' });

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Try PostgREST raw SQL endpoint
async function execSQL(sqlStr, description) {
  console.log(`\nExecuting: ${description}`);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/sql',
      'Prefer': 'return=minimal',
    },
    body: sqlStr,
  });
  const body = await res.text();
  if (res.status >= 200 && res.status < 300) {
    console.log(`  ✅ Status: ${res.status}`);
  } else {
    console.log(`  ❌ Status: ${res.status} — ${body.slice(0, 200)}`);
  }
  return res.status;
}

// Step 1: Create exec_sql bootstrap function using raw SQL
const bootstrapFn = `
CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void
  LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  EXECUTE sql;
END;
$$;
`;

await execSQL(bootstrapFn, 'Create exec_sql bootstrap function');

// Step 2: Try running schema via RPC
console.log('\nTrying via RPC exec_sql...');
const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ sql: 'SELECT 1 as test' }),
});
console.log('RPC status:', rpcRes.status, (await rpcRes.text()).slice(0, 200));
