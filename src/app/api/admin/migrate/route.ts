import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') !== 'run-migration-now') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // If sql param provided, execute it directly via RPC
  const sqlParam = searchParams.get('sql');
  if (sqlParam) {
    const { data, error } = await supabase.rpc('run_migration', { sql_text: sqlParam });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message, sql: sqlParam }, { status: 200 });
    }
    return NextResponse.json({ ok: true, result: data, sql: sqlParam.substring(0, 100) });
  }

  // Original logic: check/apply news_items migrations
  const { data: sample } = await supabase.from('news_items').select('*').limit(1);
  const existingCols = sample && sample[0] ? Object.keys(sample[0]) : [];
  const needed = ['slug', 'content', 'cover_image_url', 'author', 'tags', 'is_premium', 'is_published', 'company_id', 'industry_id', 'sub_sector_id', 'updated_at'];
  const missing = needed.filter(c => !existingCols.includes(c));

  if (missing.length === 0) {
    return NextResponse.json({ message: 'All columns already exist!', existingCols });
  }

  const { data: rpcTest, error: rpcErr } = await supabase.rpc('run_migration', { sql_text: 'SELECT 1' });

  if (!rpcErr) {
    const results = [];
    const migrations = [
      `ALTER TABLE news_items ADD COLUMN IF NOT EXISTS slug TEXT`,
      `ALTER TABLE news_items ADD COLUMN IF NOT EXISTS content TEXT`,
      `ALTER TABLE news_items ADD COLUMN IF NOT EXISTS cover_image_url TEXT`,
      `ALTER TABLE news_items ADD COLUMN IF NOT EXISTS author TEXT`,
      `ALTER TABLE news_items ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'`,
      `ALTER TABLE news_items ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE`,
      `ALTER TABLE news_items ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE`,
      `ALTER TABLE news_items ADD COLUMN IF NOT EXISTS company_id BIGINT`,
      `ALTER TABLE news_items ADD COLUMN IF NOT EXISTS industry_id TEXT`,
      `ALTER TABLE news_items ADD COLUMN IF NOT EXISTS sub_sector_id TEXT`,
      `ALTER TABLE news_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
      `UPDATE news_items SET slug = 'news-' || id::text WHERE slug IS NULL OR slug = ''`,
      `UPDATE news_items SET industry_id = industry_slug WHERE industry_id IS NULL`,
    ];
    for (const sql of migrations) {
      const { data, error } = await supabase.rpc('run_migration', { sql_text: sql });
      results.push({ sql: sql.substring(0, 70), ok: !error, result: data || error?.message });
    }
    return NextResponse.json({ results, missing, done: true });
  }

  return NextResponse.json({
    message: 'run_migration function not found in database. Please run this SQL in Supabase SQL Editor first:',
    create_function_sql: `CREATE OR REPLACE FUNCTION public.run_migration(sql_text TEXT) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN EXECUTE sql_text; RETURN 'ok'; EXCEPTION WHEN OTHERS THEN RETURN SQLERRM; END; $$;`,
    sql_editor_url: 'https://supabase.com/dashboard/project/jqppcuccqkxhhrvndsil/sql/new',
    missing_columns: missing,
    existing_columns: existingCols,
    rpc_error: rpcErr?.message,
  });
}
