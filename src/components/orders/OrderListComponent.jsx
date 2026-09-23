import { STATUS, STATUS_KEYS } from '../../constants/orderStatus';
import { storeName } from '../../constants/stores';
import { date, money } from '../../utils/format';
import OrderStatusBadgeComponent from './OrderStatusBadgeComponent';

// Tabla de pedidos filtrable por estado y rango de fechas
export default function OrderListComponent({ orders, loading, filters, onFilters, onSelect, selectedId, onReload }) {
  const set = (key) => (e) => onFilters({ ...filters, [key]: e.target.value });
  return (
    <div>
      <div className="filters">
        <label>Estado
          <select value={filters.status} onChange={set('status')}>
            <option value="">Todos</option>
            {STATUS_KEYS.map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
          </select>
        </label>
        <label>Desde <input type="date" value={filters.from} onChange={set('from')} /></label>
        <label>Hasta <input type="date" value={filters.to} onChange={set('to')} /></label>
        <button className="btn" onClick={() => onFilters({ status: '', from: '', to: '' })}>Limpiar</button>
        <button className="btn" onClick={onReload}>↻ Actualizar</button>
      </div>

      {loading ? <p className="muted">Cargando…</p> : orders.length === 0 ? (
        <p className="muted">No hay pedidos con estos filtros.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Cliente</th><th>Local</th><th>Creado</th><th>Total</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className={`clickable ${o.id === selectedId ? 'selected' : ''}`} onClick={() => onSelect(o.id)}>
                  <td>{o.id}</td>
                  <td>{o.customerName}</td>
                  <td>{storeName(o.storeId)}</td>
                  <td>{date(o.createdAt)}</td>
                  <td>{money(o.total)}</td>
                  <td><OrderStatusBadgeComponent status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
