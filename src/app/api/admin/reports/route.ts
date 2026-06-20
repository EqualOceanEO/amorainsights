import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET /api/admin/reports?page=1&industry=ai&status=draft&search=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page     = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const pageSize = 20;
  const industry = searchParams.get('industry') || '';
  const status   = searchParams.get('status') || '';
  const search   = searchParams.get('search') || '';

  let q = supabase
    .from('reports')
    .select(
      'id,title,slug,industry_slug,is_premium,report_type,report_level,overall_grade,production_status,scoring_frozen,data_cutoff_date,published_at,created_at,word_count',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (industry) q = q.eq('industry_slug', industry);
  if (status)   q = q.eq('production_status', status);
  if (search)   q = q.ilike('title', `%${search}%`);

  const { data, error, count } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, total: count ?? 0, page, pageSize });
}

// POST /api/admin/reports — create
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title, slug, summary, content, cover_image_url, industry_slug,
    is_premium, author, tags, report_type, report_level,
    overall_grade, word_count, production_status, data_cutoff_date,
    scoring_frozen, compliance_tier, tech_domain,
    // H5/HTML format fields (George, 2026-03-15)
    report_format, html_content,
  } = body;

  if (!title || !slug || !summary || !industry_slug) {
    return NextResponse.json({ error: 'Missing required fields: title, slug, summary, industry_slug' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('reports')
    .insert([{
      title, slug, summary, content: content || null,
      cover_image_url: cover_image_url || null,
      industry_slug,
      is_premium:        is_premium ?? false,
      author:            author || null,
      tags:              tags || [],
      report_type:       report_type || 'standard',
      report_level:      report_level ?? 2,
      overall_grade:     overall_grade || null,
      word_count:        word_count || null,
      production_status: production_status || 'draft',
      data_cutoff_date:  data_cutoff_date || null,
      scoring_frozen:    scoring_frozen ?? false,
      compliance_tier:   compliance_tier || 'STANDARD',
      tech_domain:       tech_domain || null,
      // H5/HTML format
      report_format:     report_format || 'markdown',
      html_content:      html_content || null,
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// POST /api/admin/reports/upload-h5 — handled by [id]/route.ts PATCH for existing,
// or here for standalone upload. This endpoint accepts multipart/form-data with
// a .html file and returns the extracted html_content as JSON.
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!file.name.endsWith('.html') && file.type !== 'text/html') {
      return NextResponse.json({ error: 'Only .html files are accepted' }, { status: 400 });
    }
    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 });
    }
    const html = await file.text();
    return NextResponse.json({ html_content: html, size: file.size, name: file.name });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
