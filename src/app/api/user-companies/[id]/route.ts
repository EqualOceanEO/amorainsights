import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserCompanyById, updateUserCompany, deleteUserCompany } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = parseInt((session.user as any).id ?? '0');
  const { id } = await params;

  try {
    const company = await getUserCompanyById(parseInt(id), userId);
    if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: company });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = parseInt((session.user as any).id ?? '0');
  const { id } = await params;

  try {
    const body = await req.json();
    const company = await updateUserCompany(parseInt(id), userId, body);
    return NextResponse.json({ data: company });
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
    await deleteUserCompany(parseInt(id), userId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
