import crypto from 'node:crypto'
import { q, getSetting, setSetting, dayKey, NoDatabaseError, DatabaseUnavailableError, SchemaMissingError, SETUP_SQL } from './db.js'
import {
  WHO, hasPassword, slotsState, setPassword, checkPassword, resetPassword, issueCookie, whoFromRequest, partnerOf, tooManyAttempts, isLocked, noteFailure,
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
  // Everything the page needs, in a single database call (see nb_sync in db.js).
  const r = (await q('SELECT nb_sync($1, $2, $3) AS r', [who, visible !== false, now]))[0].r
  const by = Object.fromEntries(r.presence.map((p) => [p.who, p]))

  res.setHeader('Cache-Control', 'no-store')
  send(res, 200, {
    serverTime: now,
    partner: { state: stateFrom(by[partner], now), lastSeen: by[partner]?.seen ?? null },
    waiting: r.waiting,
    events: r.events,
    distance: readDistance(r.distance),
    together: { total: Math.round(r.total), today: Math.round(r.today) },
    songs: r.songs,
    listen: listenView(r.listen, now),
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

// ---------------------------------------------------------------- songs (YouTube)

const YT_ID = /^[\w-]{11}$/
const OEMBED = process.env.YT_OEMBED_URL || 'https://www.youtube.com/oembed'

function parseSeconds(t) {
  if (!t) return 0
  if (/^\d+$/.test(t)) return Math.min(Number(t), 36000)
  const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/.exec(t)
  return m ? Math.min((Number(m[1] ?? 0) * 3600) + (Number(m[2] ?? 0) * 60) + Number(m[3] ?? 0), 36000) : 0
}

/** Accepts the usual YouTube link shapes (watch, youtu.be, shorts, embed, live, music) or a bare 11-char id. */
export function parseYouTube(input) {
  const text = String(input ?? '').trim()
  if (YT_ID.test(text)) return { id: text, start: 0 }
  let url
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`)
  } catch {
    return null
  }
  const host = url.hostname.replace(/^(www|m|music)\./, '')
  let id = null
  if (host === 'youtu.be') id = url.pathname.split('/')[1]
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const parts = url.pathname.split('/').filter(Boolean)
    if (url.pathname === '/watch') id = url.searchParams.get('v')
    else if (['shorts', 'embed', 'live', 'v'].includes(parts[0])) id = parts[1]
  }
  if (!id || !YT_ID.test(id)) return null
  return { id, start: parseSeconds(url.searchParams.get('t') ?? url.searchParams.get('start')) }
}

/** Title/channel come from YouTube's own oEmbed (no API key). It answers 401 for videos that forbid embedding. */
async function lookupVideo(id) {
  try {
    const res = await fetch(`${OEMBED}?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`, { signal: AbortSignal.timeout(5000) })
    if (res.status === 401 || res.status === 403) return { embeddable: false }
    if (res.status === 404 || res.status === 400) return { missing: true }
    if (!res.ok) return { unknown: true }
    const d = await res.json()
    return { embeddable: true, title: String(d.title ?? '').slice(0, 200), channel: String(d.author_name ?? '').slice(0, 120) }
  } catch {
    return { unknown: true } // could not reach YouTube from here: accept with a generic title
  }
}

async function songPreview(req, res) {
  const p = parseYouTube((await readJson(req)).url)
  if (!p) return send(res, 422, { error: 'bad_link' })
  const v = await lookupVideo(p.id)
  if (v.missing) return send(res, 422, { error: 'not_found' })
  if (v.embeddable === false) return send(res, 422, { error: 'not_embeddable' })
  send(res, 200, { id: p.id, start: p.start, title: v.title ?? null, channel: v.channel ?? null })
}

const songShape = (r) => ({
  id: r.id, author: r.author, ytId: r.yt_id, title: r.title, channel: r.channel, note: r.note,
  start: r.start_sec, reaction: r.reaction, createdAt: r.created_at,
})

async function songAdd(req, res, who) {
  const body = await readJson(req)
  const p = parseYouTube(body.url)
  if (!p) return send(res, 422, { error: 'bad_link' })
  const v = await lookupVideo(p.id)
  if (v.missing) return send(res, 422, { error: 'not_found' })
  if (v.embeddable === false) return send(res, 422, { error: 'not_embeddable' })
  const note = String(body.note ?? '').trim().slice(0, 140) || null
  const start = Number.isFinite(Number(body.start)) ? Math.max(0, Math.min(Math.round(Number(body.start)), 36000)) : p.start
  const r = await q(
    'INSERT INTO nb_songs (author, yt_id, title, channel, note, start_sec, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [who, p.id, v.title || 'فيديو يوتيوب', v.channel || null, note, start, Date.now()],
  )
  send(res, 201, songShape(r[0]))
}

async function songList(_req, res) {
  send(res, 200, (await q('SELECT * FROM nb_songs ORDER BY id DESC LIMIT 200')).map(songShape))
}

async function songRemove(_req, res, who, id) {
  const r = await q('DELETE FROM nb_songs WHERE id = $1 AND author = $2 RETURNING id', [id, who])
  if (!r.length) return send(res, 404, { error: 'not_found' })
  const l = parseListen(await getSetting('listen'))
  if (l && l.songId === id) await setSetting('listen', 'null')
  send(res, 204)
}

async function songReact(req, res, who, id) {
  const { on } = await readJson(req)
  const r = await q('UPDATE nb_songs SET reaction = $1 WHERE id = $2 AND author <> $3 RETURNING id', [on ? 'heart' : null, id, who])
  if (!r.length) return send(res, 404, { error: 'not_found' })
  send(res, 204)
}

// ---------------------------------------------------------------- listening together

const INVITE_TTL = 10 * 60 * 1000
const JOIN_LEAD = 4500 // ms between "join" and the shared start, so both phones can be told in time

function parseListen(raw) {
  try {
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** The shared session as the pages should see it (stale invitations / finished sessions are dropped). */
function listenView(raw, now) {
  const l = typeof raw === 'string' ? parseListen(raw) : raw
  if (!l) return null
  if (l.status === 'invite' && now - l.createdAt > INVITE_TTL) return null
  if (l.status === 'playing' && now > l.startAt + 6 * 3600 * 1000) return null
  return l
}

async function listenInvite(req, res, who) {
  const id = Number((await readJson(req)).songId)
  const s = (await q('SELECT * FROM nb_songs WHERE id = $1', [id]))[0]
  if (!s) return send(res, 404, { error: 'not_found' })
  await setSetting('listen', JSON.stringify({ status: 'invite', host: who, songId: s.id, ytId: s.yt_id, title: s.title, startSec: s.start_sec, createdAt: Date.now() }))
  send(res, 204)
}

async function listenJoin(_req, res, who) {
  const l = listenView(await getSetting('listen'), Date.now())
  if (!l || l.status !== 'invite' || l.host === who) return send(res, 409, { error: 'nothing_to_join' })
  await setSetting('listen', JSON.stringify({ ...l, status: 'playing', startAt: Date.now() + JOIN_LEAD }))
  send(res, 204)
}

async function listenStop(_req, res) {
  await setSetting('listen', 'null')
  send(res, 204)
}

// ---------------------------------------------------------------- invite code

/** A short code the first person gives the second one, so nobody else can take the free slot. */
async function inviteCode() {
  const fresh = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
  await q("INSERT INTO nb_settings (key, value) VALUES ('inviteCode', $1) ON CONFLICT (key) DO NOTHING", [fresh])
  return getSetting('inviteCode')
}

// ---------------------------------------------------------------- router

const LOCK_MAX = 8
const LOCK_WINDOW = 15 * 60 * 1000

// One door for both of them. Each picks who they are and sets their own code the first time; afterwards the code is required.
// The second person to arrive also needs the invite code the first one was given.
async function join(req, res) {
  const ip = String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? 'x').split(',')[0].trim()
  if (await tooManyAttempts(`join:${ip}`, 40, LOCK_WINDOW)) return send(res, 429, { error: 'too_many_attempts' })

  if (req.method === 'GET') return send(res, 200, await slotsState())

  const { who, password, invite } = await readJson(req)
  if (!WHO.includes(who) || typeof password !== 'string') return send(res, 400, { error: 'bad_request' })
  const other = partnerOf(who)

  if (!(await hasPassword(who))) {
    if (password.length < 4 || password.length > 100) return send(res, 400, { error: 'weak_password' })
    if (await hasPassword(other)) {
      if (await isLocked('fail:invite', LOCK_MAX, LOCK_WINDOW)) return send(res, 429, { error: 'too_many_attempts' })
      if (typeof invite !== 'string' || invite.trim() !== (await inviteCode())) {
        await noteFailure('fail:invite', LOCK_WINDOW)
        return send(res, 401, { error: 'bad_invite' })
      }
    }
    await setPassword(who, password)
  } else {
    if (await isLocked(`fail:${who}`, LOCK_MAX, LOCK_WINDOW)) return send(res, 429, { error: 'too_many_attempts' })
    if (!(await checkPassword(who, password))) {
      await noteFailure(`fail:${who}`, LOCK_WINDOW)
      return send(res, 401, { error: 'wrong' })
    }
  }
  await issueCookie(req, res, who)
  send(res, 200, await profileWithInvite(who))
}

/** Until the other person has joined, the profile also carries the invite code to hand over. */
async function profileWithInvite(who) {
  const base = profile(who)
  return (await hasPassword(partnerOf(who))) ? base : { ...base, invite: await inviteCode() }
}

export async function handle(req, res) {
  try {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
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
    if (path === '/api/join' && (m === 'GET' || m === 'POST')) return await join(req, res)

    const who = await whoFromRequest(req)
    if (!who) return send(res, 401, { error: 'unauthorized' })

    if (path === '/api/me' && m === 'GET') return send(res, 200, await profileWithInvite(who))
    if (path === '/api/invite' && m === 'GET') return send(res, 200, { code: await inviteCode() })
    if (path === '/api/sync' && m === 'POST') return await sync(req, res, who)
    if (path === '/api/ripple' && m === 'POST') { await pushEvent(partnerOf(who), 'ripple'); return send(res, 204) }
    // If one of them forgets their code, the other can clear it so it can be chosen again.
    if (path === '/api/reset-partner' && m === 'POST') { await resetPassword(partnerOf(who)); return send(res, 204) }
    if (path === '/api/location' && m === 'PUT') return await putLocation(req, res, who)
    if (path === '/api/location' && m === 'DELETE') return await deleteLocation(req, res, who)

    if (path === '/api/songs' && m === 'GET') return await songList(req, res)
    if (path === '/api/songs' && m === 'POST') return await songAdd(req, res, who)
    if (path === '/api/songs/preview' && m === 'POST') return await songPreview(req, res)
    const sm = /^\/api\/songs\/(\d+)(\/react)?$/.exec(path)
    if (sm && !sm[2] && m === 'DELETE') return await songRemove(req, res, who, Number(sm[1]))
    if (sm && sm[2] && m === 'POST') return await songReact(req, res, who, Number(sm[1]))
    if (path === '/api/listen' && m === 'POST') return await listenInvite(req, res, who)
    if (path === '/api/listen/join' && m === 'POST') return await listenJoin(req, res, who)
    if (path === '/api/listen/stop' && m === 'POST') return await listenStop(req, res)

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
    if (err instanceof SchemaMissingError) return send(res, 503, { error: 'schema_missing', sql: SETUP_SQL, dashboard: err.dashboard })
    if (err instanceof NoDatabaseError) return send(res, 503, { error: 'no_database', seen: err.seen })
    if (err instanceof DatabaseUnavailableError) { console.error('[db]', err.detail); return send(res, 503, { error: 'db_unavailable', detail: err.detail }) }
    if (err?.status === 413) return send(res, 413, { error: 'too_large' })
    console.error(err)
    send(res, 500, { error: 'server_error' })
  }
}
