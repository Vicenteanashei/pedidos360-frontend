import { useEffect, useState } from 'react';
import { request } from '../../api/http';

// Mensajes que llegaron a las DLQ y que el consumidor de errores de notify archivó.
export default function DeadLettersSection() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setItems((await request('/api/notifications/dead-letters')) ?? []);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <section className="card">
      <div className="page-head">
        <h3>Mensajes muertos archivados (DLQ)</h3>
        <button className="btn" onClick={load}>Actualizar</button>
      </div>
      {error && <p className="error">{error}</p>}
      {!error && items.length === 0 && <p className="muted">Sin mensajes archivados.</p>}
      {items.length > 0 && (
        <table>
          <thead>
            <tr><th>Fecha</th><th>DLQ</th><th>Cola original</th><th>Routing key</th><th>Razón</th><th>Muertes</th><th>Evento</th></tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id}>
                <td>{new Date(d.archivedAt).toLocaleString('es-CL')}</td>
                <td>{d.dlq}</td>
                <td>{d.originalQueue ?? '—'}</td>
                <td>{d.originalRoutingKey ?? '—'}</td>
                <td>{d.reason ?? '—'}</td>
                <td>{d.deathCount}</td>
                <td>{d.eventId ?? 'payload inválido'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
