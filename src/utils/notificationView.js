const CUSTOMER_MESSAGES = {
  'email.send': 'Hay una actualización de tu pedido. Puedes revisar su detalle en Pedidos.',
  'kitchen.ticket': 'Tu pedido fue aceptado para preparación.',
  'invoice.gen': 'Se registró el comprobante de tu pedido.',
};

const ADMIN_MESSAGES = {
  'email.send': 'Correo preparado',
  'kitchen.ticket': 'Ticket de cocina generado',
  'invoice.gen': 'Comprobante generado',
};

// Also handles existing API responses while the new backend is being deployed.
// The backend independently authorizes every artifact download.
export function notificationView(row, admin) {
  const artifact = typeof row.artifact === 'string' ? row.artifact : '';
  const invoicePdf = artifact.endsWith('.pdf') &&
    (row.type === 'invoice.gen' || (!row.type && row.downloadable === true));
  const downloadable = row.downloadable !== false &&
    (admin ? Boolean(artifact) : invoicePdf);
  return {
    message: admin
      ? ADMIN_MESSAGES[row.type] || row.message || 'Notificación procesada'
      : row.message || (invoicePdf ? 'El comprobante PDF de tu pedido está disponible.' : CUSTOMER_MESSAGES[row.type]) || 'Se registró una actualización de tu pedido.',
    downloadable,
    filename: admin ? artifact : `comprobante-pedido-${row.orderId}.pdf`,
    downloadLabel: admin ? 'Descargar archivo' : 'Descargar PDF',
  };
}
