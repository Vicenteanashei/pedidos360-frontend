import { useState } from 'react';
import { API_URL } from '../../api/http';
import { decodeClaims } from '../../auth/token';

// Cambia el ultimo caracter de la firma: el token sigue bien formado pero la firma ya no es valida
function tamper(jwt) {
  const last = jwt.slice(-1);
  return jwt.slice(0, -1) + (last === 'A' ? 'B' : 'A');
}

const EXPECTED = { none: 401, valid: 200, tampered: 401, garbage: 401 };

const LABELS = {
  none: 'Sin token',
  valid: 'Token válido',
  tampered: 'Token con firma alterada',
  garbage: 'Token mal formado',
  custom: 'Token pegado',
};

// Pruebas del access token contra GET /api/orders del BFF, desde la pantalla de pedidos
export default function OrderTokenTestComponent({ session }) {
  const [custom, setCustom] = useState('');
  const [result, setResult] = useState('—');
  const [running, setRunning] = useState(false);
  const url = `${API_URL}/api/orders`;

  async function tokenFor(kind) {
    if (kind === 'none') return null;
    if (kind === 'garbage') return 'esto-no-es-un-jwt';
    if (kind === 'custom') return custom.trim().replace(/^Bearer\s+/i, '');
    const token = await session.getToken();
    return kind === 'tampered' ? tamper(token) : token;
  }

  async function call(kind) {
    setRunning(true);
    setResult(`${LABELS[kind]}: llamando a ${url} …`);
    try {
      const token = await tokenFor(kind);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(url, { headers });
      const text = await res.text();

      const expected = EXPECTED[kind];
      let note = '';
      if (expected) note = res.status === expected ? '✔ Resultado esperado.' : `✘ Se esperaba HTTP ${expected}.`;
      if (res.status === 403) note += ' 403: el token no trae el scope access_as_user.';

      let info = '';
      if (token && kind !== 'garbage') {
        try {
          const c = decodeClaims(token);
          info = `\nUsuario: ${c.preferred_username ?? c.upn ?? '?'} · scp: ${c.scp ?? '(ninguno)'} · expira: ${new Date(c.exp * 1000).toLocaleString()}`;
        } catch {
          info = '\n(No se pudieron leer los claims del token)';
        }
      }

      let body = text || '(sin cuerpo)';
      try { body = JSON.stringify(JSON.parse(text), null, 2); } catch { /* no es JSON */ }
      setResult(`${LABELS[kind]} → HTTP ${res.status}\n${note}${info}\n\n${body}`);
    } catch (e) {
      setResult(`No se pudo conectar con el BFF (${e.message}).\n¿Está levantado en ${url}? Si lo está, revisa que CORS permita ${location.origin}.`);
    } finally {
      setRunning(false);
    }
  }

  const noSession = !session.account;

  return (
    <section className="card">
      <h3>Probar tokens contra <code>GET /api/orders</code></h3>
      <p className="muted small">Backend: <code>{API_URL}</code></p>
      <div>
        <button className="btn" onClick={() => call('none')} disabled={running}>Sin token (esperado 401)</button>{' '}
        <button className="btn primary" onClick={() => call('valid')} disabled={running || noSession}>Token válido (esperado 200)</button>{' '}
        <button className="btn" onClick={() => call('tampered')} disabled={running || noSession}>Firma alterada (esperado 401)</button>{' '}
        <button className="btn" onClick={() => call('garbage')} disabled={running}>Mal formado (esperado 401)</button>
      </div>
      <textarea
        className="token-input" rows={3} value={custom} onChange={(e) => setCustom(e.target.value)}
        placeholder="Pega aquí un access token (por ejemplo uno vencido o de otra app) para probarlo"
      />
      <button className="btn" onClick={() => call('custom')} disabled={running || !custom.trim()}>Probar token pegado</button>
      {noSession && <p className="warn small">Inicia sesión para probar con tu token.</p>}
      <pre className="result">{result}</pre>
    </section>
  );
}
