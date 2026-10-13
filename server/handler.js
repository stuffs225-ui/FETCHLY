import crypto from 'node:crypto'
import { q, getSetting, setSetting, dayKey, addTogether, togetherStats, NoDatabaseError, DatabaseUnavailableError } from './db.js'
import {
  config, whoForToken, hasPassword, anyPasswordSet, setPassword, checkPassword, issueCookie, whoFromRequest, partnerOf, tooManyAttempts,
} from './auth.js'
import { send, readJson, readBinary } from './http.js'

const HERE_MS = 15_000 // a visible page polls at least every ~6 s
const AWAY_MS = 90_000 // hidden page: shown as "away" for a while, then "gone"
const MAX_TEXT = 600
const AUDIO_TYPES = new Set(['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg', 'audio/aac', 'audio/x-m4a'])

const profile = (who) => ({ who, partner: partnerOf(who) })

// ---------------------------------------------------------------- presence

function stateFrom(row, now) {
  if (!row) return 'gone'
  const age = now - row.beat
  if (row.visible) return age < HERE_MS ? 'here' : 'gone'
  return age < AWAY_MS ? 'away' : 'gone'
}

async function pushEvent(to, kind) {
  await q('INSERT INTO nb_events (to_who, kind, created) VALUES ($1, $2, $3)', [to, kind, Date.now()])
}

async function sync(req, res, who) {
  const { visible } = await readJson(req)
  const now = Date.now()
  const partner = partnerOf(who)
  await q(
    `INSERT INTO nb_presence (who, beat, visible, seen) VALUES ($1, $2, $3, $2)
     ON CONFLICT (who) DO UPDATE SET beat = EXCLUDED.beat, visible = EXCLUDED.visible, seen = EXCLUDED.seen`,
    [who, now, visible !== false],
  )
  const [pres, waiting, events, distRaw] = await Promise.all([
    q('SELECT who, beat, visible, seen FROM nb_presence'),
    q('SELECT COUNT(*)::int AS n FROM nb_bottles WHERE author = $1 AND opened_at IS NULL', [partner]),
    q('DELETE FROM nb_events WHERE to_who = $1 RETURNING kind', [who]),
    getSetting('distance'),
  ])
  const by = Object.fromEntries(pres.map((r) => [r.who, r]))
  const states = { a: stateFrom(by.a, now), b: stateFrom(by.b, now) }

  // Count the time they actually spend together (guarding against gaps between polls).
  if (states.a === 'here' && states.b === 'here') {
    const tg = Number((await getSetting('tg')) ?? 0)
    if (tg && now - tg <= 7000) await addTogether((now - tg) / 1000)
    await setSetting('tg', now)
  }

  res.setHeader('Cache-Control', 'no-store')
  send(res, 200, {
    serverTime: now,
    partner: { state: states[partner], lastSeen: by[partner]?.seen ?? null },
    waiting: waiting[0].n,
    events: events.map((e) => e.kind),
    distance: readDistance(distRaw),
    together: await togetherStats(),
  })
}

// ---------------------------------------------------------------- distance

