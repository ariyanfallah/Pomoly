import { Link } from "react-router";
import { useAuth } from "../../contexts/AuthContext";


export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Welcome to TikoTocka</h1>
          <div className="mt-12 space-y-6">
            {user ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user.email}!
                </h2>
                <p className="text-lg text-gray-600">
                  You're successfully authenticated with Supabase.
                </p>
                <div className="flex justify-center space-x-4">
                  <Link
                    to="/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Get Started with TikoTocka
                </h2>
                <p className="text-lg text-gray-600">
                  Sign in or create an account to access your personalized dashboard.
                </p>
                <div className="flex justify-center space-x-4">
                  <Link
                    to="/auth"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Sign In / Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure Authentication
              </h3>
              <p className="text-gray-600">
                Built with Supabase Auth for enterprise-grade security and reliability.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Real-time Database
              </h3>
              <p className="text-gray-600">
                Powered by Supabase for real-time data synchronization and storage.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Modern UI
              </h3>
              <p className="text-gray-600">
                Beautiful, responsive interface built with React Router and Tailwind CSS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
