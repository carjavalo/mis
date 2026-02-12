import { useAuth } from '../providers/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user' | 'editor' | 'super-admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isVerifying, user, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isVerifying && !isLoading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      // Super-admin has access to everything
      if (user?.rol === 'super-admin') {
        return;
      }

      // Check if user has the required role
      if (requiredRole && !hasRole(requiredRole)) {
        if (user?.rol === 'super-admin') {
          navigate('/dashboard-superadmin');
        } else if (user?.rol === 'admin') {
          navigate('/dashboard-admin');
        } else {
          navigate('/dashboard-users');
        }
        return;
      }
    }
  }, [isAuthenticated, isLoading, isVerifying, navigate, requiredRole, hasRole, user]);

  if (isVerifying || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-20 h-20 border-4 border-red-200 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-red-500 rounded-full animate-spin animation-delay-75"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full"></div>
          </div>
          <div className="mt-6 space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">Verificando autenticación</h3>
            <p className="text-gray-600 text-sm">Cargando tu información de usuario...</p>
          </div>
        </div>
      </div>
    );
  }

  // Deny access if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Super-admin has access to everything
  if (user?.rol === 'super-admin') {
    return <>{children}</>;
  }

  // Check if user has required role
  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
