import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-700 mb-4">403</p>
        <h1 className="text-xl font-semibold text-white mb-2">Access Denied</h1>
        <p className="text-gray-500 text-sm mb-6">
          You don&apos;t have permission to access this page.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
