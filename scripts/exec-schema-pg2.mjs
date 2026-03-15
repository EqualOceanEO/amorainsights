/**
 * Execute schema via direct PostgreSQL connection
 * Uses the Supabase connection pooler URL (port 6543) or direct (5432)
 */
import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

config({ path: '.env' });

const require = createRequire(import.meta.url);
const { Client } = require('pg');
const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

// Try multiple connection strings
const connStrings = [
  process.env.POSTGRES_URL,
  // Supabase pooler (transaction mode, port 6543)
  process.env.POSTGRES_URL?.replace(':5432/', ':6543/'),
  // Supabase pooler with ?pgbouncer=true
  process.env.POSTGRES_URL + '?pgbouncer=true',
];

for (const connStr of connStrings) {
  if (!connStr) continue;
  const display = connStr.replace(/:([^:@]+)@/, ':***@');
  console.log(`\nTrying: ${display}`);
  
  const client = new Client({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });
  
  try {
    await client.connect();
    console.log('✅ Connected!');
    await client.query(sql);
    console.log('✅ Schema executed!');
    
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('reports', 'news_items', 'companies', 'industries')
      ORDER BY table_name;
    `);
    console.log('Tables:', res.rows.map(r => r.table_name).join(', '));
    await client.end();
    break;
  } catch (err) {
    console.log('❌', err.message);
    try { await client.end(); } catch {}
  }
}
