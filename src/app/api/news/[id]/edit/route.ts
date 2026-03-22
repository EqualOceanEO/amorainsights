import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.industry_slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build update object - fields matching the 'news' table schema
    const updateData: Record<string, any> = {
      id: parseInt(id),
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

    // Add optional fields only if they exist in the request
    if (body.slug) updateData.slug = body.slug;
    if (body.company_id) updateData.company_id = body.company_id;
    if (body.company_ids) updateData.company_ids = body.company_ids;

    // Upsert news item
    const { data, error } = await supabase
      .from('news')
      .upsert(updateData, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET single news item for editing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'News item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
