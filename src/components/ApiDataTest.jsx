import { useState } from 'react';
import { API_URL } from '../api/http';

function CopyBlock({ code }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="code-block">
      <pre>{code}</pre>
      <button className="btn small" onClick={copy}>{copied ? '¡Copiado!' : 'Copiar'}</button>
    </div>
  );
}

// Seccion 4: prueba 2 del tutorial (5.8) — solicitud con token valido a GET /api/data
export default function ApiDataTest({ session }) {
  const [result, setResult] = useState('—');
  const [copiedToken, setCopiedToken] = useState(false);
  const url = `${API_URL}/api/data`;

  async function call() {
    setResult(`Llamando a ${url} …`);
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${await session.getToken()}` } });
      const text = await res.text();
      let note = '';
      if (res.status === 200) note = '✔ Resultado esperado: acceso autorizado.';
      else if (res.status === 401) note = '✘ 401: el BFF rechazó el token (inválido, vencido o mal formado).';
      else if (res.status === 403) note = '✘ 403: el token no trae el scope access_as_user.';
      let body = text || '(sin cuerpo)';
      try { body = JSON.stringify(JSON.parse(text), null, 2); } catch { /* no es JSON */ }
      setResult(`HTTP ${res.status}\n${note}\n\n${body}`);
    } catch (e) {
      setResult(`No se pudo conectar con el BFF (${e.message}).\n¿Está levantado en ${url}?`);
    }
  }

  async function copyToken() {
    await navigator.clipboard.writeText(await session.getToken());
    setCopiedToken(true);
  }

  const powershell1 = '$tokenPrueba = Read-Host "Pegue el access token de prueba"';
  const powershell2 = `curl.exe -i -H "Authorization: Bearer $tokenPrueba" \`\n  ${url}\nRemove-Variable tokenPrueba`;
  const linux1 = 'read -rsp "Pegue el access token de prueba: " tokenPrueba; echo';
  const linux2 = `curl -i -H "Authorization: Bearer $tokenPrueba" \\\n  ${url}\nunset tokenPrueba`;

  return (
    <section className="section">
      <h2>4. Prueba 2: solicitud con token válido</h2>
      <p className="muted small">
        Llama a <code>GET /api/data</code> del BFF con el access token. Resultado esperado: <b>HTTP 200</b> y un JSON con
        el mensaje <i>Acceso autorizado a Spring Boot</i>.
      </p>

      <button className="btn primary" onClick={call} disabled={!session.account}>Probar GET /api/data con token</button>
      <button className="btn" onClick={copyToken} disabled={!session.account}>
        {copiedToken ? '¡Token copiado! (no lo compartas)' : 'Copiar access token'}
      </button>
      {!session.account && <p className="warn small">Primero inicia sesión.</p>}
      <pre className="result">{result}</pre>

      <h3 className="mt">Hacer la misma prueba desde la terminal</h3>
      <p className="muted small">
        Desde la terminal CORS no interviene. Copia el token con el botón de arriba y sigue los pasos.
      </p>

      <h4>PowerShell (Windows)</h4>
      <ol className="steps">
        <li>
          Ejecuta <b>primero</b> esta línea y presiona Enter:
          <CopyBlock code={powershell1} />
          PowerShell mostrará <code>Pegue el access token de prueba:</code>. Recién ahí pega el token con Ctrl+V y presiona Enter.
        </li>
        <li>
          Después ejecuta:
          <CopyBlock code={powershell2} />
        </li>
      </ol>

      <h4>Terminal (Linux / macOS)</h4>
      <ol className="steps">
        <li>
          Ejecuta esta línea; cuando pida el token, pégalo (no se verá mientras escribes) y presiona Enter:
          <CopyBlock code={linux1} />
        </li>
        <li>
          Después ejecuta:
          <CopyBlock code={linux2} />
        </li>
      </ol>

      <div className="note">
        <b>Importante:</b> pega solo el JWT (empieza con <code>eyJ</code>). No escribas <code>Bearer</code> y no pongas el
        token en la misma línea que <code>Read-Host</code>. Si haces <code>$tokenPrueba = Read-Host eyJ...</code>, el token
        se toma como el mensaje de Read-Host y la variable no queda con el JWT.
        <br />
        Si aparece <code>Bearer token is malformed</code>, obtén un token nuevo y vuelve a pegarlo solo cuando aparezca el mensaje.
      </div>
    </section>
  );
}
