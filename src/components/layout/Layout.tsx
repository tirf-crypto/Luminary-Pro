import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, MobileHeader } from './Sidebar';
import { BottomNav } from './BottomNav';
import { ToastContainer } from '@/components/ui';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar - desktop */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <MobileHeader />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>

        {/* Bottom navigation - mobile only */}
        <BottomNav />
      </div>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};

// Auth layout (for login/signup pages)
export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <svg
              className="w-6 h-6 text-zinc-950"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
          <span className="text-2xl font-bold text-zinc-100">Luminary</span>
        </div>

        {/* Content */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-500 mt-6">
          By continuing, you agree to our{' '}
          <a href="#" className="text-amber-400 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-amber-400 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};
