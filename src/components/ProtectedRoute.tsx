import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'dosen' | 'mahasiswa';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('No user found, redirecting to auth');
        navigate('/auth');
        return;
      }

      if (requiredRole && profile?.role !== requiredRole) {
        console.log(`User role ${profile?.role} doesn't match required role ${requiredRole}, redirecting to /`);
        navigate('/');
        return;
      }
    }
  }, [user, profile, loading, navigate, requiredRole]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}