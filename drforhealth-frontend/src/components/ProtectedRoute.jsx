import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // ------------------------------------------------------------
  // Authentication state is still being checked
  // ------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin" />

          <p className="text-gray-600 text-sm">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // User is not authenticated
  // Save the current location so it can be used after login
  // ------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  // ------------------------------------------------------------
  // User is authenticated
  // ------------------------------------------------------------
  return children;
}