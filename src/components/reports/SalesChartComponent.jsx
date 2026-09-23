import { money } from '../../utils/format';
import BarChart from './BarChart';

// Ventas por hora (suma de pedidos no cancelados, segun hora de creacion)
export default function SalesChartComponent({ orders }) {
  const byHour = Array.from({ length: 24 }, (_, h) => ({ label: `${String(h).padStart(2, '0')}:00`, short: String(h), value: 0 }));
  orders.filter((o) => o.status !== 'CANCELADO')
    .forEach((o) => { byHour[new Date(o.createdAt).getHours()].value += Number(o.total); });
  return (
    <div className="card">
      <h3>Ventas por hora</h3>
      <BarChart data={byHour} format={money} />
    </div>
  );
}
