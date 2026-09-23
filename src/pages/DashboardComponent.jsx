import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { useSession } from '../auth/AuthGate';
import { changeStatus } from '../api/ordersApi';
import { discountStock } from '../api/catalogStore';
import { ACTIVE_STATUSES } from '../constants/orderStatus';
import { storeName } from '../constants/stores';
import { date, formatDuration, money } from '../utils/format';
import OrderStatusBadgeComponent from '../components/orders/OrderStatusBadgeComponent';

function Kpi({ label, value, hint }) {
  return (
    <div className="kpi">
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {hint && <div className="kpi-hint">{hint}</div>}
    </div>
  );
}

// Ruta /dashboard: vista inicial tras el login con el resumen de actividad
export default function DashboardComponent() {
  const session = useSession();
  const navigate = useNavigate();
  const { orders, loading, error, reload } = useOrders();
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState('');

  const delivered = orders.filter((o) => o.status === 'ENTREGADO');
  const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const pending = orders.filter((o) => o.status === 'CREADO');
  const sales = delivered.reduce((s, o) => s + Number(o.total), 0);
  const leads = delivered.map((o) => new Date(o.deliveredAt) - new Date(o.createdAt));
  const avgLead = leads.length ? formatDuration(leads.reduce((a, b) => a + b, 0) / leads.length) : '—';
  const latest = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  async function accept(order) {
    setBusyId(order.id);
    setActionError('');
    try {
      const updated = await changeStatus(order.id, 'ACEPTADO');
      discountStock(updated.items);
      await reload();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h2>Hola{session.username ? `, ${session.username.split('@')[0]}` : ''} 👋</h2>
      <p className="muted">Resumen de actividad de la red de locales.</p>
      {loading && <p className="muted">Cargando…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <>
          <div className="kpis">
            <Kpi label="Pedidos totales" value={orders.length} />
            <Kpi label="En curso" value={active.length} />
            <Kpi label="Ventas entregadas" value={money(sales)} />
            <Kpi label="Lead time promedio" value={avgLead} hint="desde que se crea hasta que se entrega" />
          </div>

          {actionError && <p className="error">{actionError}</p>}

          <div className="grid-2">
            <section className="card">
              <h3>Pedidos pendientes de aceptar</h3>
              {pending.length === 0 ? <p className="muted">No hay pedidos nuevos. 🎉</p> : (
                <table>
                  <tbody>
                    {pending.map((o) => (
                      <tr key={o.id}>
                        <td>#{o.id}</td><td>{o.customerName}</td><td>{money(o.total)}</td>
                        <td className="right">
                          <button className="btn small primary" disabled={busyId === o.id} onClick={() => accept(o)}>Aceptar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="card">
              <h3>Últimos pedidos</h3>
              {latest.length === 0 ? <p className="muted">Todavía no hay pedidos.</p> : (
                <table>
                  <tbody>
                    {latest.map((o) => (
                      <tr key={o.id} className="clickable" onClick={() => navigate('/orders', { state: { open: o.id } })}>
                        <td>#{o.id}</td><td>{storeName(o.storeId)}</td><td>{date(o.createdAt)}</td>
                        <td><OrderStatusBadgeComponent status={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
