import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateBenchmarkGroup, deleteBenchmarkGroup } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = parseInt((session.user as any).id ?? '0');
  const { id } = await params;

  try {
    const body = await req.json();
    const group = await updateBenchmarkGroup(parseInt(id), userId, body);
    return NextResponse.json({ data: group });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = parseInt((session.user as any).id ?? '0');
  const { id } = await params;

  try {
    await deleteBenchmarkGroup(parseInt(id), userId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