function haversine(a, b) {
  const R = 6371000
  const rad = (d) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const emptyDistance = { meters: null, precise: false, at: { a: null, b: null }, closestToday: null }

function readDistance(raw) {
  if (!raw) return emptyDistance
  try {
    const d = JSON.parse(raw)
    return { meters: d.meters, precise: d.precise, at: d.at, closestToday: d.closestDay === dayKey() ? d.closest : null }
  } catch {
    return emptyDistance
  }
}

/**
 * The only thing either person ever receives about the other's position:
 * a distance, how old each reading is, and whether it is precise enough to
 * claim "very close". Coordinates stay in the database.
 */
async function recomputeDistance() {
  const rows = Object.fromEntries((await q('SELECT * FROM nb_locations')).map((r) => [r.who, r]))
  const at = { a: rows.a?.updated ?? null, b: rows.b?.updated ?? null }
  const old = await getSetting('distance')
  let closest = null
  let closestDay = null
  try {
    const o = JSON.parse(old ?? 'null')
    if (o?.closestDay === dayKey()) { closest = o.closest; closestDay = o.closestDay }
  } catch { /* ignore */ }
  if (!rows.a || !rows.b) {
    return setSetting('distance', JSON.stringify({ meters: null, precise: false, at, closest, closestDay }))
  }
  const meters = Math.round(haversine(rows.a, rows.b))
  const precise = rows.a.accuracy + rows.b.accuracy < 250
  if (Date.now() - Math.min(at.a, at.b) < 10 * 60 * 1000 && (closest === null || meters < closest)) {
    closest = meters
    closestDay = dayKey()
  }
  await setSetting('distance', JSON.stringify({ meters, precise, at, closest, closestDay }))
}
async function putLocation(req, res, who) {
  const { lat, lng, accuracy } = await readJson(req)
  if (![lat, lng, accuracy].every((n) => typeof n === 'number' && Number.isFinite(n)) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return send(res, 400, { error: 'bad_location' })
  }
  await q(
    `INSERT INTO nb_locations (who, lat, lng, accuracy, updated) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (who) DO UPDATE SET lat = EXCLUDED.lat, lng = EXCLUDED.lng, accuracy = EXCLUDED.accuracy, updated = EXCLUDED.updated`,
    [who, Math.round(lat * 1e4) / 1e4, Math.round(lng * 1e4) / 1e4, Math.min(Math.max(accuracy, 1), 100000), Date.now()],
  )
  await recomputeDistance()
  send(res, 204)
}

async function deleteLocation(_req, res, who) {
  await q('DELETE FROM nb_locations WHERE who = $1', [who])
  await recomputeDistance()
  send(res, 204)
}

// ---------------------------------------------------------------- bottles

const shape = (b) => ({
  id: b.id,
  kind: b.kind,
  text: b.body,
  createdAt: b.created_at,
  openedAt: b.opened_at,
  audioUrl: b.kind === 'voice' ? `/api/bottles/${b.id}/audio` : null,
})
const LIST = 'id, author, kind, body, created_at, opened_at'

async function throwText(req, res, who) {
  const text = String((await readJson(req)).text ?? '').trim().slice(0, MAX_TEXT)
  if (!text) return send(res, 400, { error: 'empty' })
  const r = await q("INSERT INTO nb_bottles (author, kind, body, created_at) VALUES ($1, 'text', $2, $3) RETURNING id", [who, text, Date.now()])
  send(res, 201, { id: r[0].id })
}

async function throwVoice(req, res, who, url) {
  const mime = String(req.headers['x-audio-type'] ?? '').split(';')[0].trim().toLowerCase()
  const buf = await readBinary(req, 1_500_000)
  if (!AUDIO_TYPES.has(mime) || !buf || buf.length < 500) return send(res, 400, { error: 'bad_audio' })
  const text = (url.searchParams.get('text') ?? '').trim().slice(0, MAX_TEXT) || null
  const r = await q(
    "INSERT INTO nb_bottles (author, kind, body, audio_mime, audio_b64, created_at) VALUES ($1, 'voice', $2, $3, $4, $5) RETURNING id",
    [who, text, mime, buf.toString('base64'), Date.now()],
  )
  send(res, 201, { id: r[0].id })
}

async function waitingFor(who) {
  return (await q('SELECT COUNT(*)::int AS n FROM nb_bottles WHERE author = $1 AND opened_at IS NULL', [partnerOf(who)]))[0].n
}

/**
 * The heart of the "pure chance" idea: the draw happens on the server with a
 * CSPRNG so neither of them can influence or predict it. Unread bottles are
 * favoured (3:1) but an old one can always float back.
 */
async function draw(_req, res, who) {
  const all = await q(`SELECT ${LIST} FROM nb_bottles WHERE author = $1`, [partnerOf(who)])
  if (all.length === 0) return send(res, 200, { empty: true })
  const unread = all.filter((b) => b.opened_at === null)
  const pool = unread.length > 0 ? [...unread, ...unread, ...unread, ...all] : all
  const picked = pool[crypto.randomInt(pool.length)]
  const fresh = picked.opened_at === null
  const now = Date.now()
  await q('UPDATE nb_bottles SET opened_at = COALESCE(opened_at, $1), opened_count = opened_count + 1 WHERE id = $2', [now, picked.id])
  if (fresh) await pushEvent(partnerOf(who), 'opened')
  send(res, 200, { bottle: shape({ ...picked, opened_at: picked.opened_at ?? now }), fresh, waiting: await waitingFor(who) })
}

async function listMine(_req, res, who) {
  const rows = await q(`SELECT ${LIST} FROM nb_bottles WHERE author = $1 ORDER BY created_at DESC`, [who])
  send(res, 200, rows.map(shape))
}

async function listKept(_req, res, who) {
  const rows = await q(`SELECT ${LIST} FROM nb_bottles WHERE author = $1 AND opened_at IS NOT NULL ORDER BY opened_at DESC`, [partnerOf(who)])
  send(res, 200, rows.map(shape))
}

async function removeBottle(_req, res, who, id) {
  const r = await q('DELETE FROM nb_bottles WHERE id = $1 AND author = $2 RETURNING id', [id, who])
  if (!r.length) return send(res, 404, { error: 'not_found' })
  send(res, 204)
}

// A voice note can't be peeked at before its recipient has drawn the bottle. Supports Range for Safari.
async function audio(req, res, who, id) {
  const r = (await q("SELECT author, audio_mime, audio_b64, opened_at FROM nb_bottles WHERE id = $1 AND kind = 'voice'", [id]))[0]
  if (!r) return send(res, 404, { error: 'not_found' })
  if (r.author !== who && r.opened_at === null) return send(res, 403, { error: 'forbidden' })
  const buf = Buffer.from(r.audio_b64, 'base64')
  res.setHeader('Content-Type', r.audio_mime)
  res.setHeader('Accept-Ranges', 'bytes')
  res.setHeader('Cache-Control', 'private, max-age=3600')
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '')
  if (m) {
    const start = m[1] === '' ? Math.max(0, buf.length - Number(m[2])) : Number(m[1])
    const end = m[1] === '' || m[2] === '' ? buf.length - 1 : Math.min(Number(m[2]), buf.length - 1)
    if (start > end || start >= buf.length) {
      res.statusCode = 416
      res.setHeader('Content-Range', `bytes */${buf.length}`)
      return res.end()
    }
    res.statusCode = 206
    res.setHeader('Content-Range', `bytes ${start}-${end}/${buf.length}`)
    res.setHeader('Content-Length', end - start + 1)
    return res.end(buf.subarray(start, end + 1))
  }
  res.statusCode = 200
  res.setHeader('Content-Length', buf.length)
  res.end(buf)
}

