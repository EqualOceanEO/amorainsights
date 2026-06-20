import pg from 'pg';
const { Client } = pg;

// Supabase connection options to try
// Session pooler uses the project's supabase.co domain on port 5432
// Transaction pooler uses pooler.supabase.com on port 6543
const connections = [
  // Try the REST-compatible connection via supavisor
  'postgresql://postgres.jqppcuccqkxhhrvndsil:nERCb24AMq2VAMZ4@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres',
  // Direct connection
  'postgresql://postgres:nERCb24AMq2VAMZ4@db.jqppcuccqkxhhrvndsil.supabase.co:5432/postgres',
  // Alternative direct
  'postgresql://postgres:nERCb24AMq2VAMZ4@jqppcuccqkxhhrvndsil.supabase.co:5432/postgres',
];

const testSql = "SELECT column_name FROM information_schema.columns WHERE table_name = 'news_items' ORDER BY ordinal_position";

for (const connStr of connections) {
  console.log('\nTrying:', connStr.substring(0, 70) + '...');
  const client = new Client({ 
    connectionString: connStr, 
    ssl: { rejectUnauthorized: false }, 
    connectionTimeoutMillis: 8000 
  });
  try {
    await client.connect();
    console.log('CONNECTED!');
    const res = await client.query(testSql);
    console.log('Columns:', res.rows.map(r => r.column_name).join(', '));
    await client.end();
    break;
  } catch (e) {
    console.log('FAIL:', e.message);
    await client.end().catch(() => {});
  }
}
