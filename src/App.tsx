import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Layout, AuthLayout } from '@/components/layout';
import {
  Login,
  Signup,
  Onboarding,
  Dashboard,
  HybridDay,
  Finance,
  Coach,
  Wellness,
  Herbs,
  Places,
  Community,
  Motivation,
  Profile,
  Shop,
} from '@/pages';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center animate-pulse">
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
          <p className="text-zinc-500 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has completed onboarding
  if (!user?.onboarding_completed && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

// Public Route wrapper (redirects to dashboard if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center animate-pulse">
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
          <p className="text-zinc-500 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (!user?.onboarding_completed) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes with Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="hybrid-day" element={<HybridDay />} />
          <Route path="finance" element={<Finance />} />
          <Route path="coach" element={<Coach />} />
          <Route path="wellness" element={<Wellness />} />
          <Route path="herbs" element={<Herbs />} />
          <Route path="places" element={<Places />} />
          <Route path="community" element={<Community />} />
          <Route path="motivation" element={<Motivation />} />
          <Route path="profile" element={<Profile />} />
          <Route path="shop" element={<Shop />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
