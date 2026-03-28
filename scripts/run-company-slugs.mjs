/**
 * 通过 Supabase RPC run_migration 执行 DDL + slug 填充
 * 使用 service_role key，走 REST /rpc/run_migration 端点
 */

const SUPABASE_URL = 'https://jqppcuccqkxhhrvndsil.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc';

async function runMigration(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/run_migration`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql_text: sql }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  console.log('OK:', text.slice(0, 200));
}

// Step 1: 加列
await runMigration(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug TEXT;`);
console.log('Step 1: slug column added');

// Step 2: 填充 slug（逐条，避免超长）
const slugs = [
  ['BYD', 'byd'],
  ['CATL', 'catl'],
  ['DJI', 'dji'],
  ['Huawei', 'huawei'],
  ['Sinopec', 'sinopec'],
  ['SunPower', 'sunpower-cn'],
  ['Sungrow', 'sungrow'],
  ['Unitree Robotics', 'unitree-robotics'],
  ['UBTECH', 'ubtech'],
  ['CNGR Advanced Material', 'cngr-advanced-material'],
  ['Zhongji Innolight', 'zhongji-innolight'],
  ['Zhejiang NHU', 'zhejiang-nhu'],
  ['ZJLD Group', 'zjld-group'],
  ['OpenAI', 'openai'],
  ['Anthropic', 'anthropic'],
  ['Figure AI', 'figure-ai'],
  ['Physical Intelligence', 'physical-intelligence'],
  ['Tesla', 'tesla'],
  ['SpaceX', 'spacex'],
  ['Rocket Lab', 'rocket-lab'],
  ['Enovix', 'enovix'],
  ['Recursion Pharmaceuticals', 'recursion-pharmaceuticals'],
  ['Solugen', 'solugen'],
];

// 把所有 UPDATE 合成一条 SQL
const updateSql = slugs
  .map(([name, slug]) => `UPDATE companies SET slug = '${slug}' WHERE name = '${name}';`)
  .join('\n');

await runMigration(updateSql);
console.log('Step 2: slugs filled for', slugs.length, 'companies');

// Step 3: 唯一索引
await runMigration(`CREATE UNIQUE INDEX IF NOT EXISTS companies_slug_unique ON companies(slug) WHERE slug IS NOT NULL;`);
console.log('Step 3: unique index created');

console.log('\nAll done!');
