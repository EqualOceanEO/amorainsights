/**
 * Try Supabase connection pooler with different hostname formats
 */
import { createRequire } from 'module';
import { config } from 'dotenv';
const require = createRequire(import.meta.url);
const { Client } = require('pg');
config({ path: '.env' });

const projectRef = 'jqppcuccqkxhhrvndsil';
const password = 'nERCb24AMq2VAMZ4';

// Supabase provides multiple connection options
const configs = [
  // Transaction pooler (port 6543)
  { host: `aws-0-ap-east-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}`, password, database: 'postgres', ssl: { rejectUnauthorized: false } },
  // Session pooler (port 5432 via pooler)  
  { host: `aws-0-ap-east-1.pooler.supabase.com`, port: 5432, user: `postgres.${projectRef}`, password, database: 'postgres', ssl: { rejectUnauthorized: false } },
  // US East pooler
  { host: `aws-0-us-east-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}`, password, database: 'postgres', ssl: { rejectUnauthorized: false } },
  { host: `aws-0-us-east-1.pooler.supabase.com`, port: 5432, user: `postgres.${projectRef}`, password, database: 'postgres', ssl: { rejectUnauthorized: false } },
  // EU West pooler
  { host: `aws-0-eu-west-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}`, password, database: 'postgres', ssl: { rejectUnauthorized: false } },
];

for (const cfg of configs) {
  const display = `${cfg.host}:${cfg.port}`;
  process.stdout.write(`Testing ${display}... `);
  const client = new Client({ ...cfg, connectionTimeoutMillis: 8000 });
  try {
    await client.connect();
    const res = await client.query('SELECT version()');
    console.log(`✅ Connected! ${res.rows[0].version.slice(0, 40)}`);
    await client.end();
    // Save the working config
    console.log('\n=== WORKING CONFIG ===');
    console.log(JSON.stringify({ ...cfg, password: '***' }, null, 2));
    process.exit(0);
  } catch (err) {
    console.log(`❌ ${err.message.slice(0, 60)}`);
    try { await client.end(); } catch {}
  }
}
console.log('\nNo working connection found.');
