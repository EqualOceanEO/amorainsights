import { readFileSync } from 'fs';

async function runSQL(label, sql) {
  process.stdout.write('\n>> ' + label + ' ... ');
  const r = await fetch(
    'https://api.supabase.com/v1/projects/jqppcuccqkxhhrvndsil/database/query',
    {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sbp_2d9e51cc04f38bb94e7b1394ed8c1d064126a8cc',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
      signal: AbortSignal.timeout(60000),
    }
  );
  const text = await r.text();
  if (!r.ok) {
    console.log('FAILED HTTP ' + r.status);
    console.log(text.slice(0, 400));
    process.exit(1);
  }
  console.log('OK  ' + text.slice(0, 120));
}

// Read raw SQL and split into individual statements to run separately
const raw = readFileSync('c:/Users/51229/WorkBuddy/Claw/scripts/migrate-industries-v2.sql', 'utf8');

// Step 1: ALTER TABLE
await runSQL('1 ADD COLUMNS parent_id+level',
  "ALTER TABLE industries ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES industries(id), ADD COLUMN IF NOT EXISTS level SMALLINT NOT NULL DEFAULT 1;"
);

// Step 2a: update FKs before renaming slug
await runSQL('2a FK reports',
  "UPDATE reports SET industry_slug = 'manufacturing' WHERE industry_slug = 'intelligent-manufacturing';"
);
await runSQL('2a FK news_items',
  "UPDATE news_items SET industry_slug = 'manufacturing' WHERE industry_slug = 'intelligent-manufacturing';"
);
await runSQL('2a FK companies',
  "UPDATE companies SET industry_slug = 'manufacturing' WHERE industry_slug = 'intelligent-manufacturing';"
);

// Step 2b+2c: rename slug and fix name_cn — extract from raw SQL
const step2b = raw.match(/-- 2b[\s\S]+?(?=-- 2c)/)[0]
  .replace(/--[^\n]*/g, '').trim();
const step2c = raw.match(/-- 2c[\s\S]+?(?=-- ---)/)[0]
  .replace(/--[^\n]*/g, '').trim();
await runSQL('2b rename slug', step2b);
await runSQL('2c fix name_cn', step2c);

// Step 3: INSERT 36 sub-sectors — extract the full INSERT block from raw SQL
const insertBlock = raw.match(/INSERT INTO industries \(slug[\s\S]+?ON CONFLICT \(slug\) DO NOTHING;/)[0];
await runSQL('3 INSERT 36 sub-sectors', insertBlock);

// Step 4: verify
await runSQL('4 VERIFY counts',
  'SELECT level, COUNT(*) AS count FROM industries GROUP BY level ORDER BY level;'
);

console.log('\nAll done. Expected: level 1 = 6, level 2 = 36');
