/**
 * Bootstrap: Create exec_sql function, then run schema
 * Uses Supabase's /rest/v1/ with special headers to execute raw SQL
 */
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

config({ path: '.env' });

const __dirname = dirname(fileURLToPath(import.meta.url));
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Try different approaches to run DDL
async function post(path, body, extraHeaders = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
      ...extraHeaders,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  return { status: res.status, body: await res.text() };
}

// Check what PostgREST version we're on and what features are available
const r1 = await fetch(`${SUPABASE_URL}/rest/v1/`, {
  headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
});
console.log('PostgREST root status:', r1.status);
const rootBody = await r1.text();
console.log('Root info:', rootBody.slice(0, 300));
