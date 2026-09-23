import { useMemo, useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { storeName } from '../constants/stores';
import { date } from '../utils/format';

const EVENT_TYPES = {
  OrderCreated: 'Pedido creado',
  OrderAccepted: 'Pedido aceptado',
  OrderDispatched: 'Pedido despachado',
  OrderDelivered: 'Pedido entregado',
  OrderCancelled: 'Pedido cancelado',
};

// Arma la linea de tiempo de eventos de negocio a partir de las fechas de cada pedido
function toEvents(orders) {
  const events = [];
  orders.forEach((o) => {
    const base = { orderId: o.id, customer: o.customerEmail, store: storeName(o.storeId) };
    events.push({ ...base, type: 'OrderCreated', at: o.createdAt });
    if (o.acceptedAt) events.push({ ...base, type: 'OrderAccepted', at: o.acceptedAt });
    if (o.dispatchedAt) events.push({ ...base, type: 'OrderDispatched', at: o.dispatchedAt });
    if (o.deliveredAt) events.push({ ...base, type: 'OrderDelivered', at: o.deliveredAt });
    if (o.status === 'CANCELADO') events.push({ ...base, type: 'OrderCancelled', at: o.updatedAt });
  });
  return events.sort((a, b) => new Date(b.at) - new Date(a.at));
}

// Ruta /audit: trazabilidad de pedidos (solo lectura) con filtros por usuario, fecha y tipo
export default function AuditComponent() {
  const { orders, loading, error, reload } = useOrders();
  const [filters, setFilters] = useState({ user: '', from: '', to: '', type: '' });
  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  const events = useMemo(() => toEvents(orders).filter((e) => {
    if (filters.user && !e.customer?.toLowerCase().includes(filters.user.toLowerCase())) return false;
    if (filters.type && e.type !== filters.type) return false;
    if (filters.from && new Date(e.at) < new Date(`${filters.from}T00:00:00`)) return false;
    if (filters.to && new Date(e.at) > new Date(`${filters.to}T23:59:59`)) return false;
    return true;
  }), [orders, filters]);

  return (
    <div>
      <div className="page-head">
        <h2>Auditoría</h2>
        <button className="btn" onClick={reload}>↻ Actualizar</button>
      </div>
      <p className="note small">
        Línea de tiempo armada desde las fechas de cada pedido. Cuando exista <code>ms-pedidos360-audit</code> (tópico
        Kafka <code>audit.timeline</code>), se mostrará también quién hizo cada acción y desde dónde.
      </p>

      <div className="filters card">
        <label>Usuario<input value={filters.user} onChange={set('user')} placeholder="correo del cliente" /></label>
        <label>Desde<input type="date" value={filters.from} onChange={set('from')} /></label>
        <label>Hasta<input type="date" value={filters.to} onChange={set('to')} /></label>
        <label>Tipo de evento
          <select value={filters.type} onChange={set('type')}>
            <option value="">Todos</option>
            {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <button className="btn" onClick={() => setFilters({ user: '', from: '', to: '', type: '' })}>Limpiar</button>
      </div>

      {loading && <p className="muted">Cargando…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <section className="card">
          {events.length === 0 ? <p className="muted">No hay eventos con estos filtros.</p> : (
            <ol className="audit-timeline">
              {events.map((e, i) => (
                <li key={i} className={`ev ev-${e.type}`}>
                  <div className="ev-when">{date(e.at)}</div>
                  <div className="ev-what"><b>{EVENT_TYPES[e.type]}</b> · Pedido #{e.orderId}</div>
                  <div className="muted small">{e.customer} · {e.store}</div>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}
