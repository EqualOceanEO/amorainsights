import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

/**
 * GET /api/news
 * Public news list from news_items table
 * Query params:
 *   industry  - industry_slug filter
 *   level2    - industry_level2 filter
 *   search    - title search
 *   page      - page number (default 1)
 *   pageSize  - items per page (default 12)
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(req.url);
  const industry  = searchParams.get('industry') || '';
  const level2    = searchParams.get('level2') || '';
  const search    = searchParams.get('search')   || '';
  const page      = parseInt(searchParams.get('page')     || '1', 10);
  const pageSize  = Math.min(50, parseInt(searchParams.get('pageSize') || '12', 10));
  const offset    = (page - 1) * pageSize;

  try {
    // Build query with explicit select for better performance
    let query = supabase
      .from('news_items')
      .select('id, title, summary, industry_slug, industry_level2, source_name, source_url, author, cover_image_url, tags, is_premium, is_featured, published_at', { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (industry) query = query.eq('industry_slug', industry);
    if (level2)   query = query.eq('industry_level2', level2);
    if (search)   query = query.ilike('title', `%${search}%`);

    const { data, error, count } = await query;

    const queryTime = Date.now() - startTime;
    console.log(`[API news] Query time: ${queryTime}ms, returned: ${data?.length ?? 0} items, total: ${count ?? 0}`);

    if (error) {
      console.error('[API news] Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    });
  } catch (err) {
    const errorTime = Date.now() - startTime;
    console.error('[API news] Unexpected error after', errorTime, 'ms:', err);
    return NextResponse.json(
      { error: 'Internal server error', data: [], total: 0, page, pageSize, totalPages: 0 },
      { status: 500 }
    );
  }
}
