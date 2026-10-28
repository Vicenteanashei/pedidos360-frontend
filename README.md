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

Docker sirve la compilación con Nginx. Para el host frontend, preparar infra/.env a partir de infra/.env.example y configurar los identificadores de Entra, el origen HTTPS de la API y el puerto de escucha:

```bash
bash scripts/deploy-host.sh frontend infra/.env
```

La configuración de las otras dos EC2, los microservicios, Oracle y los tres nodos Rabbit pertenece al repositorio backend. Este frontend muestra el panel de administración del broker y consulta su API.

## Configuración pública y privada

Las variables VITE_* forman parte del JavaScript entregado al navegador: usar únicamente identificadores de aplicación y URLs públicas, nunca contraseñas o client secrets. La SPA no utiliza client secret.

Mantener .env.local, infra/.env, tokens, respuestas de pruebas y datos personales fuera de Git y del contexto Docker. Los hooks de publicación usan scripts/verify-public.py y requieren Gitleaks.
