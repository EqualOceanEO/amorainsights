import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/news
 * Returns ALL news (including unpublished) for admin
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page     = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const pageSize = 20;
  const industry = searchParams.get('industry') || '';
  const search   = searchParams.get('q') || '';
  const published = searchParams.get('published') || '';

  let q = supabase
    .from('news')
    .select(
      'id,title,slug,summary,industry_slug,company_id,tags,is_premium,is_published,published_at,created_at,source_name,author',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (industry)  q = q.eq('industry_slug', industry);
  if (search)    q = q.ilike('title', `%${search}%`);
  if (published === 'true')  q = q.eq('is_published', true);
  if (published === 'false') q = q.eq('is_published', false);

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

/**
 * POST /api/admin/news — create news article
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title, slug, summary, content, cover_image_url,
    source_url, source_name, author,
    industry_slug, company_id, company_ids,
    tags, is_premium, is_published, published_at,
  } = body;

  if (!title || !slug || !industry_slug) {
    return NextResponse.json(
      { error: 'Missing required fields: title, slug, industry_slug' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('news')
    .insert([{
      title,
      slug,
      summary:         summary || null,
      content:         content || null,
      cover_image_url: cover_image_url || null,
      source_url:      source_url || null,
      source_name:     source_name || null,
      author:          author || null,
      industry_slug,
      company_id:      company_id || null,
      company_ids:     company_ids || [],
      tags:            tags || [],
      is_premium:      is_premium ?? false,
      is_published:    is_published ?? false,
      published_at:    is_published ? (published_at || new Date().toISOString()) : null,
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
