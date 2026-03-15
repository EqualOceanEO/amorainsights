const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL');

  await client.query(sql);
  console.log('Schema executed successfully');

  const res = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('reports','news_items','companies') ORDER BY table_name"
  );
  console.log('Tables created:', res.rows.map((r) => r.table_name).join(', '));

  await client.end();
}

main().catch((err) => {
  console.error('Error:', err.message);
  client.end();
  process.exit(1);
});
