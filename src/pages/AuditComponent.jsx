import {useState} from 'react';
import {usePollingResource} from '../hooks/usePollingResource';
import {date} from '../utils/format';

export default function AuditComponent() {
  const [page, setPage] = useState(0);
  const [draft, setDraft] = useState({orderId: '', actorId: '', type: '', from: '', to: ''});
  const [filters, setFilters] = useState({});
  const params = new URLSearchParams({page, size: 100});
  for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
  const {data, error, loading, reload} = usePollingResource('/api/audit?' + params.toString());
  const rows = data || [];
  const set = key => e => setDraft({...draft, [key]: e.target.value});
  function filter(event) {
    event.preventDefault(); setPage(0);
    setFilters({...draft, from: draft.from ? new Date(draft.from).toISOString() : '',
      to: draft.to ? new Date(draft.to).toISOString() : ''});
  }
  return <div>
    <div className="page-head"><h2>Historial de eventos</h2><button className="btn" disabled={loading} onClick={reload}>Actualizar</button></div>
    <p>Eventos de negocio procesados para auditoría. Actualización cada 15 segundos.</p>
    <form className="card" onSubmit={filter}>
      <div className="row"><label>Pedido<input type="number" min={1} value={draft.orderId} onChange={set('orderId')}/></label>
        <label>Actor exacto<input maxLength={250} value={draft.actorId} onChange={set('actorId')}/></label>
        <label>Tipo de evento<select value={draft.type} onChange={set('type')}><option value="">Todos</option>
          {['OrderCreated','OrderUpdated','OrderAccepted','OrderPreparing','OrderDispatched','OrderDelivered','OrderCancelled','OrderDeleted','OrderSnapshot']
            .map(type => <option key={type}>{type}</option>)}</select></label></div>
      <div className="row"><label>Desde<input type="datetime-local" value={draft.from} onChange={set('from')}/></label>
        <label>Hasta<input type="datetime-local" value={draft.to} onChange={set('to')}/></label></div>
      <button className="btn primary">Aplicar filtros</button>
    </form>
    {error && <p className="error" role="alert">{error}</p>}
    {loading && !data && <p role="status">Cargando eventos…</p>}
    {!loading && !error && !rows.length && <p>No hay eventos para estos filtros.</p>}
    <div className="table-wrap"><table><thead><tr><th>Fecha</th><th>Pedido/local</th><th>Actor</th><th>Evento</th><th>Estados</th><th>Origen y correlación</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.id}><td>{date(row.occurredAt)}</td><td>#{row.orderId} / {row.storeId}</td>
        <td>{row.actorId}</td><td>{row.type || row.action}</td><td>{row.previousStatus || '—'} → {row.status}</td>
        <td>{row.source}<div className="muted small">{row.correlationId}</div></td></tr>)}</tbody></table></div>
    <button className="btn" disabled={!page || loading} onClick={() => setPage(value => value - 1)}>Anterior</button>
    {' '}Página {page + 1}{' '}
    <button className="btn" disabled={rows.length < 100 || loading} onClick={() => setPage(value => value + 1)}>Siguiente</button>
  </div>;
}
