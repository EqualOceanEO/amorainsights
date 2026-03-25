import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

/** GET /api/news/[slug] — fetch single news item by slug or numeric id */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    let data: any = null;
    let error: any = null;

    // Try numeric id first
    const numericId = parseInt(slug, 10);
    if (!isNaN(numericId) && String(numericId) === slug) {
      ({ data, error } = await supabase
        .from('news_items')
        .select('*')
        .eq('id', numericId)
        .maybeSingle());
    }

    // Then try slug column
    if (!data && !error) {
      ({ data, error } = await supabase
        .from('news_items')
        .select('*')
        .eq('slug', slug)
        .maybeSingle());
    }

    // Fallback: match "news-{id}" pattern
    if (!data && slug.startsWith('news-')) {
      const idPart = parseInt(slug.replace('news-', ''), 10);
      if (!isNaN(idPart)) {
        ({ data, error } = await supabase
          .from('news_items')
          .select('*')
          .eq('id', idPart)
          .maybeSingle());
      }
    }

    if (error) {
      console.error('[API /news/[slug]] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Normalize
    let tags: string[] = [];
    if (Array.isArray(data.tags)) {
      tags = data.tags;
    } else if (typeof data.tags === 'string' && data.tags.length > 0) {
      try { tags = JSON.parse(data.tags); } catch {
        tags = data.tags.split(' ').filter(Boolean);
      }
    }

    const industry_id = data.industry_id || data.industry_slug || '';

    return NextResponse.json({
      id:              data.id,
      title:           data.title ?? '',
      slug:            data.slug || `news-${data.id}`,
      summary:         data.summary ?? null,
      content:         data.content ?? null,
      industry_id,
      industry_slug:   data.industry_slug ?? industry_id,
      sub_sector_id:   data.sub_sector_id ?? null,
      company_id:      data.company_id ?? null,
      source_name:     data.source_name ?? null,
      source_url:      data.source_url ?? null,
      author:          data.author ?? null,
      cover_image_url: data.cover_image_url ?? null,
      tags,
      is_premium:      data.is_premium  ?? false,
      is_featured:     data.is_featured ?? false,
      is_published:    data.is_published !== false,
      published_at:    data.published_at ?? data.created_at,
      created_at:      data.created_at,
      updated_at:      data.updated_at ?? null,
    });
  } catch (err: any) {
    console.error('[API /news/[slug]] Unexpected:', err?.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
