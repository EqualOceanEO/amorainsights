import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:nERCb24AMq2VAMZ4@db.jqppcuccqkxhhrvndsil.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  console.log('Connecting to database...');
  await client.connect();
  console.log('Connected!\n');

  console.log('=== Step 1: Add missing columns ===');
  const alterStatements = [
    'ALTER TABLE news_items ADD COLUMN IF NOT EXISTS author TEXT;',
    'ALTER TABLE news_items ADD COLUMN IF NOT EXISTS cover_image_url TEXT;',
    'ALTER TABLE news_items ADD COLUMN IF NOT EXISTS tags TEXT[];',
    'ALTER TABLE news_items ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;',
    'ALTER TABLE news_items ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;',
    'ALTER TABLE news_items ADD COLUMN IF NOT EXISTS slug TEXT;',
    'ALTER TABLE news_items ADD COLUMN IF NOT EXISTS content TEXT;',
    'ALTER TABLE news_items ADD COLUMN IF NOT EXISTS industry_id INTEGER REFERENCES industries(id);',
    'ALTER TABLE news_items ADD COLUMN IF NOT EXISTS sub_sector_id INTEGER REFERENCES industries(id);',
    'ALTER TABLE news_items ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);',
  ];

  for (const sql of alterStatements) {
    try {
      await client.query(sql);
      const colName = sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/)?.[1];
      console.log(`  ✓ ${colName}`);
    } catch (e) {
      console.log(`  ✗ ${e.message.split('\n')[0]}`);
    }
  }

  console.log('\n=== Step 2: Verify current columns ===');
  const { rows } = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'news_items'
    ORDER BY ordinal_position;
  `);
  console.log('Current news_items columns:');
  rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type} (nullable: ${r.is_nullable})`));

  await client.end();
  console.log('\nDone!');
}

migrate().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});
