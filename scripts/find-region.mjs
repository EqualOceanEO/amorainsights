/**
 * Find working Supabase pooler by trying different regions and username formats
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client } = require('pg');

const projectRef = 'jqppcuccqkxhhrvndsil';
const password = 'nERCb24AMq2VAMZ4';

// All possible Supabase pooler regions
const regions = [
  'ap-east-1',
  'ap-southeast-1', 
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-south-1',
  'us-east-1',
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-west-2',
  'eu-central-1',
  'sa-east-1',
  'ca-central-1',
];

// Username formats to try
const userFormats = [
  `postgres.${projectRef}`,
  `postgres`,
];

for (const region of regions) {
  for (const user of userFormats) {
    for (const port of [6543, 5432]) {
      const host = `aws-0-${region}.pooler.supabase.com`;
      process.stdout.write(`${host}:${port} (${user})... `);
      const client = new Client({
        host, port, user, password,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });
      try {
        await client.connect();
        const res = await client.query('SELECT current_database(), version()');
        console.log(`✅ CONNECTED! DB: ${res.rows[0].current_database}`);
        console.log(`\n=== WORKING ===\nhost: ${host}\nport: ${port}\nuser: ${user}\n`);
        await client.end();
        process.exit(0);
      } catch (err) {
        const msg = err.message.slice(0, 50);
        console.log(`❌ ${msg}`);
        try { await client.end(); } catch {}
        // If connection refused or DNS fails, skip rest of ports for this region
        if (msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND') || msg.includes('ETIMEDOUT')) break;
      }
    }
  }
}
console.log('\nNo working pooler found.');
