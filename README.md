# Pedidos360 frontend

Interfaz React para pedidos, catálogo, notificaciones, comprobantes, reportes, auditoría y administración de RabbitMQ. Consume la API de [pedidos360-backend](https://github.com/Vicenteanashei/pedidos360-backend).

El inicio de sesión usa Microsoft Entra ID con MSAL/PKCE. Los permisos distinguen Admin, Operador, Cliente y Auditor; la API vuelve a verificar los permisos de cada operación.

## Ejecutar

Con Node.js y npm disponibles, desde la raíz:

```bash
npm ci
cp .env.example .env.local
# Completar los identificadores propios y la URL de la API.
npm run dev
```

Registrar en Entra el redirect /redirect.html del origen utilizado. Fuera de localhost, la API debe usar HTTPS. El diagnóstico de sesión es opcional y VITE_DIAGNOSTICS queda desactivado por defecto.

## Compilar y desplegar

```bash
npm run build
```

### En AWS: S3 + CloudFront (sin EC2)

El build estático se publica en un bucket S3 privado y CloudFront lo sirve por HTTPS mediante Origin Access Control. Las rutas de la SPA (/orders, /catalog…) vuelven a index.html.

1. Crear el stack con `infra/aws/frontend-s3-cloudfront.json`. Sus salidas son BucketName, DistributionId, FrontendUrl y RedirectUri.
2. Registrar RedirectUri en la aplicación SPA de Entra (plataforma Single-page application).
3. Usar FrontendUrl como `FrontendOrigin` del API Gateway y en `CORS_ALLOWED_ORIGINS` del backend.
4. Preparar infra/.env con los identificadores de Entra y `PUBLIC_API_URL` = URL HTTPS del API Gateway, y publicar desde CloudShell o la terminal del Learner Lab (AWS CLI y Node 20+ o Docker):

```bash
bash scripts/deploy-s3.sh <stack-frontend> infra/.env
```

Cada publicación sube los assets con caché larga, el HTML sin caché e invalida CloudFront.

### Local con Docker

Docker sirve la compilación con Nginx, útil para pruebas locales:

```bash
bash scripts/deploy-host.sh frontend infra/.env
```

La configuración de la EC2 de aplicaciones (BFF y microservicios), RDS Oracle y los tres nodos Rabbit pertenece al repositorio backend. Este frontend muestra el panel de administración del broker y consulta su API.

## Configuración pública y privada

Las variables VITE_* forman parte del JavaScript entregado al navegador: usar únicamente identificadores de aplicación y URLs públicas, nunca contraseñas o client secrets. La SPA no utiliza client secret.

Mantener .env.local, infra/.env, tokens, respuestas de pruebas y datos personales fuera de Git y del contexto Docker. Los hooks de publicación usan scripts/verify-public.py y requieren Gitleaks.
