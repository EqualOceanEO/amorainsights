import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

const sqls = [
  // 1. 鍏堢湅褰撳墠鏈夊摢浜涘瓧娈?
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
