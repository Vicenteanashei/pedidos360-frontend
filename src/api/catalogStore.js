// Catalogo PROVISIONAL guardado en el navegador (localStorage).
// Cuando exista ms-pedidos360-catalog, estas funciones se reemplazan por llamadas a /api/catalog/products.
const KEY = 'pedidos360.catalog';

const SEED = [
  { id: 10, name: 'Marraqueta (kg)', category: 'Panadería', price: 2200, stock: 40 },
  { id: 11, name: 'Pan amasado (6 un.)', category: 'Panadería', price: 2500, stock: 30 },
  { id: 12, name: 'Hallulla (kg)', category: 'Panadería', price: 2300, stock: 35 },
  { id: 20, name: 'Café americano', category: 'Cafetería', price: 1800, stock: 100 },
  { id: 21, name: 'Cappuccino', category: 'Cafetería', price: 2600, stock: 100 },
  { id: 30, name: 'Kuchen de nuez (trozo)', category: 'Pastelería', price: 2900, stock: 20 },
  { id: 31, name: 'Torta tres leches (entera)', category: 'Pastelería', price: 18990, stock: 5 },
];

const listeners = new Set();

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : SEED;
  } catch {
    return SEED;
  }
}

let products = read();

function save(next) {
  products = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* sin localStorage: solo en memoria */ }
  listeners.forEach((fn) => fn(products));
}

export const getProducts = () => products;
export const productById = (id) => products.find((p) => p.id === Number(id));
export const productName = (id) => productById(id)?.name ?? `Producto #${id}`;

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function saveProduct(product) {
  if (product.id) {
    save(products.map((p) => (p.id === product.id ? { ...p, ...product } : p)));
  } else {
    const id = Math.max(0, ...products.map((p) => p.id)) + 1;
    save([...products, { ...product, id }]);
  }
}

// Regla del caso: el stock decrece al aceptar un pedido
export function discountStock(items) {
  save(products.map((p) => {
    const qty = items.filter((i) => i.productId === p.id).reduce((s, i) => s + i.quantity, 0);
    return qty ? { ...p, stock: Math.max(0, p.stock - qty) } : p;
  }));
}

export function resetCatalog() {
  save(SEED);
}
