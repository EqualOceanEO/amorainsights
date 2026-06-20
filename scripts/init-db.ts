import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

const url = process.env.POSTGRES_URL;
if (!url) {
  console.error('❌  POSTGRES_URL is not set.');
  process.exit(1);
}

const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function init() {
  await client.connect();
  console.log('🔧  Initializing database...');

  // Drop and recreate to ensure schema is correct
  await client.query(`DROP TABLE IF EXISTS sessions`);
  await client.query(`DROP TABLE IF EXISTS users CASCADE`);

  await client.query(`
    CREATE TABLE users (
      id         SERIAL PRIMARY KEY,
      email      TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      name       TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('  ✅  users table ready');

  await client.query(`
    CREATE TABLE sessions (
      id         TEXT PRIMARY KEY,
      user_id    INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires    TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('  ✅  sessions table ready');

  await client.end();
  console.log('\n🎉  Database initialised successfully!');
}

init().catch(async (err) => {
  console.error('❌  Database init failed:', err.message);
  await client.end().catch(() => {});
  process.exit(1);
});
