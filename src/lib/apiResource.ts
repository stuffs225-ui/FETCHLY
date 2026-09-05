import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

const listeners = new Map<string, Set<() => void>>()

function subscribe(key: string, cb: () => void) {
  if (!listeners.has(key)) listeners.set(key, new Set())
  listeners.get(key)!.add(cb)
  return () => listeners.get(key)?.delete(cb)
}

function notify(key: string) {
  listeners.get(key)?.forEach((cb) => cb())
}

/**
 * Thin client for a REST collection, mirroring the shape of the old
 * localStorage repos (list/get/create/update/remove) but backed by real API
 * calls. `useList`/`useItem` re-fetch whenever a mutation on the same
 * resource happens anywhere in the app (including in another component),
 * the same way the old `useCollectionVersion` re-rendered on any
 * localStorage write.
 */
export function createResource<T>(basePath: string) {
  async function list(): Promise<T[]> {
    return api.get<T[]>(basePath)
  }

  async function get(id: string): Promise<T> {
    return api.get<T>(`${basePath}/${id}`)
  }

  async function create(data: Partial<T>): Promise<T> {
    const created = await api.post<T>(basePath, data)
    notify(basePath)
    return created
  }

  async function update(id: string, data: Partial<T>): Promise<T> {
    const updated = await api.put<T>(`${basePath}/${id}`, data)
    notify(basePath)
    notify(`${basePath}/${id}`)
    return updated
  }

  async function patch(id: string, data: Partial<T>): Promise<T> {
    const updated = await api.patch<T>(`${basePath}/${id}`, data)
    notify(basePath)
    notify(`${basePath}/${id}`)
    return updated
  }

  async function remove(id: string): Promise<void> {
    await api.delete(`${basePath}/${id}`)
    notify(basePath)
  }

  function useList() {
    const [data, setData] = useState<T[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const refetch = useCallback(() => {
      let cancelled = false
      setLoading(true)
      list()
        .then((items) => {
          if (!cancelled) {
            setData(items)
            setError(null)
          }
        })
        .catch((err) => !cancelled && setError(err))
        .finally(() => !cancelled && setLoading(false))
      return () => {
        cancelled = true
      }
    }, [])

    useEffect(() => {
      const cancel = refetch()
      const unsubscribe = subscribe(basePath, refetch)
      return () => {
        cancel()
        unsubscribe()
      }
    }, [refetch])

    return { data, loading, error, refetch }
  }

  function useItem(id: string | undefined) {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const refetch = useCallback(() => {
      if (!id) {
        setData(null)
        setLoading(false)
        return () => {}
      }
      let cancelled = false
      setLoading(true)
      get(id)
        .then((item) => {
          if (!cancelled) {
            setData(item)
            setError(null)
          }
        })
        .catch((err) => !cancelled && setError(err))
        .finally(() => !cancelled && setLoading(false))
      return () => {
        cancelled = true
      }
    }, [id])

    useEffect(() => {
      const cancel = refetch()
      const unsubscribe = id ? subscribe(`${basePath}/${id}`, refetch) : () => {}
      return () => {
        cancel()
        unsubscribe()
      }
    }, [refetch, id])

    return { data, loading, error, refetch }
  }

  return { list, get, create, update, patch, remove, useList, useItem, key: basePath }
}
