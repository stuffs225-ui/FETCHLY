import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import multer from 'multer'

import { bootstrapAdmin } from './db.js'
import { SqliteSessionStore } from './lib/sqliteSessionStore.js'
import { authRouter } from './routes/auth.js'
import { requestsRouter } from './routes/requests.js'
import { quotationsRouter } from './routes/quotations.js'
import { settingsRouter } from './routes/settings.js'
import { publicRouter } from './routes/public.js'
import { usersRouter } from './routes/users.js'
import { logsRouter } from './routes/logs.js'
import { casesRouter, faqsRouter, credentialsRouter, savedProductsRouter, savedTermsRouter } from './routes/cms.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
bootstrapAdmin()

const app = express()
app.set('trust proxy', 1)

const isProduction = process.env.NODE_ENV === 'production'
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(cors({ origin: frontendUrl, credentials: true }))
app.use(cookieParser())
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true }))

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret && isProduction) {
  console.error('[startup] SESSION_SECRET must be set in production. Refusing to start with an insecure default.')
  process.exit(1)
}

app.use(
  session({
    store: new SqliteSessionStore(),
    name: 'fetchly.sid',
    secret: sessionSecret || 'dev-only-insecure-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
)

app.use('/api/auth', authRouter)
app.use('/api/requests', requestsRouter)
app.use('/api/quotations', quotationsRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/public', publicRouter)
app.use('/api/users', usersRouter)
app.use('/api/logs', logsRouter)
app.use('/api/cms/cases', casesRouter)
app.use('/api/cms/faqs', faqsRouter)
app.use('/api/cms/credentials', credentialsRouter)
app.use('/api/cms/saved-products', savedProductsRouter)
app.use('/api/cms/saved-terms', savedTermsRouter)

app.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'upload_error', detail: err.message })
  }
  if (err) {
    console.error(err)
    return res.status(400).json({ error: 'bad_request', detail: err.message })
  }
  next()
})

if (isProduction) {
  const distDir = path.join(__dirname, '../dist')
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir))
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'))
    })
  }
}

const port = Number(process.env.PORT) || 4000
app.listen(port, () => {
  console.log(`[server] FETCHLY API listening on port ${port} (${isProduction ? 'production' : 'development'})`)
})
