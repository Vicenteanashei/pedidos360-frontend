import { useState } from 'react';
import { useCatalog } from '../hooks/useCatalog';
import { resetCatalog, saveProduct } from '../api/catalogStore';
import ProductCardComponent from '../components/catalog/ProductCardComponent';
import ProductFormComponent from '../components/catalog/ProductFormComponent';

// Ruta /catalog: productos, precios y control de stock
export default function CatalogComponent() {
  const products = useCatalog();
  const [editing, setEditing] = useState(null); // null | 'new' | producto
  const [search, setSearch] = useState('');
  const visible = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  function save(product) {
    saveProduct(product);
    setEditing(null);
  }

  return (
    <div>
      <div className="page-head">
        <h2>Catálogo de productos</h2>
        <button className="btn primary" onClick={() => setEditing('new')}>+ Nuevo producto</button>
      </div>
      <p className="note small">
        Catálogo provisional guardado en el navegador mientras se construye <code>ms-pedidos360-catalog</code>.
        El stock baja automáticamente cuando se <b>acepta</b> un pedido.
      </p>

      {editing && (
        <ProductFormComponent product={editing === 'new' ? null : editing} onSave={save} onCancel={() => setEditing(null)} />
      )}

      <div className="filters">
        <label>Buscar<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nombre del producto" /></label>
        <button className="btn" onClick={resetCatalog}>Restaurar catálogo inicial</button>
      </div>

      <div className="product-grid">
        {visible.map((p) => <ProductCardComponent key={p.id} product={p} onEdit={setEditing} />)}
      </div>
    </div>
  );
}
