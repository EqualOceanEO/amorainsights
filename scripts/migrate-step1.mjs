import { Client } from 'pg';
import 'dotenv/config';

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

async function step1_addColumns() {
  try {
    await client.connect();
    console.log('Step 1: Adding columns...\n');

    // Add slug column
    await client.query('ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug TEXT');
    console.log('✓ Added slug column');

    // Add industry_id column
    await client.query('ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry_id INTEGER REFERENCES industries(id)');
    console.log('✓ Added industry_id column');

    // Add sub_sector_id column
    await client.query('ALTER TABLE companies ADD COLUMN IF NOT EXISTS sub_sector_id INTEGER REFERENCES industries(id)');
    console.log('✓ Added sub_sector_id column');

    console.log('\nStep 1 completed!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

step1_addColumns();
