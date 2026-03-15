import { NextRequest, NextResponse } from 'next/server';
import { supabase, type IndustrySlug, ALL_INDUSTRY_SLUGS } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/companies
 * Returns paginated company list for admin UI
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const pageSize = parseInt(url.searchParams.get('pageSize') ?? '20');
  const search = url.searchParams.get('q') ?? '';
  const industrySlug = url.searchParams.get('industry_slug') ?? '';
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('companies')
    .select(
      'id, name, name_cn, industry_slug, sub_sector, country, hq_city, is_public, is_tracked, ticker, employee_count, tags, created_at',
      { count: 'exact' }
    )
    .order('name', { ascending: true })
    .range(from, to);

  if (search) {
    query = query.or(`name.ilike.%${search}%,name_cn.ilike.%${search}%`);
  }
  if (industrySlug && ALL_INDUSTRY_SLUGS.includes(industrySlug as IndustrySlug)) {
    query = query.eq('industry_slug', industrySlug);
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  });
}
