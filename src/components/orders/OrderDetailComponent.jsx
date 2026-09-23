import { useEffect, useState } from 'react';
import { changeStatus, deleteOrder, getOrder } from '../../api/ordersApi';
import { discountStock, productName } from '../../api/catalogStore';
import { ACTION_LABEL, TRANSITIONS } from '../../constants/orderStatus';
import { storeName } from '../../constants/stores';
import { date, duration, money } from '../../utils/format';
import OrderStatusBadgeComponent from './OrderStatusBadgeComponent';

// Ver un pedido: datos, productos, linea de tiempo y acciones (cambiar estado, editar, eliminar)
export default function OrderDetailComponent({ id, onEdit, onChanged, onDeleted }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setOrder(null);
    getOrder(id).then(setOrder).catch((e) => setError(e.message));
  }, [id]);

  async function run(action) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const move = (status) => run(async () => {
    const updated = await changeStatus(id, status);
    if (status === 'ACEPTADO') discountStock(updated.items); // regla: el stock decrece al aceptar
    setOrder(updated);
    await onChanged();
  });

  const remove = () => run(async () => {
    await deleteOrder(id);
    await onDeleted();
  });

  if (!order) return error ? <p className="error">{error}</p> : <p className="muted">Cargando…</p>;
  const next = TRANSITIONS[order.status] ?? [];

  return (
    <div className="detail">
      <div className="detail-head">
        <h3>Pedido #{order.id}</h3>
        <OrderStatusBadgeComponent status={order.status} />
      </div>

      <dl>
        <dt>Cliente</dt><dd>{order.customerName} · {order.customerEmail}</dd>
        <dt>Local</dt><dd>{storeName(order.storeId)}</dd>
        {order.deliveryAddress && (<><dt>Dirección</dt><dd>{order.deliveryAddress}</dd></>)}
        {order.notes && (<><dt>Notas</dt><dd>{order.notes}</dd></>)}
      </dl>

      <table className="items">
        <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
        <tbody>
          {order.items.map((i) => (
            <tr key={i.id}><td>{productName(i.productId)}</td><td>{i.quantity}</td><td>{money(i.unitPrice)}</td><td>{money(i.subtotal)}</td></tr>
          ))}
        </tbody>
        <tfoot><tr><td colSpan={3}>Total</td><td>{money(order.total)}</td></tr></tfoot>
      </table>

      <ol className="timeline">
        <li className="done">Creado · {date(order.createdAt)}</li>
        <li className={order.acceptedAt ? 'done' : ''}>Aceptado · {date(order.acceptedAt)}</li>
        <li className={order.dispatchedAt ? 'done' : ''}>Despachado · {date(order.dispatchedAt)}</li>
        <li className={order.deliveredAt ? 'done' : ''}>
          Entregado · {date(order.deliveredAt)}
          {order.deliveredAt && <span className="muted"> (lead time {duration(order.createdAt, order.deliveredAt)})</span>}
        </li>
      </ol>

      {error && <p className="error">{error}</p>}

      <div className="actions">
        {next.map((s) => (
          <button key={s} className={`btn ${s === 'CANCELADO' ? 'danger-ghost' : 'primary'}`} disabled={busy} onClick={() => move(s)}>
            {ACTION_LABEL[s]}
          </button>
        ))}
        {order.status === 'CREADO' && <button className="btn" disabled={busy} onClick={() => onEdit(order)}>Editar</button>}
        {confirmDelete ? (
          <>
            <button className="btn danger" disabled={busy} onClick={remove}>Sí, eliminar</button>
            <button className="btn" onClick={() => setConfirmDelete(false)}>No</button>
          </>
        ) : (
          <button className="btn danger-ghost" disabled={busy} onClick={() => setConfirmDelete(true)}>Eliminar</button>
        )}
      </div>
    </div>
  );
}
