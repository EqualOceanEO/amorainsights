import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminSidebar from './AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Not logged in → redirect to login
  if (!session) {
    redirect('/login?callbackUrl=/admin');
  }

  // Logged in but not admin → 403
  if (!(session.user as { isAdmin?: boolean }).isAdmin) {
    redirect('/403');
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
