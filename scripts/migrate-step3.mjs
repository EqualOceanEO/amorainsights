import { Client } from 'pg';
import 'dotenv/config';

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

async function step3_migrateIndustryIds() {
  try {
    await client.connect();
    console.log('Step 3: Migrating industry_slug -> industry_id...\n');

    const result = await client.query(`
      UPDATE companies c
      SET industry_id = i.id
      FROM industries i
      WHERE c.industry_slug = i.slug
      AND c.industry_id IS NULL;
    `);

    console.log(`✓ Migrated industry_id for ${result.rowCount} companies`);

    // Check unmigrated
    const unmigrated = await client.query(`
      SELECT COUNT(*) as count
      FROM companies
      WHERE industry_id IS NULL AND industry_slug IS NOT NULL;
    `);

    console.log(`\nUnmigrated companies: ${unmigrated.rows[0].count}`);

    if (unmigrated.rows[0].count > 0) {
      const unmigratedList = await client.query(`
        SELECT id, name, industry_slug
        FROM companies
        WHERE industry_id IS NULL AND industry_slug IS NOT NULL
        LIMIT 10;
      `);
      console.log('\nSample unmigrated:');
      console.table(unmigratedList.rows);
    }

    console.log('\nStep 3 completed!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

step3_migrateIndustryIds();
