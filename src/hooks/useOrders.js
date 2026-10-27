import { useCallback, useEffect, useState, useRef } from 'react';
import { listOrders } from '../api/ordersApi';

// Pedidos desde el BFF (GET /api/orders) con filtros opcionales
export function useOrders(filters = {}) {
  const sequence=useRef(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    const current=++sequence.current;
    setLoading(true);
    setError('');
    try {
      const rows=await listOrders(filters);
      if(current===sequence.current)setOrders(rows);
    } catch (e) {
      if(current===sequence.current)setError(e.message);
    } finally {
      if(current===sequence.current)setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.from, filters.to,filters.page,filters.size]);

  useEffect(() => {
    reload();
    return()=>{sequence.current++;};
  }, [reload]);

  return { orders, loading, error, reload };
}
