import {request} from './http';
const cache=new Map(), listeners=new Set();
export const getProducts=(storeId=1)=>cache.get(Number(storeId))||[];
export const productById=id=>[...cache.values()].flat().find(p=>p.id===Number(id));
export const productName=id=>productById(id)?.name||`Producto #${id}`;
export const subscribe=fn=>{listeners.add(fn);return()=>listeners.delete(fn);};
export async function refreshCatalog(storeId=1){const rows=await request(`/api/catalog/products?storeId=${Number(storeId)}`);cache.set(Number(storeId),rows);listeners.forEach(fn=>fn());return rows;}
export async function saveProduct(product){await request(product.id?`/api/catalog/products/${product.id}`:'/api/catalog/products',{method:product.id?'PUT':'POST',body:product});await refreshCatalog(product.storeId);}
export async function deactivateProduct(product){await request(`/api/catalog/products/${product.id}`,{method:'DELETE'});await refreshCatalog(product.storeId);}
