import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/session
 * Returns the current session data for client-side consumption.
 * Used by SiteNav and other client components to check auth state.
 */
export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      subscriptionTier: (session.user as { subscriptionTier?: string }).subscriptionTier ?? 'free',
      isAdmin: (session.user as { isAdmin?: boolean }).isAdmin ?? false,
    },
  });
}
