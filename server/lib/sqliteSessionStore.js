import session from 'express-session'
import { db } from '../db.js'

/**
 * Minimal express-session Store backed by the same SQLite file as the rest
 * of the app's data, so admin sessions survive a server restart instead of
 * living only in process memory (the default MemoryStore).
 */
export class SqliteSessionStore extends session.Store {
  constructor() {
    super()
    this.pruneExpired()
    this.pruneTimer = setInterval(() => this.pruneExpired(), 15 * 60 * 1000)
    this.pruneTimer.unref?.()
  }

  pruneExpired() {
    db.prepare('DELETE FROM sessions WHERE expire < ?').run(Date.now())
  }

  get(sid, cb) {
    try {
      const row = db.prepare('SELECT sess, expire FROM sessions WHERE sid = ?').get(sid)
      if (!row || row.expire < Date.now()) return cb(null, null)
      cb(null, JSON.parse(row.sess))
    } catch (err) {
      cb(err)
    }
  }

  set(sid, sessionData, cb) {
    try {
      const expire = Date.now() + (sessionData.cookie?.maxAge ?? 24 * 60 * 60 * 1000)
      db.prepare(
        'INSERT INTO sessions (sid, sess, expire) VALUES (?, ?, ?) ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expire = excluded.expire'
      ).run(sid, JSON.stringify(sessionData), expire)
      cb?.(null)
    } catch (err) {
      cb?.(err)
    }
  }

  destroy(sid, cb) {
    try {
      db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid)
      cb?.(null)
    } catch (err) {
      cb?.(err)
    }
  }

  touch(sid, sessionData, cb) {
    this.set(sid, sessionData, cb)
  }
}
