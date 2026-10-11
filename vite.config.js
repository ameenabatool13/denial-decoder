   import { fileURLToPath } from 'node:url';
   import { loadEnv } from 'vite';
   import { defineConfig } from 'vitest/config';
   import react from '@vitejs/plugin-react';

   // Lets `npm run dev` serve /api/analyze locally (Vercel serves it in production).
   const devApi = (env) => ({
     name: 'dev-api',
     configureServer(server) {
       server.middlewares.use('/api/analyze', async (req, res) => {
         Object.assign(process.env, env);
         res.status = (c) => ((res.statusCode = c), res);
         res.json = (o) => {
           res.setHeader('content-type', 'application/json');
           res.end(JSON.stringify(o));
         };
         try {
           let raw = '';
           for await (const c of req) raw += c;
           req.body = raw ? JSON.parse(raw) : {};
         } catch {
           return res.status(400).json({ error: 'empty' });
         }
         const { default: handler } = await server.ssrLoadModule('/api/analyze.js');
         return handler(req, res);
       });
     },
   });

   export default defineConfig(({ mode }) => ({
     plugins: [react(), devApi(loadEnv(mode, process.cwd(), ''))],
     test: {
       environment: 'jsdom',
       globals: true,
       setupFiles: [fileURLToPath(new URL('./src/setupTests.js', import.meta.url))],
       coverage: { provider: 'v8', include: ['src/**'], exclude: ['src/main.jsx', 'src/**/*.test.*', 'src/setupTests.js'] },
     },
   }));