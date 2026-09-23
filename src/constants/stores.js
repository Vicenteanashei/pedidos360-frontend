// Locales de la red (provisional, hasta que exista un maestro de locales)
export const STORES = [
  { id: 1, name: 'Panadería La Espiga' },
  { id: 2, name: 'Café del Barrio' },
  { id: 3, name: 'Pastelería Dulce Hogar' },
];

export const storeName = (id) => STORES.find((s) => s.id === id)?.name ?? `Local #${id}`;
