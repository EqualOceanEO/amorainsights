import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

/**
 * GET /api/companies
 * Query params:
 *   industry  - industry_id (integer) filter
 *   level2    - sub_sector_id (integer) filter
 *   country   - country code filter
 *   public    - 'true' | 'false'
 *   search    - name search
 *   page      - page number (default 1)
 *   pageSize  - items per page (default 24)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const industry   = searchParams.get('industry')    || '';  // industry slug e.g. 'new-space'
    const level2     = searchParams.get('level2')       || '';  // L2 name string e.g. 'Launch Vehicles'
    const country    = searchParams.get('country')      || '';
    const isPublic   = searchParams.get('public')       || '';
    const search     = searchParams.get('search')       || '';
    const sortBy     = searchParams.get('sortBy')       || 'name';
    const page       = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize   = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '24', 10)));
    const from       = (page - 1) * pageSize;
    const to         = from + pageSize - 1;

    let query = supabase
      .from('companies')
      .select('id, name, name_cn, slug, industry_id, industry_slug, sub_sector_id, sub_sector, description, country, is_public, tags, founded_year, employee_count, amora_total_score, amora_advancement_score, amora_mastery_score, amora_operations_score, amora_reach_score, amora_affinity_score', { count: 'exact' })
      .eq('is_tracked', true)
      .order(sortBy === 'amora' ? 'amora_total_score' : 'name', {
        ascending: sortBy === 'amora' ? false : true,
        nullsFirst: sortBy === 'amora' ? true : false,
      })
      .range(from, to);

    if (industry)             query = query.eq('industry_slug', industry);
    if (level2)               query = query.eq('sub_sector', level2);
    if (country)              query = query.eq('country', country);
    if (isPublic === 'true')  query = query.eq('is_public', true);
    if (isPublic === 'false') query = query.eq('is_public', false);
    if (search)               query = query.ilike('name', `%${search}%`);

    const { data, error, count } = await query;

    const queryTime = Date.now() - startTime;
    console.log(`[API companies] Query time: ${queryTime}ms, returned: ${data?.length ?? 0} items, total: ${count ?? 0}`);

    if (error) {
      console.error('[API companies] Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten: sub_sector already selected directly from column
    const flattenedData = data?.map(company => ({
      ...company,
      industry_slug: company.industry_slug ?? '',
      sub_sector: company.sub_sector ?? null,
    })) ?? [];

    const total = count ?? 0;
    return NextResponse.json({
      data: flattenedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }, { status: 200 });
  } catch (err) {
    const errorTime = Date.now() - startTime;
    console.error('[API companies] Unexpected error after', errorTime, 'ms:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
