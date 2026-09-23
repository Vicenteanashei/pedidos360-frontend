import { useCallback, useEffect, useState } from 'react';
import { listOrders } from '../api/ordersApi';

// Pedidos desde el BFF (GET /api/orders) con filtros opcionales
export function useOrders(filters = {}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setOrders(await listOrders(filters));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.from, filters.to]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { orders, loading, error, reload };
}
