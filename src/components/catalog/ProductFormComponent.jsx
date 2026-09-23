import { useState } from 'react';

// Crear o editar un producto (nombre, categoria, precio y stock)
export default function ProductFormComponent({ product, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    category: product?.category ?? 'Panadería',
    price: product?.price ?? 1000,
    stock: product?.stock ?? 10,
  });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function submit(e) {
    e.preventDefault();
    onSave({ ...product, ...form, price: Number(form.price), stock: Number(form.stock) });
  }

  return (
    <form className="order-form card" onSubmit={submit}>
      <h3>{product ? `Editar: ${product.name}` : 'Nuevo producto'}</h3>
      <div className="row">
        <label>Nombre<input required maxLength={80} value={form.name} onChange={set('name')} /></label>
        <label>Categoría
          <select value={form.category} onChange={set('category')}>
            <option>Panadería</option><option>Cafetería</option><option>Pastelería</option>
          </select>
        </label>
      </div>
      <div className="row">
        <label>Precio (CLP)<input type="number" min={0} required value={form.price} onChange={set('price')} /></label>
        <label>Stock<input type="number" min={0} required value={form.stock} onChange={set('stock')} /></label>
      </div>
      <div className="actions">
        <button className="btn primary">Guardar</button>
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
