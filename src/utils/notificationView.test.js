import test from 'node:test';
import assert from 'node:assert/strict';
import {notificationView} from './notificationView.js';

test('customers get readable email and kitchen notifications without internal downloads', () => {
  for (const row of [{type:'email.send',artifact:'mail.eml'},{type:'kitchen.ticket',artifact:'ticket.txt'}]) {
    const view = notificationView({...row,orderId:7},false);
    assert.equal(view.downloadable,false);
    assert.ok(view.message.length > 10);
    assert.ok(!view.message.includes(row.type));
  }
});

test('customers can download an invoice PDF with a readable filename', () => {
  const view=notificationView({type:'invoice.gen',artifact:'event.pdf',orderId:7},false);
  assert.equal(view.downloadable,true);
  assert.equal(view.filename,'comprobante-pedido-7.pdf');
  assert.equal(view.downloadLabel,'Descargar PDF');
});

test('new customer API response needs no internal task name', () => {
  const view=notificationView({message:'Tu comprobante está disponible.',artifact:'comprobante-pedido-7.pdf',downloadable:true,orderId:7},false);
  assert.equal(view.message,'Tu comprobante está disponible.');
  assert.equal(view.downloadable,true);
});

test('non-PDF invoices, unknown files and disguised email PDFs are not customer downloads', () => {
  for (const row of [
    {type:'invoice.gen',artifact:'legacy.txt'},
    {type:'email.send',artifact:'mail.pdf',downloadable:true},
    {artifact:'unknown.pdf'},
    {type:'invoice.gen',artifact:'invoice.pdf',downloadable:false},
  ]) assert.equal(notificationView(row,false).downloadable,false);
});

test('admin retains internal artifacts and technical evidence', () => {
  const row={type:'email.send',artifact:'event.eml',orderId:7};
  assert.equal(notificationView(row,true).downloadable,true);
  assert.equal(notificationView(row,true).filename,'event.eml');
  assert.equal(notificationView(row,true).message,'Correo preparado');
  assert.equal(notificationView({type:'kitchen.ticket',artifact:'ticket.txt'},true).downloadable,true);
});

test('a notification without an artifact has no download button', () => {
  assert.equal(notificationView({message:'Pedido actualizado',downloadable:false},false).downloadable,false);
  assert.equal(notificationView({type:'email.send'},true).downloadable,false);
});
