# Pedidos360 — Frontend

Frontend de **Pedidos360**, hecho con React + Vite y la librería MSAL de Microsoft. Sirve para iniciar sesión con Microsoft Entra ID, revisar el token que entrega Microsoft y probarlo contra el backend.

El backend (microservicios en Spring Boot) está en el repositorio **`pedidos360-backend`**.

## Qué muestra

Es una sola página con cuatro secciones:

1. **Iniciar sesión**: botón para entrar con Microsoft y para cerrar sesión.
2. **¿El token viene bien?**: comprueba el emisor, la audiencia y el scope del access token, y muestra sus datos (usuario, nombre, iss, aud, scp y expiración). Tiene un botón para copiar el token y probarlo con `curl`.
3. **Probar contra el BFF**: llama a `/api/orders` sin token (esperado **401**) y con token (esperado **200**) y muestra la respuesta.
4. **Prueba 2: solicitud con token válido**: llama a `GET /api/data` del BFF con el token (esperado **200** y el mensaje *Acceso autorizado a Spring Boot*). También explica cómo hacer la misma prueba desde PowerShell o la terminal de Linux.

## Cómo levantarlo

Necesitas Node.js 20 o superior y el backend corriendo (el BFF en `http://localhost:8080`).

```bash
npm install
npm run dev
```

Queda en **http://localhost:5173**. El puerto es fijo porque tiene que coincidir con la URI de redirección registrada en Azure.

## Configuración

Los datos de Azure ya vienen puestos por defecto en `src/auth/authConfig.js`. Si necesitas cambiar algo, por ejemplo apuntar al API Gateway de AWS en vez del BFF local, crea un archivo `.env.local` (hay un ejemplo en `.env.example`):

```
VITE_API_BASE_URL=https://<id>.execute-api.<region>.amazonaws.com
```

Después reinicia `npm run dev`. El archivo `.env.local` no se sube a GitHub.

## Azure (Entra ID)

- Tenant: `vicho1.onmicrosoft.com`
- En el registro de la SPA, plataforma **"Aplicación de página única"**, tiene que estar la URI de redirección `http://localhost:5173/redirect.html`.
- La app pide el permiso `api://<API_CLIENT_ID>/access_as_user` del registro de la API.

## Estructura

```
src/
  auth/authConfig.js       Configuración de MSAL (tenant, client IDs, scope)
  auth/AuthGate.jsx        Estado de la sesión: login, logout y obtención del token
  auth/LoginPage.jsx       Sección 1: iniciar y cerrar sesión
  auth/token.js            Obtener el access token y leer sus datos
  components/SessionInfo.jsx  Secciones 2 y 3: revisar el token y probarlo contra el BFF
  components/ApiDataTest.jsx  Sección 4: prueba con token válido contra GET /api/data
  api/http.js              URL del backend y llamadas con el token
redirect.html              Página a la que vuelve el popup de login de Microsoft
```
