import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import type { Role } from './RoleSlider';

interface Props {
  children: JSX.Element;
  roles?: Role[];
}

export default function PrivateRoute({ children, roles }: Props) {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && (!role || !roles.includes(role))) {
    return <Navigate to="/" replace />;
  }
  return children;
}
