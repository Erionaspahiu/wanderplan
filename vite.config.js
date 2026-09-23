import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Dev-only: runs the /api/flights/*.js serverless functions inside the
// Vite dev server, so `npm run dev` works end-to-end without needing
// `vercel dev`. Has no effect on `vite build` — configureServer only
// runs in dev — and changes nothing about how Vercel deploys the real
// functions in production.
function flightsApiDevMiddleware() {
  return {
    name: 'flights-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/flights/')) return next()

        const url = new URL(req.url, 'http://localhost')
        const route = url.pathname.replace('/api/flights/', '')
        if (!/^[a-z]+$/.test(route)) return next()

        try {
          const mod = await server.ssrLoadModule(`/api/flights/${route}.js`)
          const query = Object.fromEntries(url.searchParams)
          const shimRes = {
            _status: 200,
            status(code) {
              this._status = code
              return this
            },
            json(body) {
              res.statusCode = this._status
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(body))
            },
          }
          await mod.default({ query }, shimRes)
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message || 'Dev API middleware error' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite only auto-exposes VITE_-prefixed vars to process.env for its own
  // Node process; the dev API middleware above needs the server-only ones
  // too (DUFFEL_API_TOKEN etc.), so load .env with an empty prefix filter
  // and merge everything in. Build/production are unaffected — Vercel
  // injects its own env vars for the deployed serverless functions.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [react(), flightsApiDevMiddleware()],
  }
})
