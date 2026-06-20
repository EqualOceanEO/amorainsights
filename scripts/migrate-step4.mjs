import { Client } from 'pg';
import 'dotenv/config';

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

async function step4_migrateSubSectorIds() {
  try {
    await client.connect();
    console.log('Step 4: Migrating sub_sector -> sub_sector_id...\n');

    const result = await client.query(`
      UPDATE companies c
      SET sub_sector_id = i.id
      FROM industries i
      WHERE c.sub_sector = i.name
      AND i.level = 2
      AND c.sub_sector_id IS NULL;
    `);

    console.log(`✓ Migrated sub_sector_id for ${result.rowCount} companies`);

    // Check unmigrated
    const unmigrated = await client.query(`
      SELECT COUNT(*) as count
      FROM companies
      WHERE sub_sector IS NOT NULL AND sub_sector_id IS NULL;
    `);

    console.log(`\nUnmigrated sub_sectors: ${unmigrated.rows[0].count}`);

    if (unmigrated.rows[0].count > 0) {
      const unmigratedList = await client.query(`
        SELECT id, name, sub_sector
        FROM companies
        WHERE sub_sector IS NOT NULL AND sub_sector_id IS NULL
        LIMIT 10;
      `);
      console.log('\nSample unmigrated:');
      console.table(unmigratedList.rows);
    }

    console.log('\nStep 4 completed!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

step4_migrateSubSectorIds();
