import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

async function requireAdmin(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (INTERNAL_API_SECRET && secret === INTERNAL_API_SECRET) return true;
  const session = await auth();
  if (!session?.user) return { error: 'Unauthorized', status: 401 };
  const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin ?? false;
  if (!isAdmin) return { error: 'Admin access required', status: 403 };
  return true;
}

/**
 * GET /api/admin/subscribers/[id]
 * Get single subscriber details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(req);
  if (authResult !== true) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('id', parseInt(id))
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });

  return NextResponse.json({ data });
}

/**
 * PATCH /api/admin/subscribers/[id]
 * Update subscriber fields: confirmed, unsubscribed, plan, plan_status, source
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(req);
  if (authResult !== true) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;
  const body = await req.json();

  // Only allow these fields to be updated by admin
  const allowed = ['confirmed', 'unsubscribed', 'plan', 'plan_status', 'source'];
  const updates: Record<string, unknown> = {};

  for (const key of allowed) {
    if (key in body) {
      updates[key] = body[key];
    }
  }

  // Auto-set confirmed_at when confirming
  if (body.confirmed === true) {
    updates.confirmed_at = new Date().toISOString();
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('subscribers')
    .update(updates)
    .eq('id', parseInt(id))
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });

  return NextResponse.json({ data });
}

/**
 * DELETE /api/admin/subscribers/[id]
 * Remove a subscriber record
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(req);
  if (authResult !== true) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;
  const { error } = await supabase
    .from('subscribers')
    .delete()
    .eq('id', parseInt(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
