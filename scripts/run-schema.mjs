import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

config({ path: '.env' });

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// Split SQL into individual statements and run each
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`Running ${statements.length} SQL statements...`);

for (const stmt of statements) {
  const preview = stmt.slice(0, 60).replace(/\n/g, ' ');
  const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' }).catch(() => ({ error: { message: 'rpc not available' } }));
  if (error) {
    // Fallback: try via postgrest raw query
    console.log(`  STMT: ${preview}...`);
    console.log(`  Note: Direct SQL execution requires Supabase dashboard or pg connection`);
  } else {
    console.log(`  ✅ ${preview}`);
  }
}

// Try direct pg connection
import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: process.env.POSTGRES_URL });

try {
  await client.connect();
  console.log('\n✅ Connected to PostgreSQL directly, executing schema...');
  
  // Execute the full schema
  await client.query(sql);
  console.log('✅ All tables created successfully!');
  
  // Verify tables
  const res = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('reports', 'news_items', 'companies', 'users')
    ORDER BY table_name;
  `);
  console.log('\nTables in DB:', res.rows.map(r => r.table_name).join(', '));
  
} catch (err) {
  console.error('PG Error:', err.message);
} finally {
  await client.end();
}
