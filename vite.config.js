import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Puerto fijo: tiene que coincidir con las Redirect URI del registro de la SPA en Entra ID
// y con CORS_ALLOWED_ORIGINS del BFF.
// Multipágina: redirect.html (el puente de MSAL) también tiene que quedar en el build.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  let proxy;
  if (env.P360_DEV_API_TARGET) {
    const target = new URL(env.P360_DEV_API_TARGET);
    if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password || target.search || target.hash || target.pathname !== '/') {
      throw new Error('P360_DEV_API_TARGET debe ser el origen de la API, sin credenciales ni ruta.');
    }
    proxy = {
      '^/api(?:/|$)': {
        target: target.origin,
        changeOrigin: true,
        secure: true,
        configure(instance) {
          instance.on('proxyReq', (proxyReq) => {
            // Same-origin browser requests reach the configured API through the dev server.
            if (proxyReq.getHeader('origin')) proxyReq.setHeader('origin', target.origin);
          });
        },
      },
    };
  }
  return {
  plugins: [react()],
  server: { port: 5173, strictPort: true, proxy },
  preview: { port: 5173, strictPort: true },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        redirect: fileURLToPath(new URL('./redirect.html', import.meta.url)),
      },
    },
  },
  };
});
