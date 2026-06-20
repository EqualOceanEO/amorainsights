/**
 * Create tables via Supabase REST API by using the rpc endpoint
 * Supabase exposes a pg_meta HTTP API at /pg/
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

// Try pg_meta endpoint (available on self-hosted Supabase, not cloud)
// For cloud Supabase, try the /rest/v1/ approach with a custom SQL function

// First, let's create a temporary exec_sql function via PostgREST
// We'll use the SQL API endpoint: /rest/v1/rpc/exec_sql

async function tryRPC(sqlStr) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ sql: sqlStr }),
  });
  return { status: res.status, body: await res.text() };
}

// The Supabase dashboard uses /pg/query for cloud projects
// Let's try the undocumented pg endpoint
async function tryPgQuery(sqlStr) {
  const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
  const endpoints = [
    `https://${projectRef}.supabase.co/pg/query`,
    `${SUPABASE_URL}/pg/query`,
  ];
  
  for (const url of endpoints) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sqlStr }),
    });
    console.log(`  ${url}: ${res.status}`);
    const body = await res.text();
    if (res.status !== 404) console.log(' ', body.slice(0, 200));
  }
}

console.log('Testing RPC exec_sql...');
const rpcResult = await tryRPC('SELECT 1');
console.log('RPC result:', rpcResult.status, rpcResult.body.slice(0, 200));

console.log('\nTesting pg query endpoints...');
await tryPgQuery('SELECT 1');
