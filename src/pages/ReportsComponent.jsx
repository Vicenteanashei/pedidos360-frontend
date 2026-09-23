import { useMemo, useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import SalesChartComponent from '../components/reports/SalesChartComponent';
import LeadTimeChartComponent from '../components/reports/LeadTimeChartComponent';
import TopProductsChartComponent from '../components/reports/TopProductsChartComponent';

const RANGES = { last24h: 24 * 3600e3, last7d: 7 * 24 * 3600e3, all: Infinity };

// Ruta /reports: KPIs de ventas, lead time y top productos
export default function ReportsComponent() {
  const { orders, loading, error, reload } = useOrders();
  const [range, setRange] = useState('last7d');
  const filtered = useMemo(() => {
    const since = Date.now() - RANGES[range];
    return orders.filter((o) => new Date(o.createdAt).getTime() >= since);
  }, [orders, range]);

  return (
    <div>
      <div className="page-head">
        <h2>Reportes y KPIs</h2>
        <div className="filters inline">
          <label>Rango
            <select value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="last24h">Últimas 24 horas</option>
              <option value="last7d">Últimos 7 días</option>
              <option value="all">Todo</option>
            </select>
          </label>
          <button className="btn" onClick={reload}>↻ Actualizar</button>
        </div>
      </div>
      <p className="note small">
        Calculado a partir de los pedidos del BFF (<code>/api/orders</code>). Cuando exista <code>ms-pedidos360-report</code> (Kafka),
        estos datos vendrán de <code>/api/report/kpis</code> y <code>/api/report/top-products</code>.
      </p>
      {loading && <p className="muted">Cargando…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <>
          <SalesChartComponent orders={filtered} />
          <div className="grid-2">
            <LeadTimeChartComponent orders={filtered} />
            <TopProductsChartComponent orders={filtered} />
          </div>
        </>
      )}
    </div>
  );
}
