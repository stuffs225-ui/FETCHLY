import 'dotenv/config'
import express from 'express'
import rateLimit from 'express-rate-limit'
import http from 'node:http'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { db, togetherStats } from './db.js'
import {
  isProduction, linkTokens, anyPasswordSet, whoForToken, hasPassword, setPassword, checkPassword, issueCookie, requireMe, sameOrigin,
  whoFromCookieHeader, partnerOf,
} from './auth.js'
import { attachLive, stateOf, waitingFor } from './live.js'
import { bottlesRouter } from './bottles.js'
import { locationRouter, distanceInfo } from './location.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT) || 4000

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(sameOrigin)

app.use((_req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'microphone=(self), geolocation=(self), camera=()',
  })
  next()
})

const joinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_attempts' },
})

const profile = (who) => ({ who, partner: partnerOf(who) })

// Step 1 of opening a private link: is it valid, and does this person still need to choose a password?
app.get('/api/join', joinLimiter, (req, res) => {
  const who = whoForToken(req.query.k)
  if (!who) return res.status(404).json({ error: 'invalid_link' })
  res.json({ who, needsPassword: !hasPassword(who) })
})

// Step 2: the first time they choose a password; after that (new phone, cleared data) they type it.
app.post('/api/join', joinLimiter, express.json({ limit: '2kb' }), (req, res) => {
  const { k, password } = req.body ?? {}
  const who = whoForToken(k)
  if (!who || typeof password !== 'string') return res.status(404).json({ error: 'invalid_link' })
  if (!hasPassword(who)) {
    if (password.length < 4 || password.length > 100) return res.status(400).json({ error: 'weak_password' })
    setPassword(who, password)
  } else if (!checkPassword(who, password)) {
    return res.status(401).json({ error: 'wrong' })
  }
  issueCookie(req, res, who)
  res.json(profile(who))
})

// First-run helper: until the first person has chosen a password, the home page can show both private links
// so the owner can simply open the site and forward the other person's link. After that it is closed for good.
app.get('/api/setup', joinLimiter, (_req, res) => {
  if (anyPasswordSet()) return res.status(404).json({ error: 'done' })
  res.json({ links: { a: linkTokens.a, b: linkTokens.b } })
})

// Lets a logged-in person re-send the other person's link (e.g. if it was lost).
app.get('/api/partner-link', requireMe, (req, res) => res.json({ key: linkTokens[partnerOf(req.who)] }))

app.get('/api/me', (req, res) => {
  const who = whoFromCookieHeader(req.headers.cookie)
  if (!who) return res.status(401).json({ error: 'unauthorized' })
  res.json({ ...profile(who), together: togetherStats(), waiting: waitingFor(who), partnerState: stateOf(partnerOf(who)), distance: distanceInfo() })
})

app.use('/api/bottles', bottlesRouter)
app.use('/api/location', locationRouter)
app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }))

const distDir = path.join(__dirname, '../dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, {
    maxAge: isProduction ? '1h' : 0,
    setHeaders: (res, file) => { if (file.endsWith('index.html')) res.set('Cache-Control', 'no-cache') },
  }))
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

server.listen(port, () => {
  const base = (process.env.BASE_URL || `http://localhost:${port}`).replace(/\/$/, '')
  console.log(`[server] نبضنا listening on ${port} (${isProduction ? 'production' : 'development'})`)
  console.log('[links] Private links (each opens once per phone, then is remembered):')
  console.log(`        A (her): ${base}/?k=${linkTokens.a}`)
  console.log(`        B (him): ${base}/?k=${linkTokens.b}`)
})

process.on('SIGTERM', () => { db.close(); process.exit(0) })
