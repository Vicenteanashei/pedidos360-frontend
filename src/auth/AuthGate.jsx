import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { tokenRequest } from './authConfig';
import { getAccessToken } from './token';

const message = (e) => (e instanceof Error ? e.message : String(e));

// Estado de la sesion con Entra ID: cuenta, login/logout y access token para las llamadas al backend
export function useSession() {
  const { instance, accounts, inProgress } = useMsal();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const account = accounts[0];


  async function login() {
    setBusy(true);
    setError('');
    try {
      await instance.loginPopup({ ...tokenRequest, prompt: 'select_account' });
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }

  return {
    account,
    username: account?.username ?? '',
    busy: busy || inProgress !== InteractionStatus.None,
    error,
    login,
    // El popup tiene que volver a redirect.html (el puente) para avisar a la ventana principal; si vuelve a la app,
    // MSAL se queda esperando y hay que cerrar el popup y pulsar de nuevo. logoutHint evita el selector de cuenta.
    logout: () => instance.logoutPopup({
      account,
      logoutHint: account?.idTokenClaims?.login_hint,
      postLogoutRedirectUri: `${window.location.origin}/redirect.html`,
      mainWindowRedirectUri: '/login',
    }),
    getToken: () => getAccessToken(instance, account),
  };
}
