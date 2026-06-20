/**
 * Dashboard v2 Auto-Migration Endpoint
 * 
 * Triggered on first deploy or via GET /api/admin/auto-migrate?secret=run-migration-now
 * Creates user_companies, user_watchlist, user_benchmark_groups tables
 * with full RLS policies — NO manual SQL required.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Migration SQL statements — idempotent (IF NOT EXISTS)
const MIGRATIONS = [
  // ── 1. user_companies ──────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS user_companies (
    id            BIGSERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL,
    name          TEXT NOT NULL,
    name_cn       TEXT,
    industry_slug TEXT NOT NULL,
    sub_sector    TEXT,
    description   TEXT,
    founded_year  INTEGER,
    country       TEXT NOT NULL DEFAULT 'China',
    hq_city       TEXT,
    hq_province   TEXT,
    website       TEXT,
    employee_count INTEGER,
    funding_stage TEXT,
    funding_total_usd NUMERIC(18,2),
    valuation_usd     NUMERIC(18,2),
    revenue_range     TEXT,
    business_model    TEXT,
    core_products     TEXT,
    tech_route        TEXT,
    key_partners      TEXT,
    primary_use_cases TEXT,
    competitors       TEXT,
    logo_url          TEXT,
    data_source       TEXT DEFAULT 'user',
    is_published      BOOLEAN DEFAULT false,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_uc_user_id ON user_companies(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_uc_industry ON user_companies(industry_slug)`,

  // ── 2. user_watchlist ──────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS user_watchlist (
    id            BIGSERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL,
    company_id    INTEGER,
    user_company_id INTEGER,
    added_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes         TEXT,
    alert_enabled BOOLEAN DEFAULT true,
    CONSTRAINT wl_has_target CHECK (company_id IS NOT NULL OR user_company_id IS NOT NULL)
  )`,

  `CREATE INDEX IF NOT EXISTS idx_wl_user ON user_watchlist(user_id)`,

  // ── 3. user_benchmark_groups ───────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS user_benchmark_groups (
    id            BIGSERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL,
    name          TEXT NOT NULL,
    description   TEXT,
    company_ids   INTEGER[] NOT NULL DEFAULT '{}',
    user_company_ids INTEGER[] NOT NULL DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_ubg_user ON user_benchmark_groups(user_id)`,

  // ── 4. RLS ─────────────────────────────────────────────────────────
  `ALTER TABLE IF EXISTS user_companies ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS user_watchlist ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE IF EXISTS user_benchmark_groups ENABLE ROW LEVEL SECURITY`,

  // ── 5. RLS Policies ────────────────────────────────────────────────
  // user_companies policies
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own companies') THEN
      CREATE POLICY "Users can view own companies" ON user_companies FOR SELECT USING (auth.uid()::text = user_id::text);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own companies') THEN
      CREATE POLICY "Users can insert own companies" ON user_companies FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own companies') THEN
      CREATE POLICY "Users can update own companies" ON user_companies FOR UPDATE USING (auth.uid()::text = user_id::text);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own companies') THEN
      CREATE POLICY "Users can delete own companies" ON user_companies FOR DELETE USING (auth.uid()::text = user_id::text);
    END IF;
  END $$`,

  // user_watchlist policies
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own watchlist') THEN
      CREATE POLICY "Users can view own watchlist" ON user_watchlist FOR SELECT USING (auth.uid()::text = user_id::text);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own watchlist') THEN
      CREATE POLICY "Users can insert own watchlist" ON user_watchlist FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own watchlist') THEN
      CREATE POLICY "Users can delete own watchlist" ON user_watchlist FOR DELETE USING (auth.uid()::text = user_id::text);
    END IF;
  END $$`,

  // user_benchmark_groups policies
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own benchmark groups') THEN
      CREATE POLICY "Users can view own benchmark groups" ON user_benchmark_groups FOR SELECT USING (auth.uid()::text = user_id::text);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own benchmark groups') THEN
      CREATE POLICY "Users can insert own benchmark groups" ON user_benchmark_groups FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own benchmark groups') THEN
      CREATE POLICY "Users can update own benchmark groups" ON user_benchmark_groups FOR UPDATE USING (auth.uid()::text = user_id::text);
    END IF;
  END $$`,

  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own benchmark groups') THEN
      CREATE POLICY "Users can delete own benchmark groups" ON user_benchmark_groups FOR DELETE USING (auth.uid()::text = user_id::text);
    END IF;
  END $$`,
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') !== 'run-migration-now') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // First ensure run_migration RPC exists
  const { error: rpcCheckErr } = await supabase.rpc('run_migration', { sql_text: 'SELECT 1' });
  
  if (rpcCheckErr) {
    // Try to create the RPC function via direct SQL
    const { error: createFnErr } = await supabase.rpc('run_migration', {
      sql_text: `CREATE OR REPLACE FUNCTION public.run_migration(sql_text TEXT) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN EXECUTE sql_text; RETURN 'ok'; EXCEPTION WHEN OTHERS THEN RETURN SQLERRM; END; $$;`
    }).catch(() => ({ error: null }));

    if (createFnErr) {
      return NextResponse.json({
        ok: false,
        error: 'Cannot create run_migration RPC. Please run the SQL below in Supabase SQL Editor first.',
        create_function_sql: `CREATE OR REPLACE FUNCTION public.run_migration(sql_text TEXT) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN EXECUTE sql_text; RETURN 'ok'; EXCEPTION WHEN OTHERS THEN RETURN SQLERRM; END; $$;`,
        rpc_error: rpcCheckErr.message,
      });
    }
  }

  // Execute all migrations
  const results: { sql: string; ok: boolean; result: string }[] = [];
  let successCount = 0;
  let failCount = 0;

  for (const sql of MIGRATIONS) {
    const { data, error } = await supabase.rpc('run_migration', { sql_text: sql });
    const ok = !error && (data === 'ok' || data === null);
    if (ok) successCount++;
    else failCount++;
    results.push({
      sql: sql.substring(0, 80).replace(/\s+/g, ' '),
      ok,
      result: error ? error.message : (data ?? 'ok'),
    });
  }

  return NextResponse.json({
    ok: failCount === 0,
    total: MIGRATIONS.length,
    success: successCount,
    failed: failCount,
    results,
  });
}
