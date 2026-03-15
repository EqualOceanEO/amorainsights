import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from '@/lib/db';

const PROTECTED_PATHS = ['/dashboard'];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await getUserByEmail(credentials.email as string);
        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          // Pass subscription tier into JWT so all pages can read it without a DB call
          subscriptionTier: user.subscription_tier ?? 'free',
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Persist subscription tier in JWT (Franklyn schema 2026-03-15)
        token.subscriptionTier = (user as { subscriptionTier?: string }).subscriptionTier ?? 'free';
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id as string;
      if (token?.subscriptionTier) {
        (session.user as { subscriptionTier?: string }).subscriptionTier = token.subscriptionTier as string;
      }
      return session;
    },
    async authorized({ auth: session, request }) {
      const pathname = request.nextUrl.pathname;
      const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
      // Block unauthenticated access to protected pages
      if (isProtected && !session) return false;
      return true;
    },
  },
});
