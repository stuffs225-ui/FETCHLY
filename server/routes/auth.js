import { Router } from 'express'
import { verifyLogin, publicUser, requireAdmin, loginRateLimiter } from '../lib/auth.js'

export const authRouter = Router()

authRouter.post('/login', loginRateLimiter, (req, res) => {
  const { email, password } = req.body ?? {}
  if (!email || !password) return res.status(400).json({ error: 'missing_credentials' })

  const result = verifyLogin(email, password)
  if (!result.ok) {
    return res.status(401).json({ error: result.reason })
  }

  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'session_error' })
    req.session.adminUserId = result.user.id
    res.json({ user: publicUser(result.user) })
  })
})

authRouter.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('fetchly.sid')
    res.json({ ok: true })
  })
})

authRouter.get('/me', requireAdmin, (req, res) => {
  res.json({ user: publicUser(req.adminUser) })
})
