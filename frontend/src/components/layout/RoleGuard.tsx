import type { ReactNode } from 'react';
import type { Role } from '../../types';
import { useRoleAccess } from '../../hooks/useRoleAccess';

interface Props {
  roles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ roles, children, fallback = null }: Props) {
  const { can } = useRoleAccess();
  return can(roles) ? <>{children}</> : <>{fallback}</>;
}
