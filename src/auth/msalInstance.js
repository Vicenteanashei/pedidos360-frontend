import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './authConfig';

// Unica instancia de MSAL de la app (la usan MsalProvider y las llamadas HTTP)
export const msalInstance = new PublicClientApplication(msalConfig);
