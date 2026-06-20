import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createUserCompany, getUserCompanies } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = parseInt((session.user as any).id ?? '0');

  try {
    const companies = await getUserCompanies(userId);
    return NextResponse.json({ data: companies });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = parseInt((session.user as any).id ?? '0');

  try {
    const body = await req.json();
    const company = await createUserCompany(userId, body);
    return NextResponse.json({ data: company }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
