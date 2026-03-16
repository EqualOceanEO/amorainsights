export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Sign Up</h1>
        <p className="text-gray-400 mb-8">Choose your plan to get started</p>
        <div className="space-y-4">
          <a
            href="/subscribe"
            className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition"
          >
            Start Free Trial
          </a>
          <a
            href="/subscribe/pro"
            className="block w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition"
          >
            View Pro Plan
          </a>
        </div>
        <p className="text-xs text-gray-600 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-blue-400 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
