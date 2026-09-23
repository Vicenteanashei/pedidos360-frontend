import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../auth/AuthGate';

function MicrosoftLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

// Ruta /login (publica): inicia sesion con Azure AD / Entra ID mediante MSAL
export default function LoginComponent() {
  const session = useSession();
  const location = useLocation();
  if (session.account) return <Navigate to={location.state?.from || '/dashboard'} replace />;

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Pedidos360</h1>
        <p className="muted">Gestión de pedidos y despacho para la red de panaderías y cafés</p>
        <button className="btn primary ms-btn" onClick={session.login} disabled={session.busy}>
          <MicrosoftLogo />
          {session.busy ? 'Conectando…' : 'Iniciar sesión con Microsoft'}
        </button>
        {session.error && <p className="error">Error: {session.error}</p>}
        <p className="muted small">Se abrirá una ventana de Microsoft. Al terminar vuelves automáticamente a la aplicación.</p>
      </div>
    </div>
  );
}
