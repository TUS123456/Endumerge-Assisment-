import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../types';

export function useRoleAccess() {
  const { user } = useAuth();

  function can(roles: Role[]): boolean {
    if (!user) return false;
    return roles.includes(user.role);
  }

  const isAdmin = user?.role === 'ADMIN';
  const isOfficer = user?.role === 'ADMISSION_OFFICER';
  const isManagement = user?.role === 'MANAGEMENT';
  const canWrite = isAdmin || isOfficer;

  return { can, isAdmin, isOfficer, isManagement, canWrite };
}
