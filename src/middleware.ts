export { auth as default } from '@/lib/auth';

export const config = {
  // Exclude API routes, static files and images — only protect pages
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
