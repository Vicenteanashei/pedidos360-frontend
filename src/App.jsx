import { Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './guards/RequireAuth';
import Layout from './layout/Layout';
import LoginComponent from './pages/LoginComponent';
import AuthCallbackComponent from './pages/AuthCallbackComponent';
import DashboardComponent from './pages/DashboardComponent';
import OrdersComponent from './pages/OrdersComponent';
import CatalogComponent from './pages/CatalogComponent';
import ReportsComponent from './pages/ReportsComponent';
import AuditComponent from './pages/AuditComponent';
import {RoleGate,usePermissions} from './auth/Permissions';
import RabbitComponent from './pages/RabbitComponent';
import NotificationsComponent from './pages/NotificationsComponent';
import SessionComponent from './pages/SessionComponent';

// Rutas segun "Pantallas propuestas" del caso Pedidos360
export default function App() {
  const permissions=usePermissions();
  return (
    <Routes>
      {/* Publicas */}
      <Route path="/login" element={<LoginComponent />} />
      <Route path="/auth/callback" element={<AuthCallbackComponent />} />

      {/* Protegidas: requieren sesion con Entra ID */}
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/dashboard" element={<RoleGate roles={['Admin','Operador','Cliente']}><DashboardComponent /></RoleGate>} />
        <Route path="/orders" element={<RoleGate roles={['Admin','Operador','Cliente']}><OrdersComponent /></RoleGate>} />
        <Route path="/catalog" element={<RoleGate roles={['Admin','Operador','Cliente']}><CatalogComponent /></RoleGate>} />
        <Route path="/reports" element={<RoleGate roles={['Admin']}><ReportsComponent /></RoleGate>} />
        <Route path="/audit" element={<RoleGate roles={['Admin','Auditor']}><AuditComponent /></RoleGate>} />
        <Route path="/rabbit" element={<RoleGate roles={['Admin']}><RabbitComponent /></RoleGate>} />
        <Route path="/notifications" element={<RoleGate roles={['Admin','Cliente']}><NotificationsComponent /></RoleGate>} />
        <Route path="/session" element={<SessionComponent />} />
      </Route>

      <Route path="*" element={<Navigate to={permissions.has('Auditor') && !permissions.has('Admin') ? '/audit' : '/dashboard'} replace />} />
    </Routes>
  );
}
