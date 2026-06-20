import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByEmail } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/tier
 * Returns the user's subscription_tier directly from DB.
 * This bypasses JWT caching issues where the tier might be stale.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ tier: 'free' });
  }

  try {
    const user = await getUserByEmail(session.user.email);
    return NextResponse.json({ tier: user?.subscription_tier ?? 'free' });
  } catch {
    return NextResponse.json({ tier: 'free' });
  }
}
