import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Step 1: Check current structure
    const cols = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'news_items'
      ORDER BY ordinal_position
    `);
    console.log('Current news_items columns:');
    cols.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type} default=${r.column_default}`));
    console.log('');

    // Step 2: Check existing foreign keys
    const fks = await client.query(`
      SELECT constraint_name, column_name, foreign_table_name, foreign_column_name
      FROM information_schema.key_column_usage
      WHERE table_name = 'news_items' AND foreign_table_name IS NOT NULL
    `);
    console.log('Existing FKs:', fks.rows.map(r => r.column_name));
    console.log('');

    // Step 3: Add columns (only if not exist)
    const addCol = async (col, def) => {
      try {
        await client.query(`ALTER TABLE news_items ADD COLUMN IF NOT EXISTS ${col} ${def}`);
        console.log(`✅ Added: ${col}`);
      } catch (e) {
        if (e.code === '42701') console.log(`⏭  Already exists: ${col}`);
        else throw e;
      }
    };

    await addCol('industry_id', 'INTEGER REFERENCES industries(id)');
    await addCol('sub_sector_id', 'INTEGER REFERENCES industries(id)');
    await addCol('company_id', 'BIGINT REFERENCES companies(id)');
    await addCol('content', 'TEXT');
    await addCol('updated_at', "TIMESTAMPTZ NOT NULL DEFAULT NOW()");

    // Step 4: Backfill content from summary for existing rows
    await client.query(`
      UPDATE news_items SET content = summary WHERE content IS NULL AND summary IS NOT NULL
    `);
    console.log('\n✅ Backfilled content from summary');

    // Step 5: Create indexes
    const addIdx = async (idx, sql) => {
      try {
        await client.query(`CREATE INDEX IF NOT EXISTS ${idx} ON news_items(${sql})`);
        console.log(`✅ Index: ${idx}`);
      } catch (e) {
        if (e.code === '42P07') console.log(`⏭  Index exists: ${idx}`);
        else throw e;
      }
    };

    await addIdx('idx_news_items_industry_id', 'industry_id');
    await addIdx('idx_news_items_sub_sector_id', 'sub_sector_id');
    await addIdx('idx_news_items_company_id', 'company_id');
    await addIdx('idx_news_items_published_at', 'published_at DESC');
    await addIdx('idx_news_items_content', 'content');

    // Step 6: Drop old indexes that used industry_slug (but keep column for now)
    try {
      await client.query('DROP INDEX IF EXISTS idx_news_items_industry');
      console.log('✅ Dropped idx_news_items_industry (can recreate on industry_id later)');
    } catch (e) { /* ignore */ }

    // Step 7: Show final structure
    const finalCols = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'news_items'
      ORDER BY ordinal_position
    `);
    console.log('\n📋 Final news_items columns:');
    finalCols.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));

    console.log('\n🎉 Migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
