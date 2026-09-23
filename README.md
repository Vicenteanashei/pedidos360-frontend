# Pedidos360 — Frontend

Frontend de **Pedidos360**, hecho con React + Vite, React Router y MSAL (la librería de Microsoft para el login). Sigue las **pantallas propuestas** del caso: login con Microsoft Entra ID, dashboard, gestión de pedidos, catálogo, reportes y auditoría.

El backend (microservicios en Spring Boot) está en el repositorio **`pedidos360-backend`**.

## Pantallas

| Ruta | Componente | Acceso | Qué hace |
|---|---|---|---|
| `/login` | `LoginComponent` | Público | Botón "Iniciar sesión con Microsoft" (MSAL + Entra ID). Si ya hay sesión, redirige al dashboard |
| `/auth/callback` | `AuthCallbackComponent` | Público | Componente auxiliar: tras el login redirige al dashboard |
| `/dashboard` | `DashboardComponent` | Autenticado | Vista inicial con header y menú lateral: KPIs (pedidos, en curso, ventas, lead time), pedidos pendientes de aceptar y últimos pedidos |
| `/orders` | `OrdersComponent` | Autenticado | Gestión de pedidos: `OrderListComponent` (tabla filtrable), `OrderDetailComponent` (ver, cambiar estado, editar, eliminar), `OrderStatusBadgeComponent` y formulario para crear |
| `/catalog` | `CatalogComponent` | Autenticado | Productos en grilla (`ProductCardComponent`), crear/editar (`ProductFormComponent`) y control de stock |
| `/reports` | `ReportsComponent` | Autenticado | `SalesChartComponent` (ventas por hora), `LeadTimeChartComponent` y `TopProductsChartComponent`, con rango 24 h / 7 días |
| `/audit` | `AuditComponent` | Autenticado | Línea de tiempo de eventos de pedidos, con filtros por usuario, rango de fechas y tipo de evento |
| `/session` | `SessionComponent` | Autenticado | Datos del access token y pruebas contra el BFF (`/api/orders` 401/200 y `/api/data` 200) |

Todas las rutas autenticadas pasan por el guard `RequireAuth`: sin sesión, redirige a `/login`.

## De dónde salen los datos

- **Pedidos**: del BFF (`/api/orders`), con el access token en cada llamada.
- **Catálogo**: provisional, guardado en el navegador (`src/api/catalogStore.js`) hasta que exista `ms-pedidos360-catalog`. El stock baja al **aceptar** un pedido, como pide el caso.
- **Reportes y auditoría**: calculados a partir de los pedidos hasta que existan `ms-pedidos360-report` y `ms-pedidos360-audit` (Kafka).

## Cómo levantarlo

Necesitas Node.js 20 o superior y el backend corriendo (el BFF en `http://localhost:8080`).

```bash
npm install
npm run dev
```

Queda en **http://localhost:5173**. El puerto es fijo porque tiene que coincidir con la URI de redirección registrada en Azure.

## Configuración

Los datos de Azure ya vienen puestos por defecto en `src/auth/authConfig.js`. Para apuntar a otro backend (por ejemplo, el API Gateway de AWS), crea `.env.local` (hay un ejemplo en `.env.example`):

```
VITE_API_BASE_URL=https://<id>.execute-api.<region>.amazonaws.com
```

y reinicia `npm run dev`. El archivo `.env.local` no se sube a GitHub.

## Azure (Entra ID)

- Tenant: `vicho1.onmicrosoft.com`
- En el registro de la SPA, plataforma **"Aplicación de página única"**, tiene que estar la URI de redirección `http://localhost:5173/redirect.html`.
- La app pide el permiso `api://<API_CLIENT_ID>/access_as_user` del registro de la API.

## Estructura

```
src/
  auth/            authConfig (MSAL), msalInstance, token (obtener y leer el token), AuthGate (useSession)
  guards/          RequireAuth: protege las rutas
  layout/          Layout: header + menú lateral
  pages/           Una pantalla por ruta (LoginComponent, DashboardComponent, OrdersComponent, ...)
  components/      orders/, catalog/, reports/, session/
  api/             http (llamadas con token), ordersApi, catalogStore
  hooks/           useOrders, useCatalog
  constants/       estados de pedido y locales
redirect.html      Página a la que vuelve el popup de login de Microsoft
```
