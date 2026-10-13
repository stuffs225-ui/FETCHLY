import 'dotenv/config'
import express from 'express'
import rateLimit from 'express-rate-limit'
import http from 'node:http'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { db, setSetting, togetherStats } from './db.js'
import {
  config, names, isProduction, requireMe, sameOrigin, safeEqual, issueCookie, clearCookie, whoFromCookieHeader, partnerOf,
} from './auth.js'
import { attachLive, stateOf, waitingFor } from './live.js'
import { bottlesRouter } from './bottles.js'
import { initPush, vapidPublicKey, saveSubscription, removeSubscription } from './push.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

if (!config.passphrase) {
  console.error('[startup] ROOM_PASSPHRASE must be set in production — it is the secret that keeps this place private.')
  process.exit(1)
}

initPush()

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(sameOrigin)

app.use((_req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'microphone=(self), camera=(), geolocation=()',
  })
  next()
})

const enterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_attempts' },
})

const profile = (who) => ({
  who,
  partner: partnerOf(who),
  names: names(),
  genders: config.genders,
})

app.post('/api/enter', enterLimiter, express.json({ limit: '2kb' }), (req, res) => {
  const { passphrase, who } = req.body ?? {}
  if ((who !== 'a' && who !== 'b') || typeof passphrase !== 'string' || !safeEqual(passphrase, config.passphrase)) {
    return res.status(401).json({ error: 'wrong' })
  }
  issueCookie(res, who)
  res.json(profile(who))
})

app.post('/api/leave', (_req, res) => {
  clearCookie(res)
  res.status(204).end()
})

app.get('/api/me', (req, res) => {
  const who = whoFromCookieHeader(req.headers.cookie)
  if (!who) return res.status(401).json({ error: 'unauthorized' })
  res.json({ ...profile(who), together: togetherStats(), waiting: waitingFor(who), partnerState: stateOf(partnerOf(who)) })
})

app.put('/api/profile', requireMe, express.json({ limit: '2kb' }), (req, res) => {
  const name = String(req.body?.name ?? '').trim().slice(0, 24)
  if (!name) return res.status(400).json({ error: 'empty' })
  setSetting(`name_${req.who}`, name)
  res.json(profile(req.who))
})

app.get('/api/push/key', requireMe, (_req, res) => res.json({ key: vapidPublicKey() }))
app.post('/api/push/subscribe', requireMe, express.json({ limit: '4kb' }), (req, res) => {
  const sub = req.body
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) return res.status(400).json({ error: 'bad_subscription' })
  saveSubscription(req.who, sub)
  res.status(204).end()
})
app.post('/api/push/unsubscribe', requireMe, express.json({ limit: '2kb' }), (req, res) => {
  if (req.body?.endpoint) removeSubscription(req.body.endpoint)
  res.status(204).end()
})

app.use('/api/bottles', bottlesRouter)
app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }))

const distDir = path.join(__dirname, '../dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { maxAge: isProduction ? '1h' : 0, setHeaders: (res, file) => {
    if (file.endsWith('sw.js') || file.endsWith('index.html')) res.set('Cache-Control', 'no-cache')
  } }))
  app.get(/^(?!\/api|\/ws).*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')))
}

app.use((err, _req, res, next) => {
  if (!err) return next()
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'too_large' })
  console.error(err)
  res.status(400).json({ error: 'bad_request' })
})

const server = http.createServer(app)
attachLive(server)

const port = Number(process.env.PORT) || 4000
server.listen(port, () => {
  console.log(`[server] نبضنا listening on ${port} (${isProduction ? 'production' : 'development'})`)
  if (!process.env.ROOM_PASSPHRASE) console.warn('[server] ROOM_PASSPHRASE not set — using the insecure development passphrase "dev".')
})

process.on('SIGTERM', () => { db.close(); process.exit(0) })
