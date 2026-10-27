import {useEffect,useState,useCallback} from 'react';
import {getProducts,refreshCatalog,subscribe} from '../api/catalogStore';
export function useCatalog(storeId=1){
 const [products,setProducts]=useState(()=>getProducts(storeId));const [loading,setLoading]=useState(true);const [error,setError]=useState('');
 const reload=useCallback(async()=>{setLoading(true);setError('');try{await refreshCatalog(storeId);}catch(e){setError(e.message);}finally{setLoading(false);}},[storeId]);
 useEffect(()=>{let live=true;setProducts(getProducts(storeId));setLoading(true);setError('');const off=subscribe(()=>{if(live)setProducts(getProducts(storeId));});refreshCatalog(storeId).catch(e=>{if(live)setError(e.message);}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;off();};},[storeId]);
 return {products,loading,error,reload};
}
