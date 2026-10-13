// Local / any-Node-host runner: the same handler as the Vercel function, plus the built frontend.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { handle } from './handler.js'
import { config } from './auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '../dist')
const port = Number(process.env.PORT) || 4000

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.ico': 'image/x-icon',
}

function serveStatic(req, res) {
  const url = new URL(req.url, 'http://x')
  let file = path.normalize(path.join(distDir, decodeURIComponent(url.pathname)))
  if (!file.startsWith(distDir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(distDir, 'index.html')
  if (!fs.existsSync(file)) {
    res.statusCode = 404
    return res.end('Build the frontend first: npm run build')
  }
  const ext = path.extname(file)
  res.setHeader('Content-Type', TYPES[ext] ?? 'application/octet-stream')
  res.setHeader('Cache-Control', ext === '.html' ? 'no-cache' : 'public, max-age=3600')
  fs.createReadStream(file).pipe(res)
}

http
  .createServer((req, res) => (req.url.startsWith('/api') ? handle(req, res) : serveStatic(req, res)))
  .listen(port, async () => {
    console.log(`[server] نبضنا listening on http://localhost:${port}`)
    try {
      const { tokens } = await config()
      console.log('[links] Private links (also shown on the home page until the first password is chosen):')
      console.log(`        A (her): http://localhost:${port}/?k=${tokens.a}`)
      console.log(`        B (him): http://localhost:${port}/?k=${tokens.b}`)
    } catch (e) {
      console.log('[server] database not ready:', e.message)
    }
  })
