// The case includes twenty stores. Keep existing demo names and expose the full range.
const names = ['Panadería La Espiga', 'Café del Barrio', 'Pastelería Dulce Hogar'];
export const STORES = Array.from({length: 20}, (_, index) => ({
  id: index + 1,
  name: names[index] || `Local #${index + 1}`,
}));
export const storeName = (id) => STORES.find((s) => s.id === Number(id))?.name ?? `Local #${id}`;