// ---------------------------------------------------------------- router

async function join(req, res, url) {
  const ip = String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? 'x').split(',')[0].trim()
  if (await tooManyAttempts(`join:${ip}`, 25, 15 * 60 * 1000)) return send(res, 429, { error: 'too_many_attempts' })

  if (req.method === 'GET') {
    const who = await whoForToken(url.searchParams.get('k'))
    if (!who) return send(res, 404, { error: 'invalid_link' })
    return send(res, 200, { who, needsPassword: !(await hasPassword(who)) })
  }
  const { k, password } = await readJson(req)
  const who = await whoForToken(k)
  if (!who || typeof password !== 'string') return send(res, 404, { error: 'invalid_link' })
  if (!(await hasPassword(who))) {
    if (password.length < 4 || password.length > 100) return send(res, 400, { error: 'weak_password' })
    await setPassword(who, password)
  } else if (!(await checkPassword(who, password))) {
    return send(res, 401, { error: 'wrong' })
  }
  await issueCookie(req, res, who)
  send(res, 200, profile(who))
}

export async function handle(req, res) {
  try {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'no-referrer')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('Permissions-Policy', 'microphone=(self), geolocation=(self), camera=()')

    // Block cross-site writes: the Origin (when sent) must match this host.
    const origin = req.headers.origin
    if (origin && req.method !== 'GET' && req.method !== 'HEAD') {
      let ok = false
      try { ok = new URL(origin).host === req.headers.host } catch { /* ignore */ }
      if (!ok) return send(res, 403, { error: 'bad_origin' })
    }

    const url = new URL(req.url, 'http://x')
    const path = url.pathname.replace(/\/+$/, '') || '/'
    const m = req.method

    // Public
    if (path === '/api/join' && (m === 'GET' || m === 'POST')) return await join(req, res, url)
    if (path === '/api/setup' && m === 'GET') {
      // First run only: until someone has chosen a password the home page can show both private links.
      if (await anyPasswordSet()) return send(res, 404, { error: 'done' })
      return send(res, 200, { links: (await config()).tokens })
    }

    const who = await whoFromRequest(req)
    if (!who) return send(res, 401, { error: 'unauthorized' })

    if (path === '/api/me' && m === 'GET') return send(res, 200, profile(who))
    if (path === '/api/sync' && m === 'POST') return await sync(req, res, who)
    if (path === '/api/ripple' && m === 'POST') { await pushEvent(partnerOf(who), 'ripple'); return send(res, 204) }
    if (path === '/api/partner-link' && m === 'GET') return send(res, 200, { key: (await config()).tokens[partnerOf(who)] })
    if (path === '/api/location' && m === 'PUT') return await putLocation(req, res, who)
    if (path === '/api/location' && m === 'DELETE') return await deleteLocation(req, res, who)

    if (path === '/api/bottles' && m === 'POST') return await throwText(req, res, who)
    if (path === '/api/bottles/voice' && m === 'POST') return await throwVoice(req, res, who, url)
    if (path === '/api/bottles/draw' && m === 'POST') return await draw(req, res, who)
    if (path === '/api/bottles/mine' && m === 'GET') return await listMine(req, res, who)
    if (path === '/api/bottles/kept' && m === 'GET') return await listKept(req, res, who)
    const bm = /^\/api\/bottles\/(\d+)(\/audio)?$/.exec(path)
    if (bm && bm[2] && m === 'GET') return await audio(req, res, who, Number(bm[1]))
    if (bm && !bm[2] && m === 'DELETE') return await removeBottle(req, res, who, Number(bm[1]))

    send(res, 404, { error: 'not_found' })
  } catch (err) {
    if (err instanceof NoDatabaseError) return send(res, 503, { error: 'no_database', seen: err.seen })
    if (err instanceof DatabaseUnavailableError) { console.error('[db]', err.detail); return send(res, 503, { error: 'db_unavailable', detail: err.detail }) }
    if (err?.status === 413) return send(res, 413, { error: 'too_large' })
    console.error(err)
    send(res, 500, { error: 'server_error' })
  }
}
