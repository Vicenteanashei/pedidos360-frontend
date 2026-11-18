import { msalInstance } from '../auth/msalInstance';
import { getAccessToken } from '../auth/token';

export const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

// Por defecto toma el token de la cuenta con sesion iniciada en MSAL (asi la primera llamada ya lo lleva)
let tokenProvider = async () => {
  const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
  return account ? getAccessToken(msalInstance, account) : null;
};

export function setTokenProvider(provider) {
  tokenProvider = provider;
}

const STATUS_MESSAGES = {
  401: 'Tu sesión no es válida o expiró. Cierra sesión y vuelve a entrar.',
  403: 'El token no tiene permiso para usar la API (falta scope o rol autorizado).',
};

export async function request(path, { method = 'GET', body, signal } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = await tokenProvider();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error(`No se pudo conectar con el backend (${API_URL}). ¿Está levantado?`);
  }

  if (res.status === 204) return null;
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (res.ok) throw new Error(`La API devolvió una respuesta que no es JSON para ${path}.`);
    }
  }
  if (!res.ok) {
    throw new Error(data?.detail ?? STATUS_MESSAGES[res.status] ?? `Error ${res.status} llamando a ${path}`);
  }
  return data;
}
