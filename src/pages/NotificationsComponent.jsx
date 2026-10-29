import {useEffect, useState} from 'react';
import {request, API_URL} from '../api/http';
import {useSession} from '../auth/AuthGate';
import {usePermissions} from '../auth/Permissions';
import {date} from '../utils/format';
import {notificationView} from '../utils/notificationView';

export default function NotificationsComponent() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const session = useSession();
  const admin = usePermissions().has('Admin');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const result = await request('/api/notifications');
      if (!Array.isArray(result)) throw new Error('No se pudieron leer las notificaciones. Vuelve a actualizar.');
      setRows(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function download(row) {
    const view = notificationView(row, admin);
    if (!view.downloadable) return;
    setDownloading(row.eventId);
    setError('');
    try {
      const token = await session.getToken();
      const response = await fetch(`${API_URL}/api/notifications/${encodeURIComponent(row.eventId)}/artifact`, {
        headers: {Authorization: `Bearer ${token}`},
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        throw new Error(problem?.detail || `No se pudo descargar el documento (${response.status}).`);
      }
      if (!admin && !response.headers.get('Content-Type')?.toLowerCase().startsWith('application/pdf'))
        throw new Error('El comprobante PDF no está disponible. Actualiza las notificaciones.');
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = view.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (e) {
      setError(e.message);
    } finally {
      setDownloading(null);
    }
  }

  return <div>
    <div className="page-head">
      <h2>Notificaciones y documentos</h2>
      <button className="btn" disabled={loading} onClick={load}>{loading ? 'Actualizando…' : 'Actualizar'}</button>
    </div>
    <p>{admin
      ? 'Vista técnica de correos preparados, tickets de cocina y comprobantes. El archivo .eml acredita preparación del correo, no entrega externa.'
      : 'Aquí encontrarás las actualizaciones de tus pedidos y los comprobantes PDF disponibles.'}</p>
    {error && <p className="error" role="alert">{error}</p>}
    {loading && <p className="muted" role="status">Cargando notificaciones…</p>}
    {!loading && !error && rows.length === 0 && <p className="muted">Todavía no tienes notificaciones. Aparecerán cuando se procesen tus pedidos.</p>}
    {rows.length > 0 && <div className="table-wrap" aria-busy={loading}>
      <table>
        <thead><tr><th>Pedido</th><th>Notificación</th>{admin && <th>Trabajo interno</th>}<th>Fecha</th><th>{admin ? 'Archivo de evidencia' : 'Comprobante'}</th></tr></thead>
        <tbody>{rows.map(row => {
          const view = notificationView(row, admin);
          return <tr key={row.eventId}>
            <td>#{row.orderId}</td>
            <td>{view.message}</td>
            {admin && <td><code>{row.type || '—'}</code></td>}
            <td>{date(row.processedAt)}</td>
            <td>{view.downloadable
              ? <><button className="btn" disabled={downloading !== null} onClick={() => download(row)}>{downloading === row.eventId ? 'Descargando…' : view.downloadLabel}</button>{admin && <div className="muted small">{row.artifact}</div>}</>
              : <span className="muted" aria-label="Esta notificación no incluye un documento descargable">—</span>}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>}
  </div>;
}
