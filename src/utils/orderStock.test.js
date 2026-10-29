import test from 'node:test';
import assert from 'node:assert/strict';
import {quantityLimit, orderStockError} from './orderStock.js';

const products = [
  {id: 1, name: 'Café americano', stock: 100},
  {id: 2, name: 'Marraqueta', stock: 40},
  {id: 3, name: 'Sin existencias', stock: 0},
];

test('above-stock quantities produce a clear warning until corrected', () => {
  const error = orderStockError([{productId: 2, quantity: '50'}], products);
  assert.match(error, /solicitaste 50/);
  assert.match(error, /40 disponibles/);
  assert.equal(orderStockError([{productId: 2, quantity: '40'}], products), '');
});

test('duplicate rows share the 100 units and cannot reproduce the 10100-unit order', () => {
  const items = [{productId: 1, quantity: 60}, {productId: 1, quantity: 1}];
  assert.equal(quantityLimit(products, items, 1), 40);
  assert.equal(quantityLimit(products, [{productId: 1, quantity: 100}], -1, 1), 0);
  assert.notEqual(orderStockError([{productId: 1, quantity: 10000}, {productId: 1, quantity: 100}], products), '');
});

test('other products do not reduce the selected product allowance', () => {
  assert.equal(quantityLimit(products, [{productId: 1, quantity: 100}, {productId: 2, quantity: 1}], 1), 40);
});

test('a product with no stock has no selectable quantity', () => {
  assert.equal(quantityLimit(products, [{productId: 3, quantity: 1}], 0), 0);
  assert.notEqual(orderStockError([{productId: 3, quantity: 1}], products), '');
});

test('the existing API quantity limit still applies to very large inventories', () => {
  assert.equal(quantityLimit([{id: 1, stock: 20000}], [], -1, 1), 10000);
});

test('the field can be cleared and only whole positive units can be submitted', () => {
  for (const quantity of ['', '2.8', '-10', '0', 'abc'])
    assert.notEqual(orderStockError([{productId: 1, quantity}], products), '');
});

test('the exact stock limit is allowed, including duplicate product lines', () => {
  assert.equal(orderStockError([{productId: 1, quantity: 100}], products), '');
  assert.equal(orderStockError([{productId: 1, quantity: 60}, {productId: 1, quantity: 40}], products), '');
  assert.notEqual(orderStockError([{productId: 1, quantity: 60}, {productId: 1, quantity: 41}], products), '');
});

test('unavailable product or unknown stock cannot enable submission', () => {
  assert.equal(quantityLimit(products, [], -1, 999), 0);
  assert.notEqual(orderStockError([{productId: 999, quantity: 1}], products), '');
  assert.equal(quantityLimit([{id: 1, stock: null}], [], -1, 1), 0);
  assert.notEqual(orderStockError([{productId: 1, quantity: 1}], [{id: 1, name: 'Café', stock: null}]), '');
});

test('a stock refresh invalidates an existing quantity without requiring a new order', () => {
  const items = [{productId: 1, quantity: '50'}];
  assert.equal(orderStockError(items, products), '');
  assert.match(orderStockError(items, [{...products[0], stock: 40}]), /solicitaste 50.*40 disponibles/);
});
