import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userName = session.user.name || session.user.email?.split('@')[0] || 'Researcher';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top nav */}
      <header className="border-b border-gray-800 bg-gray-900/60 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Amora<span className="text-blue-400">Insights</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{session.user.email}</span>
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

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold">Welcome back, {userName}</h1>
          <p className="text-gray-400 mt-1">Here&apos;s your China innovation intelligence hub.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Reports Available', value: '24' },
            { label: 'Companies Tracked', value: '1,200+' },
            { label: 'Industries Covered', value: '6' },
            { label: 'News Today', value: '18' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-2xl font-bold text-blue-400">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Industry cards */}
        <h2 className="text-lg font-semibold mb-4">Six Future Industries</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {[
            { name: 'Future Information', icon: '🖥️', reports: 6, badge: 'Active' },
            { name: 'Future Health',       icon: '🧬', reports: 4, badge: 'Active' },
            { name: 'Future Energy',       icon: '⚡', reports: 5, badge: 'Active' },
            { name: 'Future Space',        icon: '🚀', reports: 3, badge: 'Active' },
            { name: 'Future Materials',    icon: '🔬', reports: 3, badge: 'Active' },
            { name: 'Future Manufacturing',icon: '🏭', reports: 3, badge: 'Active' },
          ].map((industry) => (
            <div
              key={industry.name}
              className="bg-gray-900 border border-gray-800 hover:border-blue-600 rounded-xl p-5 cursor-pointer transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{industry.icon}</span>
                <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">
                  {industry.badge}
                </span>
              </div>
              <h3 className="font-semibold text-white group-hover:text-blue-300 transition">
                {industry.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{industry.reports} reports</p>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <h2 className="text-lg font-semibold mb-4">Recent Insights</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
          {[
            { title: "China's EV battery supply chain dominance",  industry: 'Future Energy',       time: '2h ago' },
            { title: 'Humanoid robot commercialisation in 2026',   industry: 'Future Manufacturing', time: '5h ago' },
            { title: 'Quantum computing milestones — Q1 2026',     industry: 'Future Information',  time: '1d ago' },
            { title: 'CRISPR therapy approvals accelerate',        industry: 'Future Health',        time: '2d ago' },
          ].map((item) => (
            <div key={item.title} className="px-5 py-4 hover:bg-gray-800/50 transition cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.industry}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
