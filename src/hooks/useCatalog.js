import { useEffect, useState } from 'react';
import { getProducts, subscribe } from '../api/catalogStore';

export function useCatalog() {
  const [products, setProducts] = useState(getProducts);
  useEffect(() => subscribe(setProducts), []);
  return products;
}
