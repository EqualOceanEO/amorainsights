import { Client } from 'pg';
import 'dotenv/config';

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

async function step5_createIndexes() {
  try {
    await client.connect();
    console.log('Step 5: Creating indexes...\n');

    // Check for duplicate slugs first
    const duplicates = await client.query(`
      SELECT slug, COUNT(*) as count, 
             array_agg(name) as company_names,
             array_agg(id) as company_ids
      FROM companies
      WHERE slug IS NOT NULL
      GROUP BY slug
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 10;
    `);

    if (duplicates.rows.length > 0) {
      console.log('WARNING: Found duplicate slugs:');
      console.table(duplicates.rows);
      console.log('\nFixing duplicates by adding suffix...\n');

      for (const row of duplicates.rows) {
        const companies = [];
        for (let i = 0; i < row.company_ids.length; i++) {
          const id = row.company_ids[i];
          const suffix = i === 0 ? '' : `-${i + 1}`;
          const newSlug = row.slug + suffix;
          await client.query(
            'UPDATE companies SET slug = $1 WHERE id = $2',
            [newSlug, id]
          );
          companies.push({ id, name: row.company_names[i], new_slug: newSlug });
        }
        console.log(`Fixed slug "${row.slug}":`);
        console.table(companies);
      }
    } else {
      console.log('✓ No duplicate slugs found');
    }

    // Create unique index on slug
    try {
      await client.query('CREATE UNIQUE INDEX companies_slug_unique ON companies(slug)');
      console.log('✓ Created unique index on slug');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✓ Index on slug already exists');
      } else {
        throw error;
      }
    }

    // Create index on industry_id
    try {
      await client.query('CREATE INDEX companies_industry_id_idx ON companies(industry_id)');
      console.log('✓ Created index on industry_id');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✓ Index on industry_id already exists');
      } else {
        throw error;
      }
    }

    // Create index on sub_sector_id
    try {
      await client.query('CREATE INDEX companies_sub_sector_id_idx ON companies(sub_sector_id)');
      console.log('✓ Created index on sub_sector_id');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✓ Index on sub_sector_id already exists');
      } else {
        throw error;
      }
    }

    // Verify
    const verify = await client.query(`
      SELECT 
        COUNT(*) as total_companies,
        COUNT(DISTINCT slug) as unique_slugs,
        COUNT(industry_id) as companies_with_industry_id,
        COUNT(sub_sector_id) as companies_with_sub_sector_id
      FROM companies;
    `);

    console.log('\nFinal stats:');
    console.table(verify.rows);

    console.log('\nStep 5 completed!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

step5_createIndexes();
