import { useSession } from '../auth/AuthGate';
import { BackendTestSection, TokenSection } from '../components/session/SessionInfo';
import ApiDataTest from '../components/session/ApiDataTest';

// Ruta /session: muestra el token de Entra ID y lo prueba contra el BFF
export default function SessionComponent() {
  const session = useSession();
  return (
    <div>
      <h2>Mi sesión</h2>
      <p className="muted">Así llega el login de Microsoft Entra ID a la aplicación: el access token, sus datos y las pruebas contra el BFF.</p>
      <TokenSection session={session} />
      <BackendTestSection session={session} />
      <ApiDataTest session={session} />
    </div>
  );
}
