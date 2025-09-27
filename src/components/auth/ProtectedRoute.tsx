import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../ui/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'entrepreneur' | 'client';
  requiredPermissions?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requiredPermissions = [] 
}) => {
  const { user, loading } = useAuth();

  // Debug logs
  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - Required Role:', requiredRole);
  console.log('ProtectedRoute - Loading:', loading);

  if (loading) {
    return <LoadingScreen message="Vérification des permissions..." />;
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log(`ProtectedRoute - Role mismatch: user has ${user.role}, required ${requiredRole}`);
    return <Navigate to="/auth/unauthorized" replace />;
  }

  if (requiredPermissions.length > 0) {
    const hasPermissions = requiredPermissions.every(permission =>
      user.permissions.includes(permission) || user.permissions.includes('*')
    );

    if (!hasPermissions) {
      return <Navigate to="/auth/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;