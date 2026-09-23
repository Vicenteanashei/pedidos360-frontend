import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { useSession } from '../auth/AuthGate';
import OrderListComponent from '../components/orders/OrderListComponent';
import OrderDetailComponent from '../components/orders/OrderDetailComponent';
import OrderFormComponent from '../components/orders/OrderFormComponent';
import OrderTokenTestComponent from '../components/orders/OrderTokenTestComponent';

// Ruta /orders: gestion de pedidos (listar, crear, ver/editar y cambiar estado)
export default function OrdersComponent() {
  const session = useSession();
  const location = useLocation();
  const [filters, setFilters] = useState({ status: '', from: '', to: '' });
  const { orders, loading, error, reload } = useOrders(filters);
  // panel: { mode: 'detail', id } | { mode: 'new' } | { mode: 'edit', order } | null
  const [showTokenTest, setShowTokenTest] = useState(false);
  const [panel, setPanel] = useState(() => (location.state?.open ? { mode: 'detail', id: location.state.open } : null));

  async function afterSave(order) {
    await reload();
    setPanel({ mode: 'detail', id: order.id });
  }

  return (
    <div>
      <div className="page-head">
        <h2>Pedidos</h2>
        <div>
          <button className="btn" onClick={() => setShowTokenTest((v) => !v)}>
            {showTokenTest ? 'Ocultar prueba de tokens' : 'Probar tokens'}
          </button>{' '}
          <button className="btn primary" onClick={() => setPanel({ mode: 'new' })}>+ Nuevo pedido</button>
        </div>
      </div>
      {showTokenTest && <OrderTokenTestComponent session={session} />}
      {error && <p className="error">{error}</p>}

      <div className="split">
        <section className="card">
          <OrderListComponent
            orders={orders} loading={loading} filters={filters} onFilters={setFilters} onReload={reload}
            selectedId={panel?.id ?? panel?.order?.id} onSelect={(id) => setPanel({ mode: 'detail', id })}
          />
        </section>
        <section className="card panel">
          {!panel && <p className="muted">Selecciona un pedido para ver el detalle, o crea uno nuevo.</p>}
          {panel?.mode === 'detail' && (
            <OrderDetailComponent
              key={panel.id} id={panel.id}
              onEdit={(order) => setPanel({ mode: 'edit', order })}
              onChanged={reload}
              onDeleted={async () => { await reload(); setPanel(null); }}
            />
          )}
          {panel?.mode === 'new' && (
            <OrderFormComponent defaultEmail={session.username} onSaved={afterSave} onCancel={() => setPanel(null)} />
          )}
          {panel?.mode === 'edit' && (
            <OrderFormComponent order={panel.order} onSaved={afterSave} onCancel={() => setPanel({ mode: 'detail', id: panel.order.id })} />
          )}
        </section>
      </div>
    </div>
  );
}
