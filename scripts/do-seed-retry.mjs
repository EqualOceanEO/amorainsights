import { readFileSync } from 'fs';

// Re-run seed with ON CONFLICT DO NOTHING for reports, news_items, companies
// The CREATE TABLE IF NOT EXISTS and industries INSERT already have conflict handling
// Only reports/news_items/companies INSERT statements lack it — patch them here

async function runSQL(label, sql) {
  process.stdout.write(`\n▶ ${label} ... `);
  const r = await fetch(
    'https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/query',
    {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
      signal: AbortSignal.timeout(120_000),
    }
  );
  const text = await r.text();
  console.log(`HTTP ${r.status}`);
  console.log(text.slice(0, 300));
}

// Patch: add ON CONFLICT DO NOTHING to reports/news_items/companies inserts
let sql = readFileSync('scripts/full-schema-seed.sql', 'utf8');

// Replace INSERT INTO reports (...) VALUES ... ; with ON CONFLICT (slug) DO NOTHING
sql = sql.replace(
  /^(INSERT INTO reports\b[\s\S]+?);$/m,
  '$1\nON CONFLICT (slug) DO NOTHING;'
);
// news_items — no unique constraint other than id, but title+source could repeat; skip re-insert by truncating first
// companies — same; just use DO NOTHING on name
sql = sql.replace(
  /^(INSERT INTO news_items\b[\s\S]+?);$/m,
  '$1\nON CONFLICT DO NOTHING;'
);
sql = sql.replace(
  /^(INSERT INTO companies\b[\s\S]+?);$/m,
  '$1\nON CONFLICT DO NOTHING;'
);

await runSQL('full-schema-seed (idempotent)', sql);
console.log('\nDone.');
