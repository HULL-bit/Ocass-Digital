import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export const usePermissions = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Check if user has wildcard permission
    if (user.permissions.includes('*')) return true;
    
    // Check specific permission
    return user.permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const canAccess = (resource: string, action: string): boolean => {
    const permission = `${resource}:${action}`;
    return hasPermission(permission);
  };

  return {
    user,
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccess,
    isAdmin: hasRole('admin'),
    isEntrepreneur: hasRole('entrepreneur'),
    isClient: hasRole('client'),
  };
};