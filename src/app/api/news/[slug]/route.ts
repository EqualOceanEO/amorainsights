import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // slug can be a numeric id or a text slug
  const isNumeric = /^\d+$/.test(slug);

  let query = supabase.from('news').select('*').eq('is_published', true);
  if (isNumeric) {
    query = query.eq('id', parseInt(slug, 10));
  } else {
    query = query.eq('slug', slug);
  }

  const { data, error } = await query.maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)  return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Related articles: same industry, exclude current
  const { data: related } = await supabase
    .from('news')
    .select('id, title, slug, summary, industry_slug, source_name, published_at, cover_image_url')
    .eq('is_published', true)
    .eq('industry_slug', data.industry_slug)
    .neq('id', data.id)
    .order('published_at', { ascending: false })
    .limit(3);

  return NextResponse.json({ ...data, related: related ?? [] });
}
