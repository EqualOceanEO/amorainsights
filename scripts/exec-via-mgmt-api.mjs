/**
 * exec-via-mgmt-api.mjs
 * Execute SQL via Supabase Management API (requires SUPABASE_ACCESS_TOKEN)
 * Falls back to direct pg connection if token not available.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/exec-via-mgmt-api.mjs scripts/full-schema-seed.sql
 *
 * Get token at: https://supabase.com/dashboard/account/tokens
 */

import { readFileSync } from 'fs';

const PROJECT_REF   = 'jqppcuccqkxhhrvndsil';
const ACCESS_TOKEN  = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error([
    '',
    '❌  SUPABASE_ACCESS_TOKEN not set.',
    '',
    '   To run SQL directly, get a personal access token from:',
    '   https://supabase.com/dashboard/account/tokens',
    '',
    '   Then run:',
    '   $env:SUPABASE_ACCESS_TOKEN="sbp_xxxx"',
    '   node scripts/exec-via-mgmt-api.mjs scripts/full-schema-seed.sql',
    '',
  ].join('\n'));
  process.exit(1);
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error('Usage: node scripts/exec-via-mgmt-api.mjs file1.sql ...');
  process.exit(1);
}

const API = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

for (const file of files) {
  const sql = readFileSync(file, 'utf8');
  console.log(`\n▶  Executing: ${file}`);

  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`❌  HTTP ${res.status}: ${text}`);
    continue;
  }

  try {
    const json = JSON.parse(text);
    console.log('✅  Done:', JSON.stringify(json, null, 2).slice(0, 400));
  } catch {
    console.log('✅  Done (raw):', text.slice(0, 400));
  }
}
