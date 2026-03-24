import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    if (!body.title || !body.industry_slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Resolve slug to id for update
    let id: number;
    if (/^\d+$/.test(slug)) {
      id = parseInt(slug, 10);
    } else {
      const { data: existing } = await supabase
        .from('news_items')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      id = existing.id;
    }

    const updateData: Record<string, any> = {
      id,
      title: body.title,
      summary: body.summary || null,
      content: body.content || null,
      industry_slug: body.industry_slug,
      source_name: body.source_name || null,
      source_url: body.source_url || null,
      author: body.author || null,
      cover_image_url: body.cover_image_url || null,
      tags: body.tags || [],
      is_premium: body.is_premium ?? false,
      is_published: body.is_published ?? true,
      is_featured: body.is_featured ?? false,
      published_at: body.published_at || new Date().toISOString(),
    };

    if (body.slug) updateData.slug = body.slug;
    if (body.company_id) updateData.company_id = body.company_id;
    if (body.company_ids) updateData.company_ids = body.company_ids;
    if (body.industry_id) updateData.industry_id = body.industry_id;
    if (body.sub_sector_id) updateData.sub_sector_id = body.sub_sector_id;

    const { data, error } = await supabase
      .from('news_items')
      .upsert(updateData, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    let id: number | null = null;
    if (/^\d+$/.test(slug)) {
      id = parseInt(slug, 10);
    } else {
      const { data } = await supabase
        .from('news_items')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      id = data?.id ?? null;
    }

    if (!id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { data, error } = await supabase
      .from('news_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'News item not found' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
