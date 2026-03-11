import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Amora Insights
            </Link>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {session.user?.name}
              </span>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Welcome back, {session.user?.name}! 👋
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Here's what's happening with your Amora Insights dashboard.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Reports Viewed
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              0
            </div>
            <div className="text-sm text-green-600 mt-1">
              +0 this week
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Account Type
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              Free Trial
            </div>
            <div className="text-sm text-slate-500 mt-1">
              Upgrade for full access
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Days Remaining
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              14
            </div>
            <div className="text-sm text-slate-500 mt-1">
              Free trial period
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/industries"
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-500 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="text-3xl mb-4">📊</div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Browse Industries
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Explore insights across different sectors
              </p>
            </Link>

            <Link
              href="/about"
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-500 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="text-3xl mb-4">ℹ️</div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                About Us
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Learn about our mission and team
              </p>
            </Link>

            <div className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-500 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950 cursor-pointer">
              <div className="text-3xl mb-4">💳</div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Upgrade Plan
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Get unlimited access to all reports
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Recent Activity
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🎯</div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                No recent activity yet
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Start exploring to see your activity here
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
