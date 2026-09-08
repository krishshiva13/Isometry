import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Route protection wrapper that ensures only verified administrators
 * can access held or restricted modules (such as Exam Prep & Magazine).
 * Unauthenticated users or non-admins are immediately redirected to home.
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-paper px-4 text-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono text-ink3">Verifying administrator access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    // Hidden & restricted: non-admin visitors are bounced to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
