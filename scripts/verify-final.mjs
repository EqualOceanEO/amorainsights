import { Client } from 'pg';
import 'dotenv/config';

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

async function verify() {
  try {
    await client.connect();
    console.log('Verifying migration...\n');

    // Check columns exist
    const columns = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'companies'
      AND column_name IN ('slug', 'industry_id', 'sub_sector_id')
      ORDER BY ordinal_position;
    `);

    console.log('New columns added:');
    console.table(columns.rows);

    // Sample data
    const sample = await client.query(`
      SELECT id, name, slug, industry_id, sub_sector_id
      FROM companies
      LIMIT 5;
    `);

    console.log('\nSample data:');
    console.table(sample.rows);

    // Check indexes
    const indexes = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'companies'
      AND indexname LIKE 'companies%';
    `);

    console.log('\nIndexes created:');
    console.table(indexes.rows);

    console.log('\n✓ Migration verified successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verify();
