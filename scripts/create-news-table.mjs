import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:nERCb24AMq2VAMZ4@db.jqppcuccqkxhhrvndsil.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log('Connected');

  const stmts = [
    `CREATE TABLE IF NOT EXISTS news (
      id              BIGSERIAL PRIMARY KEY,
      title           TEXT NOT NULL,
      slug            TEXT NOT NULL UNIQUE,
      summary         TEXT,
      content         TEXT,
      source_url      TEXT,
      source_name     TEXT,
      author          TEXT,
      cover_image_url TEXT,
      industry_slug   TEXT NOT NULL DEFAULT 'ai',
      company_id      BIGINT REFERENCES companies(id) ON DELETE SET NULL,
      company_ids     BIGINT[] DEFAULT '{}',
      tags            TEXT[] DEFAULT '{}',
      is_premium      BOOLEAN NOT NULL DEFAULT FALSE,
      is_published    BOOLEAN NOT NULL DEFAULT FALSE,
      published_at    TIMESTAMPTZ,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_news_industry_slug ON news(industry_slug)`,
    `CREATE INDEX IF NOT EXISTS idx_news_company_id ON news(company_id)`,
    `CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_news_is_published ON news(is_published)`,
    `CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug)`,
  ];

  for (const sql of stmts) {
    try {
      await client.query(sql);
      console.log('OK:', sql.slice(0, 60).replace(/\s+/g, ' '));
    } catch (e) {
      console.error('ERR:', e.message);
    }
  }

  // Verify table exists
  const res = await client.query(`SELECT COUNT(*) FROM news`);
  console.log('news table row count:', res.rows[0].count);

  await client.end();
  console.log('Done');
}

run().catch(e => { console.error(e); process.exit(1); });
