import { formatDuration } from '../../utils/format';
import BarChart from './BarChart';

// Lead time: tiempo entre que se crea el pedido y se entrega
export default function LeadTimeChartComponent({ orders }) {
  const delivered = orders.filter((o) => o.deliveredAt)
    .sort((a, b) => new Date(a.deliveredAt) - new Date(b.deliveredAt))
    .slice(-15);
  const data = delivered.map((o) => ({ label: `Pedido #${o.id}`, short: `#${o.id}`, value: new Date(o.deliveredAt) - new Date(o.createdAt) }));
  const avg = data.length ? data.reduce((s, d) => s + d.value, 0) / data.length : null;
  return (
    <div className="card">
      <h3>Lead time por pedido entregado</h3>
      <p className="muted small">Promedio: <b>{formatDuration(avg)}</b> (últimos {data.length} entregados)</p>
      <BarChart data={data} format={formatDuration} empty="Todavía no hay pedidos entregados en este rango." />
    </div>
  );
}
