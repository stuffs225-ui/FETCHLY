import { useState } from 'react'

const ADMIN_PASSWORD = 'fetchly-admin'
const STORAGE_KEY = 'fetchly_admin_auth'

export function useAdminAuth() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(STORAGE_KEY) === 'true')

  const login = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setAuthed(true)
      return true
    }
    return false
  }

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setAuthed(false)
  }

  return { authed, login, logout }
}
