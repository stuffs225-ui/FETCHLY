import webpush from 'web-push'
import { db, getSetting, setSetting } from './db.js'

let ready = false

export function initPush() {
  let pub = getSetting('vapidPublic')
  let priv = getSetting('vapidPrivate')
  if (!pub || !priv) {
    const keys = webpush.generateVAPIDKeys()
    pub = keys.publicKey
    priv = keys.privateKey
    setSetting('vapidPublic', pub)
    setSetting('vapidPrivate', priv)
  }
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:hello@example.com', pub, priv)
  ready = true
}

export const vapidPublicKey = () => getSetting('vapidPublic')

export function saveSubscription(who, sub) {
  db.prepare(
    'INSERT INTO pushSubs (endpoint, who, json) VALUES (?, ?, ?) ON CONFLICT(endpoint) DO UPDATE SET who = excluded.who, json = excluded.json'
  ).run(sub.endpoint, who, JSON.stringify(sub))
}

export function removeSubscription(endpoint) {
  db.prepare('DELETE FROM pushSubs WHERE endpoint = ?').run(endpoint)
}

export function hasSubscription(who) {
  return db.prepare('SELECT 1 FROM pushSubs WHERE who = ? LIMIT 1').get(who) !== undefined
}

/** Fire-and-forget push to every device a person registered; dead endpoints are pruned. */
export async function pushTo(who, payload) {
  if (!ready) return
  const rows = db.prepare('SELECT endpoint, json FROM pushSubs WHERE who = ?').all(who)
  await Promise.all(
    rows.map(async (row) => {
      try {
        await webpush.sendNotification(JSON.parse(row.json), JSON.stringify(payload), { TTL: 60 * 60 })
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) removeSubscription(row.endpoint)
        else console.warn('[push] failed:', err.statusCode || err.message)
      }
    })
  )
}
