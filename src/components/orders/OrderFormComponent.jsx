import { useState, useEffect, useId } from 'react';
import { createOrder, updateOrder } from '../../api/ordersApi';
import { useCatalog } from '../../hooks/useCatalog';
import { STORES } from '../../constants/stores';
import { money } from '../../utils/format';
import { quantityLimit, orderStockError } from '../../utils/orderStock';

// Crear o editar un pedido (editar solo mientras esta CREADO)
export default function OrderFormComponent({ order, defaultEmail, defaultName, onSaved, onCancel }) {
  const [catalogStore,setCatalogStore]=useState(order?.storeId ?? STORES[0].id);
  const {products,error:catalogError,loading:catalogLoading,reload:reloadCatalog}=useCatalog(catalogStore);
  const stockHintId = useId();
  const editing = Boolean(order);
  const emptyItem = () => ({ productId: products.find(p => p.stock > 0)?.id ?? products[0]?.id ?? '', quantity: 1 });
  const [form, setForm] = useState(() => ({
    storeId: order?.storeId ?? STORES[0].id,
    customerName: order?.customerName ?? defaultName ?? '',
    customerEmail: order?.customerEmail ?? defaultEmail ?? '',
    deliveryAddress: order?.deliveryAddress ?? '',
    notes: order?.notes ?? '',
    items: order?.items?.map((i) => ({ productId: i.productId, quantity: i.quantity })) ?? [emptyItem()],
  }));
  useEffect(() => {
    if (!products.length) return;
    setForm(f => {
      const items = [];
      for (const item of f.items) {
        const productId = products.some(p => p.id === Number(item.productId))
          ? item.productId : (products.find(p => quantityLimit(products, items, -1, p.id) > 0) ?? products[0]).id;
        // Refresh product choices without silently changing the customer's quantity.
        items.push({...item, productId});
      }
      return {...f, items};
    });
  }, [products]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setItem = (index, key, value) => {
    setError('');
    setForm(f => ({...f, items: f.items.map((item, row) => row === index ? {...item, [key]: value} : item)}));
  };
  const canAddItem = form.items.length < 100 && products.some(p => quantityLimit(products, form.items, -1, p.id) > 0);
  const stockError = catalogLoading || catalogError ? '' : orderStockError(form.items, products);
  const formError = stockError || error || catalogError;
  const formErrorId = `${stockHintId}-error`;
  function addItem() {
    setError('');
    setForm(f => {
      const product = products.find(p => quantityLimit(products, f.items, -1, p.id) > 0);
      return product && f.items.length < 100 ? {...f, items: [...f.items, {productId: product.id, quantity: 1}]} : f;
    });
  }
  const price = (id) => products.find((p) => p.id === Number(id))?.price ?? 0;
  const total = form.items.reduce((sum, it) => sum + price(it.productId) * Number(it.quantity || 0), 0);

  async function submit(e) {
    e.preventDefault();
    const stockIssue = orderStockError(form.items, products);
    if (catalogLoading || catalogError || stockIssue) {
      setError(catalogError || stockIssue || 'Espera a que se actualice el stock.');
      return;
    }
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
      await reloadCatalog();
    }
  }

  return (
    <form className="order-form" onSubmit={submit}>
      <h3>{editing ? `Editar pedido #${order.id}` : 'Nuevo pedido'}</h3>
      <label>Local
        <select value={form.storeId} onChange={e=>{setCatalogStore(Number(e.target.value));set('storeId')(e);}}>
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
        {form.items.map((it, i) => {
          const limit = quantityLimit(products, form.items, i);
          const product = products.find(p => p.id === Number(it.productId));
          const quantity = Number(it.quantity);
          const invalidQuantity = !catalogLoading && !catalogError &&
            (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > limit);
          return (
          <div className="item-row" key={i}>
            <select required aria-label={`Producto ${i + 1}`} value={it.productId} onChange={(e) => setItem(i, 'productId', e.target.value)}>
              {products.map((p) => <option key={p.id} value={p.id} disabled={p.id !== Number(it.productId) && quantityLimit(products, form.items, i, p.id) === 0}>{p.name} — {money(p.price)} (stock {p.stock})</option>)}
            </select>
            <input type="number" min={1} step={1} required disabled={catalogLoading}
              aria-label={`Cantidad de ${product?.name ?? `producto ${i + 1}`}`} aria-invalid={invalidQuantity}
              aria-describedby={`${stockHintId}-${i}${invalidQuantity && formError ? ` ${formErrorId}` : ''}`}
              value={it.quantity} onChange={(e) => setItem(i, 'quantity', e.target.value)} />
            <button type="button" className="btn small" aria-label={`Quitar producto ${i + 1}`} disabled={form.items.length === 1}
              onClick={() => {setError('');setForm((f) => ({ ...f, items: f.items.filter((_, j) => j !== i) }));}}>✕</button>
            <small className="stock-hint muted" id={`${stockHintId}-${i}`}>
              {catalogLoading ? 'Consultando stock…' : limit > 0 ? `Puedes pedir hasta ${limit} unidades en esta fila.` : 'No quedan unidades disponibles para esta fila. Elige otro producto o quítala.'}
            </small>
          </div>
          );
        })}
        <button type="button" className="btn small" disabled={catalogLoading || !canAddItem} onClick={addItem}>+ Agregar producto</button>
      </fieldset>

      <div className="total">Total: <b>{money(total)}</b></div>
      {formError && <p className="error" id={formErrorId} role="alert">{formError}</p>}
      <div className="actions">
        <button className="btn primary" disabled={busy||catalogLoading||!products.length||Boolean(catalogError)||Boolean(stockError)}>{busy ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear pedido'}</button>
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
