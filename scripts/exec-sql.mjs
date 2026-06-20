import pg from 'pg';
import { readFileSync } from 'fs';

const { Client } = pg;

const DB_URL = 'postgresql://postgres:nERCb24AMq2VAMZ4@db.jqppcuccqkxhhrvndsil.supabase.co:5432/postgres';

const files = process.argv.slice(2);
if (!files.length) {
  console.error('Usage: node scripts/exec-sql.mjs file1.sql file2.sql ...');
  process.exit(1);
}

const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log('✅ Connected to Supabase PostgreSQL\n');

  for (const file of files) {
    console.log(`▶  Executing: ${file}`);
    const sql = readFileSync(file, 'utf8');
    try {
      const res = await client.query(sql);
      // res may be array of results for multi-statement
      const results = Array.isArray(res) ? res : [res];
      for (const r of results) {
        if (r.rows && r.rows.length > 0) {
          console.log('   Result:', JSON.stringify(r.rows, null, 2));
        } else if (r.command) {
          console.log(`   ${r.command} — rowCount: ${r.rowCount ?? 0}`);
        }
      }
      console.log(`✅ Done: ${file}\n`);
    } catch (err) {
      console.error(`❌ Error in ${file}:`, err.message, '\n');
    }
  }
} finally {
  await client.end();
  console.log('Connection closed.');
}
