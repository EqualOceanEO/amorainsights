import { Client } from 'pg';
import 'dotenv/config';

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

async function findDuplicates() {
  try {
    await client.connect();
    console.log('Finding duplicate slugs...\n');

    const result = await client.query(`
      SELECT slug, COUNT(*) as count, 
             array_agg(name) as company_names,
             array_agg(id) as company_ids
      FROM companies
      WHERE slug IS NOT NULL
      GROUP BY slug
      HAVING COUNT(*) > 1
      ORDER BY count DESC;
    `);

    if (result.rows.length === 0) {
      console.log('No duplicate slugs found!');
    } else {
      console.log('Duplicate slugs:');
      console.table(result.rows);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

findDuplicates();
