import pg from 'pg';
const { Client } = pg;

const dbUrl = 'postgresql://postgres:nERCb24AMq2VAMZ4@db.jqppcuccqkxhhrvndsil.supabase.co:5432/postgres';
const poolerUrl = 'postgresql://postgres.jqppcuccqkxhhrvndsil:nERCb24AMq2VAMZ4@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

const sqls = [
  "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS slug TEXT",
  "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS content TEXT",
  "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS cover_image_url TEXT",
  "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS author TEXT",
  "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'",
  "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE",
  "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE",
  "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS company_id BIGINT",
  "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS industry_id TEXT",
  "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS sub_sector_id TEXT",
  "ALTER TABLE news_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()",
  "UPDATE news_items SET slug = 'news-' || id::text WHERE slug IS NULL OR slug = ''",
  "UPDATE news_items SET industry_id = industry_slug WHERE industry_id IS NULL"
];

async function runMigration(url) {
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
  try {
    console.log('Connecting to:', url.substring(0, 60) + '...');
    await client.connect();
    console.log('Connected!');
    for (const sql of sqls) {
      try {
        await client.query(sql);
        console.log('OK:', sql.substring(0, 70));
      } catch (e) {
        console.log('SKIP:', e.message.substring(0, 100));
      }
    }
    console.log('\nChecking current columns...');
    const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'news_items' ORDER BY ordinal_position`);
    res.rows.forEach(r => console.log(' -', r.column_name, ':', r.data_type));
    return true;
  } catch (e) {
    console.error('Connection failed:', e.message);
    return false;
  } finally {
    await client.end().catch(() => {});
  }
}

(async () => {
  const ok = await runMigration(dbUrl);
  if (!ok) {
    console.log('\nTrying pooler...');
    await runMigration(poolerUrl);
  }
})();
