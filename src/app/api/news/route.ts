import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/news
 * Public endpoint — only returns published news
 * Query params: page, pageSize, industry, company_id, tag, q
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page     = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const pageSize = Math.min(50, parseInt(searchParams.get('pageSize') || '12'));
  const industry = searchParams.get('industry') || '';
  const companyId = searchParams.get('company_id') || '';
  const tag      = searchParams.get('tag') || '';
  const search   = searchParams.get('q') || '';

  let q = supabase
    .from('news')
    .select(
      'id,title,slug,summary,cover_image_url,source_name,source_url,author,industry_slug,company_id,company_ids,tags,is_premium,published_at,created_at',
      { count: 'exact' }
    )
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (industry)  q = q.eq('industry_slug', industry);
  if (companyId) q = q.eq('company_id', parseInt(companyId));
  if (tag)       q = q.contains('tags', [tag]);
  if (search)    q = q.ilike('title', `%${search}%`);

  const { data, error, count } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data:       data ?? [],
    total:      count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  });
}
