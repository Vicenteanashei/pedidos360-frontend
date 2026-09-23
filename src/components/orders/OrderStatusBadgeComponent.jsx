import { STATUS } from '../../constants/orderStatus';

// Muestra el estado del pedido con color (CREADO, ACEPTADO, ...)
export default function OrderStatusBadgeComponent({ status }) {
  const s = STATUS[status] ?? { label: status, color: 'gray' };
  return <span className={`badge badge-${s.color}`}>{s.label}</span>;
}
