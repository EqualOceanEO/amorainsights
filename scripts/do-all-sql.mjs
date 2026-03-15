import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
  'https://jqppcuccqkxhhrvndsil.supabase.co',
  // service_role key needed for DDL — using anon key here, will try rpc
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDcxMDQsImV4cCI6MjA4ODcyMzEwNH0.twYdLldCw10hQADe5RximjkLTtrYE1zyvr1xMYVS3V8'
);

const files = [
  'scripts/full-schema-seed.sql',
  'scripts/compliance-scan-rpc.sql',
];

const subSql = `ALTER TABLE users
  ADD COLUMN IF NOT EXISTS subscription_tier        VARCHAR(20) NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_expires_at  TIMESTAMPTZ;`;

async function runSQL(label, sql) {
  process.stdout.write(`\n▶ ${label} ... `);
  // Use Supabase Management API via fetch
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
  if (!r.ok) {
    console.log(`HTTP ${r.status} FAILED`);
    console.log(text.slice(0, 400));
  } else {
    console.log(`HTTP ${r.status} OK`);
    console.log(text.slice(0, 300));
  }
}

for (const f of files) {
  await runSQL(f, readFileSync(f, 'utf8'));
}
await runSQL('subscription_tier ALTER TABLE', subSql);
console.log('\nAll done.');
