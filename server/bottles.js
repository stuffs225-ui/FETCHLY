import { Router } from 'express'
import express from 'express'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { db, audioDir } from './db.js'
import { requireMe, partnerOf } from './auth.js'
import { broadcastTo, waitingFor } from './live.js'

export const bottlesRouter = Router()
bottlesRouter.use(requireMe)

const MAX_TEXT = 600
const AUDIO_TYPES = new Set(['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg', 'audio/aac', 'audio/x-m4a'])
const audioPath = (id) => path.join(audioDir, `${id}.bin`)

const shape = (b, { withText = true } = {}) => ({
  id: b.id,
  kind: b.kind,
  text: withText ? b.text : null,
  createdAt: b.createdAt,
  openedAt: b.openedAt,
  audioUrl: b.kind === 'voice' ? `/api/bottles/${b.id}/audio` : null,
})

function afterThrow(who) {
  const p = partnerOf(who)
  broadcastTo(p, { t: 'bottle', waiting: waitingFor(p) })
}

bottlesRouter.post('/', express.json({ limit: '10kb' }), (req, res) => {
  const text = String(req.body?.text ?? '').trim().slice(0, MAX_TEXT)
  if (!text) return res.status(400).json({ error: 'empty' })
  const info = db
    .prepare("INSERT INTO bottles (author, kind, text, createdAt) VALUES (?, 'text', ?, ?)")
    .run(req.who, text, Date.now())
  afterThrow(req.who)
  res.status(201).json({ id: info.lastInsertRowid })
})

bottlesRouter.post('/voice', express.raw({ type: () => true, limit: '3mb' }), (req, res) => {
  const mime = String(req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase()
  if (!AUDIO_TYPES.has(mime) || !Buffer.isBuffer(req.body) || req.body.length < 500) {
    return res.status(400).json({ error: 'bad_audio' })
  }
  const text = String(req.query.text ?? '').trim().slice(0, MAX_TEXT) || null
  const info = db
    .prepare("INSERT INTO bottles (author, kind, text, audioMime, createdAt) VALUES (?, 'voice', ?, ?, ?)")
    .run(req.who, text, mime, Date.now())
  fs.writeFileSync(audioPath(info.lastInsertRowid), req.body)
  afterThrow(req.who)
  res.status(201).json({ id: info.lastInsertRowid })
})

bottlesRouter.get('/waiting', (req, res) => {
  res.json({ waiting: waitingFor(req.who) })
})

/**
 * The heart of the "pure chance" idea: the draw happens on the server with a
 * CSPRNG so neither of them can influence or predict it. Unread bottles are
 * favoured (3:1) but an old one can always float back.
 */
bottlesRouter.post('/draw', (req, res) => {
  const mine = req.who
  const all = db.prepare('SELECT * FROM bottles WHERE author = ?').all(partnerOf(mine))
  if (all.length === 0) return res.json({ empty: true })

  const unread = all.filter((b) => !b.openedAt)
  const pool = unread.length > 0 ? [...unread, ...unread, ...unread, ...all] : all
  const picked = pool[crypto.randomInt(pool.length)]
  const fresh = !picked.openedAt

  db.prepare('UPDATE bottles SET openedAt = COALESCE(openedAt, ?), openedCount = openedCount + 1 WHERE id = ?').run(Date.now(), picked.id)
  const updated = db.prepare('SELECT * FROM bottles WHERE id = ?').get(picked.id)

  if (fresh) {
    broadcastTo(partnerOf(mine), { t: 'opened', id: picked.id })
    broadcastTo(mine, { t: 'bottle', waiting: waitingFor(mine) })
  }
  res.json({ bottle: shape(updated), fresh, waiting: waitingFor(mine) })
})

/** What I threw into the sea, and whether it has been found yet. */
bottlesRouter.get('/mine', (req, res) => {
  const rows = db.prepare('SELECT * FROM bottles WHERE author = ? ORDER BY createdAt DESC').all(req.who)
  res.json(rows.map((b) => shape(b)))
})

/** Bottles from my partner that I already opened — kept like shells on the shore. */
bottlesRouter.get('/kept', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM bottles WHERE author = ? AND openedAt IS NOT NULL ORDER BY openedAt DESC')
    .all(partnerOf(req.who))
  res.json(rows.map((b) => shape(b)))
})

bottlesRouter.delete('/:id', (req, res) => {
  const id = Number(req.params.id)
  const row = db.prepare('SELECT * FROM bottles WHERE id = ? AND author = ?').get(id, req.who)
  if (!row) return res.status(404).json({ error: 'not_found' })
  db.prepare('DELETE FROM bottles WHERE id = ?').run(id)
  fs.rmSync(audioPath(id), { force: true })
  broadcastTo(partnerOf(req.who), { t: 'bottle', waiting: waitingFor(partnerOf(req.who)) })
  res.status(204).end()
})

// A voice note can't be peeked at before its recipient has drawn the bottle.
bottlesRouter.get('/:id/audio', (req, res) => {
  const id = Number(req.params.id)
  const row = db.prepare("SELECT * FROM bottles WHERE id = ? AND kind = 'voice'").get(id)
  if (!row) return res.status(404).end()
  const isAuthor = row.author === req.who
  if (!isAuthor && !row.openedAt) return res.status(403).end()
  if (!fs.existsSync(audioPath(id))) return res.status(404).end()
  res.set('Content-Type', row.audioMime)
  res.set('Cache-Control', 'private, max-age=3600')
  res.sendFile(audioPath(id))
})
