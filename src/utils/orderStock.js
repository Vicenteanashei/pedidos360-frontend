export const MAX_ITEM_QUANTITY = 10000;

// Rows containing the same product share its stock; they do not each get a fresh allowance.
export function quantityLimit(products, items, index, productId = items[index]?.productId) {
  const product = products.find(p => p.id === Number(productId));
  if (!product || !Number.isSafeInteger(product.stock) || product.stock < 0) return 0;
  const elsewhere = items.reduce((total, item, row) => {
    const quantity = Number(item.quantity);
    return row !== index && Number(item.productId) === product.id && Number.isSafeInteger(quantity) && quantity > 0
      ? total + quantity : total;
  }, 0);
  return Math.max(0, Math.min(MAX_ITEM_QUANTITY, product.stock - elsewhere));
}

export function orderStockError(items, products) {
  if (!items.length) return 'Agrega al menos un producto.';
  const totals = new Map();
  for (const item of items) {
    const product = products.find(p => p.id === Number(item.productId));
    if (!product) return 'Selecciona un producto disponible en este local.';
    const quantity = Number(item.quantity);
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_ITEM_QUANTITY)
      return `Revisa la cantidad de ${product.name}: debe ser un número entero entre 1 y ${MAX_ITEM_QUANTITY}.`;
    if (!Number.isSafeInteger(product.stock) || product.stock < 0)
      return `No se pudo consultar el stock de ${product.name}. Actualiza el catálogo.`;
    const total = (totals.get(product.id) || 0) + quantity;
    totals.set(product.id, total);
    if (total > product.stock)
      return `Stock insuficiente de ${product.name}: solicitaste ${total} unidades y hay ${product.stock} disponibles. Corrige la cantidad para continuar.`;
  }
  return '';
}
