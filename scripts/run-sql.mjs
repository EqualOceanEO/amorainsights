#!/usr/bin/env node
// run-sql.mjs — Execute SQL against Supabase via Management API or psql
// Usage: node scripts/run-sql.mjs <sql-file>

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jqppcuccqkxhhrvndsil.supabase.co';
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/run-sql.mjs <sql-file>');
  process.exit(1);
}

const sql = readFileSync(file, 'utf8');
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

const { data, error } = await supabase.rpc('exec_sql', { query: sql });
if (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
console.log('Done:', data);
