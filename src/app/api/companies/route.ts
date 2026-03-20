import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

/**
 * GET /api/companies
 * Query params:
 *   industry  - industry_slug filter
 *   level2    - sub_sector filter
 *   country   - country code filter
 *   public    - 'true' | 'false'
 *   search    - name search
 *   page      - page number (default 1)
 *   pageSize  - items per page (default 24)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industry  = searchParams.get('industry') || '';
    const level2    = searchParams.get('level2') || '';
    const country   = searchParams.get('country') || '';
    const isPublic  = searchParams.get('public') || '';
    const search    = searchParams.get('search') || '';
    const page      = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize  = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '24', 10)));
    const from      = (page - 1) * pageSize;
    const to        = from + pageSize - 1;

    let query = supabase
      .from('companies')
      .select('*', { count: 'exact' })
      .eq('is_tracked', true)
      .order('name', { ascending: true })
      .range(from, to);

    if (industry)           query = query.eq('industry_slug', industry);
    if (level2)             query = query.eq('sub_sector', level2);
    if (country)            query = query.eq('country', country);
    if (isPublic === 'true')  query = query.eq('is_public', true);
    if (isPublic === 'false') query = query.eq('is_public', false);
    if (search)             query = query.ilike('name', `%${search}%`);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = count ?? 0;
    return NextResponse.json({
      data: data ?? [],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }, { status: 200 });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
