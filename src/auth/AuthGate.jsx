import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { identityConfigured, tokenRequest } from './authConfig';
import { getAccessToken } from './token';

const message = (e) => (e instanceof Error ? e.message : String(e));

// Estado de la sesion con Entra ID: cuenta, login/logout y access token para las llamadas al backend
export function useSession() {
  const { instance, accounts, inProgress } = useMsal();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const account = accounts[0];


  async function login() {
    if (!identityConfigured) { setError("El acceso con Microsoft está pendiente de configuración."); return; }
    setBusy(true);
    setError('');
    try {
      await instance.loginRedirect({ ...tokenRequest, prompt: 'select_account' });
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
    // Los flujos interactivos usan la pestaña completa; el puente devuelve a la app.
    logout: () => instance.logoutRedirect({
      account,
      logoutHint: account?.idTokenClaims?.login_hint,
      postLogoutRedirectUri: `${window.location.origin}/redirect.html`,
    }),
    getToken: () => getAccessToken(instance, account),
  };
}
