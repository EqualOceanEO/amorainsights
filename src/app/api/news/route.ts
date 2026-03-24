import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

/**
 * GET /api/news
 * Public news list — supports industry_id, search, pagination.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const industry  = searchParams.get('industry') || '';
  const search    = searchParams.get('search')   || '';
  const page      = Math.max(1, parseInt(searchParams.get('page')     || '1', 10));
  const pageSize  = Math.min(50, parseInt(searchParams.get('pageSize') || '12', 10));
  const offset    = (page - 1) * pageSize;

  try {
    let query = supabase
      .from('news_items')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    // Filter by industry — use industry_slug (always present in legacy table)
    // After migration: industry_id column will also be populated
    if (industry) {
      query = query.eq('industry_slug', industry);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[API /news] Query error:', error.message);
      return NextResponse.json(
        { error: error.message, data: [], total: 0, page, pageSize, totalPages: 0 },
        { status: 500 }
      );
    }

    const rows = (data ?? []).map((item: any) => normalizeItem(item));

    return NextResponse.json({
      data: rows,
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    });
  } catch (err: any) {
    console.error('[API /news] Unexpected error:', err?.message);
    return NextResponse.json(
      { error: 'Internal server error', data: [], total: 0, page, pageSize, totalPages: 0 },
      { status: 500 }
    );
  }
}

function normalizeItem(item: any) {
  // tags: handle array or JSON string
  let tags: string[] = [];
  if (Array.isArray(item.tags)) tags = item.tags;
  else if (typeof item.tags === 'string' && item.tags.length > 0) {
    try { tags = JSON.parse(item.tags); } catch { tags = []; }
  }

  // slug fallback
  const slug = item.slug || `news-${item.id}`;

  // industry: prefer industry_id, fall back to industry_slug
  const industry_id = item.industry_id || item.industry_slug || '';

  return {
    id:               item.id,
    title:            item.title ?? '',
    slug,
    summary:          item.summary ?? null,
    content:          item.content ?? null,
    industry_id,
    industry_slug:    item.industry_slug ?? industry_id,
    sub_sector_id:    item.sub_sector_id ?? null,
    company_id:       item.company_id ?? null,
    source_name:      item.source_name ?? null,
    source_url:       item.source_url ?? null,
    author:           item.author ?? null,
    cover_image_url:  item.cover_image_url ?? null,
    tags,
    is_premium:       item.is_premium  ?? false,
    is_featured:      item.is_featured ?? false,
    is_published:     item.is_published !== false,
    published_at:     item.published_at ?? item.created_at,
    created_at:       item.created_at,
    updated_at:       item.updated_at ?? null,
  };
}
