/**
 * Lightweight persistence layer for this build.
 *
 * No backend/database has been provisioned in this environment, so every
 * "repository" below reads/writes a namespaced localStorage key. The shape of
 * each repo (get/list/upsert/remove) mirrors what a real REST/SQL backend
 * would expose, so swapping this module for real API calls later does not
 * require touching any calling component.
 */

const NS = 'gsourcing'

function readCollection<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(`${NS}:${key}`)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

function writeCollectionSilent<T>(key: string, items: T[]) {
  window.localStorage.setItem(`${NS}:${key}`, JSON.stringify(items))
}

function notifyChanged(key: string) {
  // Dispatched asynchronously: seeding/writes can happen during another
  // component's render (e.g. a lazy first `.list()` call), and firing this
  // event synchronously would let its listeners (useCollectionVersion, in
  // already-mounted components) call setState mid-render on an unrelated
  // component, which React flags as an error.
  queueMicrotask(() => {
    window.dispatchEvent(new CustomEvent('gs:collection-changed', { detail: { key } }))
  })
}

function writeCollection<T>(key: string, items: T[]) {
  writeCollectionSilent(key, items)
  notifyChanged(key)
}

export function createCollection<T extends { id: string }>(key: string, seed: () => T[] = () => []) {
  function ensureSeeded(): T[] {
    const existing = window.localStorage.getItem(`${NS}:${key}`)
    if (existing !== null) return readCollection<T>(key)
    const seeded = seed()
    // Seeding happens lazily on first read (possibly mid-render) — persist
    // silently so it doesn't emit a change event from inside another
    // component's render.
    writeCollectionSilent(key, seeded)
    return seeded
  }

  return {
    list(): T[] {
      return ensureSeeded()
    },
    get(id: string): T | undefined {
      return ensureSeeded().find((item) => item.id === id)
    },
    upsert(item: T): T {
      const items = ensureSeeded()
      const idx = items.findIndex((i) => i.id === item.id)
      if (idx >= 0) items[idx] = item
      else items.unshift(item)
      writeCollection(key, items)
      return item
    },
    remove(id: string) {
      const items = ensureSeeded().filter((i) => i.id !== id)
      writeCollection(key, items)
    },
    replaceAll(items: T[]) {
      writeCollection(key, items)
    },
    key,
  }
}

function readSingleton<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(`${NS}:${key}`)
    return raw ? { ...fallback, ...(JSON.parse(raw) as T) } : fallback
  } catch {
    return fallback
  }
}

export function createSingleton<T>(key: string, fallback: T) {
  return {
    get(): T {
      return readSingleton(key, fallback)
    },
    set(value: T) {
      window.localStorage.setItem(`${NS}:${key}`, JSON.stringify(value))
      notifyChanged(key)
    },
    key,
  }
}
