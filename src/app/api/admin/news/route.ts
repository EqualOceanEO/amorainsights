import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

/** GET /api/admin/news */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const industry = searchParams.get('industry') || '';
  const search   = searchParams.get('search')   || '';
  const page     = Math.max(1, parseInt(searchParams.get('page')     || '1', 10));
  const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') || '20', 10));
  const offset   = (page - 1) * pageSize;

  let query = supabase
    .from('news_items')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (industry) {
    query = query.or(`industry_id.eq.${industry},industry_slug.eq.${industry}`);
  }
  if (search) query = query.ilike('title', `%${search}%`);

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

/** POST /api/admin/news */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title, summary, content, source_url, source_name, author,
    cover_image_url, industry_id, industry_slug, sub_sector_id,
    company_id, slug, tags, is_premium, is_published, is_featured, published_at,
  } = body;

  if (!title) {
    return NextResponse.json({ error: 'Missing required field: title' }, { status: 400 });
  }

  // Derive industry fields
  const resolvedIndustryId    = industry_id    || industry_slug || null;
  const resolvedIndustrySlug  = industry_slug  || industry_id   || null;

  // Build slug from title if not provided
  const resolvedSlug = slug || `news-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const insertData: Record<string, any> = {
    title,
    summary:          summary         || null,
    content:          content         || null,
    source_url:       source_url      || null,
    source_name:      source_name     || null,
    author:           author          || null,
    cover_image_url:  cover_image_url || null,
    industry_id:      resolvedIndustryId,
    industry_slug:    resolvedIndustrySlug,
    sub_sector_id:    sub_sector_id   || null,
    company_id:       company_id      || null,
    slug:             resolvedSlug,
    tags:             Array.isArray(tags) ? tags : [],
    is_premium:       is_premium   ?? false,
    is_published:     is_published ?? true,
    is_featured:      is_featured  ?? false,
    published_at:     published_at  || new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('news_items')
    .insert([insertData])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
