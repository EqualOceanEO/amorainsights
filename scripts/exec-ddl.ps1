$script = @'
import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

const sqls = [
  // 1. 先看当前有哪些字段
  `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'news_items' ORDER BY ordinal_position`
];

async function main() {
  await client.connect();
  console.log('Connected!');
  for (const sql of sqls) {
    const res = await client.query(sql);
    console.log(JSON.stringify(res.rows, null, 2));
  }
  await client.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
'@

$script | Set-Content -Path "c:\Users\51229\WorkBuddy\Claw\scripts\exec-ddl.mjs" -Encoding UTF8

$env:POSTGRES_URL = "postgresql://postgres:nERCb24AMq2VAMZ4@db.jqppcuccqkxhhrvndsil.supabase.co:5432/postgres"
cd "c:\Users\51229\WorkBuddy\Claw"
node scripts/exec-ddl.mjs 2>&1
