import {createContext,useContext,useEffect,useState} from 'react';
import {useMsal} from '@azure/msal-react';
import {getAccessToken} from './token';
const Context=createContext({roles:[],loading:true,has:()=>false});
export function PermissionsProvider({children}) {
 const {instance,accounts}=useMsal();const account=accounts[0];const [state,setState]=useState({roles:[],loading:true,error:''});
 useEffect(()=>{let active=true;if(!account){setState({roles:[],loading:false,error:''});return;}
 setState({roles:[],loading:true,error:''});
 getAccessToken(instance,account).then(token=>{const payload=token.split('.')[1];const bytes=Uint8Array.from(atob(payload.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(payload.length/4)*4,'=')),c=>c.charCodeAt(0));const claims=JSON.parse(new TextDecoder().decode(bytes));if(active)setState({roles:claims.roles||[],actorId:`${claims.tid}:${claims.oid||claims.sub}`,loading:false,error:''});}).catch(e=>{if(active)setState({roles:[],loading:false,error:e.message});});
 return()=>{active=false;};},[instance,account?.homeAccountId]);
 const has=(...allowed)=>allowed.some(r=>state.roles.includes(r));return <Context.Provider value={{...state,has}}>{children}</Context.Provider>;
}
export const usePermissions=()=>useContext(Context);
export function RoleGate({roles,children}){const p=usePermissions();if(p.loading)return <p>Comprobando permisos…</p>;if(p.error)return <p className="error">{p.error}</p>;return p.has(...roles)?children:<p className="error">Tu rol no tiene acceso a esta pantalla. Revisa Mi sesión.</p>;}
