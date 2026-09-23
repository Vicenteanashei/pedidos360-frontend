import { productName } from '../../api/catalogStore';

// Productos mas vendidos (unidades en pedidos no cancelados)
export default function TopProductsChartComponent({ orders }) {
  const units = {};
  orders.filter((o) => o.status !== 'CANCELADO').forEach((o) =>
    o.items.forEach((i) => { units[i.productId] = (units[i.productId] ?? 0) + i.quantity; }));
  const top = Object.entries(units).map(([id, qty]) => ({ id, name: productName(Number(id)), qty }))
    .sort((a, b) => b.qty - a.qty).slice(0, 5);
  const max = top[0]?.qty ?? 0;
  return (
    <div className="card">
      <h3>Top productos</h3>
      {top.length === 0 ? <p className="muted small">Sin ventas en este rango.</p> : (
        <div className="hbars">
          {top.map((p) => (
            <div className="hbar-row" key={p.id}>
              <span className="hbar-label">{p.name}</span>
              <div className="hbar-track"><div className="hbar-fill" style={{ width: `${(p.qty / max) * 100}%` }} /></div>
              <span className="hbar-value">{p.qty} un.</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
