import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardSidebar from './DashboardSidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const user = session.user as { id?: string; email?: string; name?: string; isAdmin?: boolean; subscriptionTier?: string };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <DashboardSidebar isAdmin={user.isAdmin ?? false} />
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-950/80 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile: back to home */}
              <Link href="/" className="text-lg font-bold tracking-tight lg:hidden">
                Amora<span className="text-blue-400">Insights</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 hidden sm:inline">{user.email}</span>
              {user.subscriptionTier === 'pro' && (
                <span className="text-xs bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-medium">
                  PRO
                </span>
              )}
              <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }); }}>
                <button
                  type="submit"
                  className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
