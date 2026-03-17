import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

/**
 * GET /api/news
 * Public news list from news_items table
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const industry = searchParams.get('industry') || '';
  const search   = searchParams.get('search')   || '';
  const page     = parseInt(searchParams.get('page')     || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);
  const offset   = (page - 1) * pageSize;

  let query = supabase
    .from('news_items')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (industry) query = query.eq('industry_slug', industry);
  if (search)   query = query.ilike('title', `%${search}%`);

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
