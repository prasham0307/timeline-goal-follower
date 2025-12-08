import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-lg border-b-4 border-gradient-to-r from-blue-500 to-indigo-500 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <span className="text-3xl transform group-hover:scale-110 transition-transform">🎯</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Timeline Goal Follower
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">
                  {user?.name || user?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-sm flex items-center gap-2"
              >
                <span>🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
