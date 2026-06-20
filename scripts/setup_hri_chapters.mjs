import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ID = 'jqppcuccqkxhhrvndsil';

async function migrate() {
  console.log('Step 1: Adding chapters_json column...');

  const resp = await fetch(
    `https://${PROJECT_ID}.supabase.co/rest/v1/rpc/run_migration`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc'}`,
      },
      body: JSON.stringify({
        sql_text: `ALTER TABLE reports ADD COLUMN IF NOT EXISTS chapters_json JSONB DEFAULT '{}'::jsonb;`
      })
    }
  );

  const text = await resp.text();
  if (resp.ok) {
    console.log('✓ chapters_json column ready');
  } else {
    // Maybe column already exists or other error
    if (text.includes('already exists') || text.includes('duplicate')) {
      console.log('✓ Column already exists');
    } else {
      console.log('Migration response:', text.slice(0, 200));
    }
  }
}

async function uploadChapters() {
  console.log('\nStep 2: Uploading chapter HTML files...');

  const baseDir = 'C:/Users/51229/WorkBuddy/Claw/public';
  const chapterDefs = [
    { key: 'm',  file: 'hri-report-part-m-mapping-v3.html',    free: true  },
    { key: 'a',  file: 'hri-report-part-a-advancement-v1.html', free: false },
    { key: 'o',  file: 'hri-report-part-o-operations-v1.html',  free: false },
    { key: 'r',  file: 'hri-report-part-r-reach-v1.html',       free: false },
    { key: 'a2', file: 'hri-report-part-a2-assets-v1.html',    free: false },
  ];

  const chaptersData: Record<string, { html: string; free: boolean }> = {};
  let totalSize = 0;

  for (const ch of chapterDefs) {
    try {
      const filePath = join(baseDir, ch.file);
      const html = readFileSync(filePath, 'utf-8');
      chaptersData[ch.key] = { html, free: ch.free };
      totalSize += html.length;
      console.log(`✓ ${ch.key}: ${(html.length / 1024).toFixed(0)} KB`);
    } catch (e) {
      console.log(`✗ Missing: ${ch.file}`);
    }
  }

  console.log(`Total: ${(totalSize / 1024).toFixed(0)} KB across ${Object.keys(chaptersData).length} chapters`);

  // Upload via Supabase REST API
  const updateResp = await fetch(
    `https://${PROJECT_ID}.supabase.co/rest/v1/reports?id=eq.44`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcHBjdWNjcWt4aGhydm5kc2lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NzEwNCwiZXhwIjoyMDg4NzIzMTA0fQ.EgU31ntq634GLVyO8bOK2YfsDNmyIL7vadgWROkW-Wc'}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        chapters_json: chaptersData,
        is_premium: true,
      })
    }
  );

  if (updateResp.ok) {
    console.log('✓ Chapters uploaded to DB!');
  } else {
    const errText = await updateResp.text();
    console.log('Upload error:', errText.slice(0, 300));
  }
}

await migrate();
await uploadChapters();
console.log('\n✅ Setup complete!');
