import { WebSocketServer } from 'ws'
import { whoFromCookieHeader, partnerOf, names, config } from './auth.js'
import { addTogether, togetherStats, db } from './db.js'
import { pushTo } from './push.js'

// who -> Set<{ ws, visible }>
const conns = { a: new Set(), b: new Set() }
const lastSeen = { a: null, b: null }
const lastEnterPush = { a: 0, b: 0 }
const ENTER_PUSH_COOLDOWN = 20 * 60 * 1000

/** 'here' = connected & looking at it, 'away' = connected but hidden, 'gone' = not connected. */
export function stateOf(who) {
  let any = false
  for (const c of conns[who]) {
    any = true
    if (c.visible) return 'here'
  }
  return any ? 'away' : 'gone'
}

const send = (ws, msg) => {
  if (ws.readyState === 1) ws.send(JSON.stringify(msg))
}

export function broadcastTo(who, msg) {
  for (const c of conns[who]) send(c.ws, msg)
}

export const waitingFor = (who) =>
  db.prepare('SELECT COUNT(*) AS n FROM bottles WHERE author = ? AND openedAt IS NULL').get(partnerOf(who)).n

function partnerPayload(who) {
  const p = partnerOf(who)
  return { state: stateOf(p), lastSeen: lastSeen[p] }
}

function announce(who, prevState) {
  const state = stateOf(who)
  if (state === prevState) return
  if (state !== 'here') lastSeen[who] = Date.now()
  const p = partnerOf(who)
  broadcastTo(p, { t: 'partner', ...partnerPayload(p) })

  // They just showed up while the other one isn't looking → a gentle nudge.
  if (state === 'here' && prevState === 'gone' && stateOf(p) !== 'here' && Date.now() - lastEnterPush[who] > ENTER_PUSH_COOLDOWN) {
    lastEnterPush[who] = Date.now()
    const f = config.genders[who] === 'f'
    pushTo(p, {
      title: 'نبضنا',
      body: `${names()[who]} ${f ? 'دخلت' : 'دخل'}… ${f ? 'قلبها' : 'قلبه'} ينبض الآن`,
      tag: 'presence',
    })
  }
}

export function attachLive(server) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 4 * 1024 })

  server.on('upgrade', (req, socket, head) => {
    if (!req.url?.startsWith('/ws')) return socket.destroy()
    const origin = req.headers.origin
    if (origin) {
      try {
        if (new URL(origin).host !== req.headers.host) return socket.destroy()
      } catch {
        return socket.destroy()
      }
    }
    const who = whoFromCookieHeader(req.headers.cookie)
    if (!who) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      return socket.destroy()
    }
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, who))
  })

  wss.on('connection', (ws, who) => {
    const conn = { ws, visible: true, alive: true }
    const prev = stateOf(who)
    conns[who].add(conn)
    ws.on('pong', () => (conn.alive = true))

    send(ws, {
      t: 'hello',
      serverTime: Date.now(),
      partner: partnerPayload(who),
      together: togetherStats(),
      waiting: waitingFor(who),
    })
    announce(who, prev)

    ws.on('message', (raw) => {
      let msg
      try {
        msg = JSON.parse(raw.toString())
      } catch {
        return
      }
      if (msg.t === 'sync') {
        send(ws, { t: 'sync', id: msg.id, serverTime: Date.now() })
      } else if (msg.t === 'visible') {
        const before = stateOf(who)
        conn.visible = Boolean(msg.value)
        announce(who, before)
      } else if (msg.t === 'ripple') {
        broadcastTo(partnerOf(who), { t: 'ripple' })
      }
    })

    ws.on('close', () => {
      const before = stateOf(who)
      conns[who].delete(conn)
      announce(who, before)
    })
    ws.on('error', () => ws.close())
  })

  // Keep-alive: drop half-open sockets so presence never lies.
  setInterval(() => {
    for (const who of ['a', 'b']) {
      for (const c of [...conns[who]]) {
        if (!c.alive) {
          c.ws.terminate()
          continue
        }
        c.alive = false
        c.ws.ping()
      }
    }
  }, 25_000).unref()

  // Count time spent together and tell both of them.
  let tick = 0
  setInterval(() => {
    if (stateOf('a') === 'here' && stateOf('b') === 'here') {
      addTogether(5)
      if (++tick % 6 === 0) {
        const stats = togetherStats()
        broadcastTo('a', { t: 'together', ...stats })
        broadcastTo('b', { t: 'together', ...stats })
      }
    }
  }, 5_000).unref()
}
