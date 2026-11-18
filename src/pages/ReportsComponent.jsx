import {useState} from 'react';
import {usePollingResource} from '../hooks/usePollingResource';
import {money, formatDuration, date} from '../utils/format';
import BarChart from '../components/reports/BarChart';

export default function ReportsComponent() {
  const [range, setRange] = useState('last7d');
  const {data: report, error, loading, reload} = usePollingResource('/api/reports?range=' + range);
  return <div>
    <div className="page-head"><h2>Reportes</h2><button className="btn" disabled={loading} onClick={reload}>Actualizar</button></div>
    <p>Los indicadores se actualizan con los eventos procesados. La vista se refresca cada 15 segundos.</p>
    <label>Ventas por fecha de entrega<select value={range} onChange={e => setRange(e.target.value)}>
      <option value="last24h">24 horas</option><option value="last7d">7 días</option><option value="all">Todo</option></select></label>
    {error && <p className="error" role="alert">{error}</p>}
    {!report && loading && <p role="status">Cargando indicadores…</p>}
    {report && <>
      <p className="muted">Último evento procesado: {report.lastEventAt ? date(report.lastEventAt) : 'Aún no se han recibido eventos.'}</p>
      <div className="kpis"><div className="kpi"><h3>Pedidos entregados</h3>{report.deliveredOrders}</div>
        <div className="kpi"><h3>Ventas entregadas</h3>{money(report.sales)}</div>
        <div className="kpi"><h3>Lead time promedio</h3>{formatDuration(report.averageLeadTimeMs)}</div></div>
      <section className="card"><h3>Estados actuales de pedidos</h3>
        <BarChart data={Object.entries(report.states || {}).map(([label, value]) => ({label, value}))}/></section>
      <section className="card"><h3>Ventas por hora</h3><p>Fechas en {report.timeZone || 'America/Santiago'}; cada intervalo indica su desfase UTC.</p>
        <BarChart data={report.hourlySales || []} format={money}/></section>
      <section className="card"><h3>Ventas por día</h3><p>Fechas en {report.timeZone || 'America/Santiago'}.</p>
        <BarChart data={report.dailySales || []} format={money}/></section>
      <section className="card"><h3>Lead time promedio por día de entrega</h3>
        <BarChart data={report.dailyLeadTime || []} format={formatDuration}/></section>
      <section className="card"><h3>Productos más vendidos</h3><BarChart data={report.topProducts || []}/></section>
    </>}
  </div>;
}
