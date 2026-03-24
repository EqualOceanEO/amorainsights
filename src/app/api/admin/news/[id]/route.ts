import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

/** GET /api/admin/news/[id] */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const { data, error } = await supabase
    .from('news_items')
    .select('*')
    .eq('id', numericId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)  return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

/** PATCH /api/admin/news/[id] */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const body = await req.json();
  body.updated_at = new Date().toISOString();

  // Remove fields that shouldn't be directly patched
  delete body.id;
  delete body.created_at;

  const { data, error } = await supabase
    .from('news_items')
    .update(body)
    .eq('id', numericId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** DELETE /api/admin/news/[id] */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const { error } = await supabase
    .from('news_items')
    .delete()
    .eq('id', numericId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
