import { NavLink, Outlet } from 'react-router-dom';
import {usePermissions} from '../auth/Permissions';
import { useSession } from '../auth/AuthGate';

const MENU = [
  { to: '/dashboard', label: 'Inicio', icon: '🏠' },
  { to: '/orders', label: 'Pedidos', icon: '🧾' },
  { to: '/catalog', label: 'Catálogo', icon: '🥐' },
  { to: '/reports', label: 'Reportes', icon: '📊' },
  { to: '/audit', label: 'Auditoría', icon: '🕓' },
  {to:'/rabbit',label:'RabbitMQ',icon:'🐇'},
  {to:'/notifications',label:'Notificaciones',icon:'✉️'},
  { to: '/session', label: 'Mi sesión', icon: '🔑' },
];

// Layout base: header + menu lateral (pantalla "Dashboard principal" del caso)
export default function Layout() {
  const session = useSession();
  const p=usePermissions();
  const allowed={dashboard:['Admin','Operador','Cliente'],orders:['Admin','Operador','Cliente'],catalog:['Admin','Operador','Cliente'],reports:['Admin'],audit:['Admin','Auditor'],rabbit:['Admin'],notifications:['Admin','Cliente']};
  return (
    <div className="shell">
      <header className="header">
        <div className="brand">Pedidos360</div>
        <div className="user">
          <span className="muted small">Sesión iniciada como</span> <b>{session.username}</b>
          <button className="btn" onClick={session.logout}>Cerrar sesión</button>
        </div>
      </header>
      <aside className="sidebar">
        <nav>
          {MENU.filter(m=>m.to==='/session'||p.has(...(allowed[m.to.slice(1)]||[]))).map((m) => (
            <NavLink key={m.to} to={m.to} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
              <span className="nav-icon">{m.icon}</span>{m.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
