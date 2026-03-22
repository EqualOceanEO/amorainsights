import { Client } from 'pg';
import 'dotenv/config';

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

async function step2_generateSlugs() {
  try {
    await client.connect();
    console.log('Step 2: Generating slugs from names...\n');

    const result = await client.query(`
      UPDATE companies 
      SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
      WHERE slug IS NULL;
    `);

    console.log(`✓ Generated slugs for ${result.rowCount} companies`);

    // Clean up slugs
    await client.query(`
      UPDATE companies 
      SET slug = REGEXP_REPLACE(slug, '-+', '-', 'g')
      WHERE slug IS NOT NULL;
    `);
    console.log('✓ Cleaned up multiple hyphens');

    await client.query(`
      UPDATE companies 
      SET slug = REGEXP_REPLACE(slug, '^-|-$', '', 'g')
      WHERE slug IS NOT NULL;
    `);
    console.log('✓ Removed leading/trailing hyphens');

    console.log('\nStep 2 completed!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

step2_generateSlugs();
