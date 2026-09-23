import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';

// Ruta /auth/callback: MSAL vuelve aqui tras el login y se redirige al dashboard
export default function AuthCallbackComponent() {
  const { accounts, inProgress } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    if (inProgress !== InteractionStatus.None) return;
    navigate(accounts.length ? '/dashboard' : '/login', { replace: true });
  }, [accounts, inProgress, navigate]);

  return <div className="loading">Completando inicio de sesión…</div>;
}
