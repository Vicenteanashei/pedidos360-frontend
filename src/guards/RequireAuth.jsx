import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { Navigate, useLocation } from 'react-router-dom';

// Guard de rutas: sin sesion de Entra ID redirige a /login
export default function RequireAuth({ children }) {
  const { accounts, inProgress } = useMsal();
  const location = useLocation();

  if (accounts.length === 0) {
    if (inProgress !== InteractionStatus.None) return <div className="loading">Verificando sesión…</div>;
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
