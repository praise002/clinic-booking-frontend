import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

import { forward } from './api/_proxy.js'

// In dev, /api/* runs through the same forward() as the Vercel function.
// API_BASE_URL and API_KEY come from .env.local without a VITE_ prefix, so Vite never
// puts them in the browser bundle.
function apiProxy(env) {
  return {
    name: 'api-proxy',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res) => {
        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
        const request = new Request(`http://localhost${req.originalUrl}`, {
          method: req.method,
          headers: req.headers,
          body: hasBody ? Buffer.concat(chunks) : undefined,
        })

        const response = await forward(request, {
          apiBaseUrl: env.API_BASE_URL,
          apiKey: env.API_KEY,
        })

        res.statusCode = response.status
        response.headers.forEach((value, name) => res.setHeader(name, value))
        res.end(Buffer.from(await response.arrayBuffer()))
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), apiProxy(env)],
    // 5173 is taken by another project on this machine.
    server: { port: 5180, strictPort: true },
  }
})
