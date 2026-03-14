import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/dashboard'];

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check protected routes — read session cookie
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (isProtected) {
    // NextAuth v5 JWT session cookie names
    const sessionCookie =
      req.cookies.get('authjs.session-token') ||
      req.cookies.get('__Secure-authjs.session-token') ||
      req.cookies.get('next-auth.session-token') ||
      req.cookies.get('__Secure-next-auth.session-token');

    if (!sessionCookie) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
