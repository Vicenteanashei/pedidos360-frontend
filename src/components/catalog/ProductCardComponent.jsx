import { money } from '../../utils/format';

// Tarjeta de producto con precio y stock
export default function ProductCardComponent({ product, onEdit }) {
  const low = product.stock <= 5;
  return (
    <div className="product-card">
      <div className="muted small">{product.category}</div>
      <div className="product-name">{product.name}</div>
      <div className="product-price">{money(product.price)}</div>
      <div className={low ? 'stock low' : 'stock'}>{low ? '⚠ ' : ''}Stock: <b>{product.stock}</b></div>
      <button className="btn small" onClick={() => onEdit(product)}>Editar</button>
    </div>
  );
}
