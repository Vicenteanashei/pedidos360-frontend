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
import SessionComponent from './pages/SessionComponent';

// Rutas segun "Pantallas propuestas" del caso Pedidos360
export default function App() {
  return (
    <Routes>
      {/* Publicas */}
      <Route path="/login" element={<LoginComponent />} />
      <Route path="/auth/callback" element={<AuthCallbackComponent />} />

      {/* Protegidas: requieren sesion con Entra ID */}
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/dashboard" element={<DashboardComponent />} />
        <Route path="/orders" element={<OrdersComponent />} />
        <Route path="/catalog" element={<CatalogComponent />} />
        <Route path="/reports" element={<ReportsComponent />} />
        <Route path="/audit" element={<AuditComponent />} />
        <Route path="/session" element={<SessionComponent />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
