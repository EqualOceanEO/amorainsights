import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/news/[slug]
 * Returns full news article by slug (published only)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Fetch related company info if company_id exists
  let company = null;
  if (data.company_id) {
    const { data: co } = await supabase
      .from('companies')
      .select('id,name,name_cn,industry_slug,ticker,country,hq_city')
      .eq('id', data.company_id)
      .maybeSingle();
    company = co;
  }

  return NextResponse.json({ ...data, company });
}
