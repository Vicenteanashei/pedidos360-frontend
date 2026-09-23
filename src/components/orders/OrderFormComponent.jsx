import { useState } from 'react';
import { createOrder, updateOrder } from '../../api/ordersApi';
import { useCatalog } from '../../hooks/useCatalog';
import { STORES } from '../../constants/stores';
import { money } from '../../utils/format';

// Crear o editar un pedido (editar solo mientras esta CREADO)
export default function OrderFormComponent({ order, defaultEmail, defaultName, onSaved, onCancel }) {
  const products = useCatalog();
  const editing = Boolean(order);
  const emptyItem = () => ({ productId: products[0]?.id ?? '', quantity: 1 });
  const [form, setForm] = useState(() => ({
    storeId: order?.storeId ?? STORES[0].id,
    customerName: order?.customerName ?? defaultName ?? '',
    customerEmail: order?.customerEmail ?? defaultEmail ?? '',
    deliveryAddress: order?.deliveryAddress ?? '',
    notes: order?.notes ?? '',
    items: order?.items?.map((i) => ({ productId: i.productId, quantity: i.quantity })) ?? [emptyItem()],
  }));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setItem = (index, key, value) =>
    setForm((f) => ({ ...f, items: f.items.map((it, i) => (i === index ? { ...it, [key]: value } : it)) }));
  const price = (id) => products.find((p) => p.id === Number(id))?.price ?? 0;
  const total = form.items.reduce((sum, it) => sum + price(it.productId) * Number(it.quantity || 0), 0);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const body = {
      ...form,
      storeId: Number(form.storeId),
      items: form.items.map((it) => ({ productId: Number(it.productId), quantity: Number(it.quantity), unitPrice: price(it.productId) })),
    };
    try {
      onSaved(editing ? await updateOrder(order.id, body) : await createOrder(body));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form className="order-form" onSubmit={submit}>
      <h3>{editing ? `Editar pedido #${order.id}` : 'Nuevo pedido'}</h3>
      <label>Local
        <select value={form.storeId} onChange={set('storeId')}>
          {STORES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
      <div className="row">
        <label>Nombre del cliente<input required maxLength={120} value={form.customerName} onChange={set('customerName')} /></label>
        <label>Correo<input required type="email" maxLength={150} value={form.customerEmail} onChange={set('customerEmail')} /></label>
      </div>
      <label>Dirección de entrega
        <input maxLength={250} value={form.deliveryAddress} onChange={set('deliveryAddress')} placeholder="Opcional: vacío = retiro en local" />
      </label>
      <label>Notas<input maxLength={1000} value={form.notes} onChange={set('notes')} placeholder="Ej: sin azúcar" /></label>

      <fieldset>
        <legend>Productos</legend>
        {form.items.map((it, i) => (
          <div className="item-row" key={i}>
            <select value={it.productId} onChange={(e) => setItem(i, 'productId', e.target.value)}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {money(p.price)} (stock {p.stock})</option>)}
            </select>
            <input type="number" min={1} required value={it.quantity} onChange={(e) => setItem(i, 'quantity', e.target.value)} />
            <button type="button" className="btn small" disabled={form.items.length === 1}
              onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, j) => j !== i) }))}>✕</button>
          </div>
        ))}
        <button type="button" className="btn small" onClick={() => setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }))}>+ Agregar producto</button>
      </fieldset>

      <div className="total">Total: <b>{money(total)}</b></div>
      {error && <p className="error">{error}</p>}
      <div className="actions">
        <button className="btn primary" disabled={busy}>{busy ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear pedido'}</button>
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
