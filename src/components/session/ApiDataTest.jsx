import { useState } from 'react';
import { API_URL } from '../../api/http';

// Seccion 4: prueba 2 del tutorial — solicitud con token valido a GET /api/data
export default function ApiDataTest({ session }) {
  const [result, setResult] = useState('—');
  const url = `${API_URL}/api/data`;

  async function call() {
    setResult(`Llamando a ${url} …`);
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${await session.getToken()}` } });
      const text = await res.text();
      let note = '';
      if (res.status === 200) note = '✔ Resultado esperado: acceso autorizado.';
      else if (res.status === 401) note = '✘ 401: el BFF rechazó el token (inválido, vencido o mal formado).';
      else if (res.status === 403) note = '✘ 403: el token no trae el scope access_as_user, o el BFF no tiene /api/data (reinícialo).';
      let body = text || '(sin cuerpo)';
      try { body = JSON.stringify(JSON.parse(text), null, 2); } catch { /* no es JSON */ }
      setResult(`HTTP ${res.status}\n${note}\n\n${body}`);
    } catch (e) {
      setResult(`No se pudo conectar con el BFF (${e.message}).\n¿Está levantado en ${url}?`);
    }
  }

  return (
    <section className="section">
      <h2>Prueba 2: solicitud con token válido</h2>
      <p className="muted small">
        Llama a <code>GET /api/data</code> del BFF con el access token. Resultado esperado: <b>HTTP 200</b> y un JSON con
        el mensaje <i>Acceso autorizado a Spring Boot</i>.
      </p>
      <button className="btn primary" onClick={call} disabled={!session.account}>Probar GET /api/data con token</button>
      {!session.account && <p className="warn small">Primero inicia sesión.</p>}
      <pre className="result">{result}</pre>
    </section>
  );
}
