import { useState } from 'react'
import type { FormEvent } from 'react'
import { Lock, AlertCircle } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { FieldLabel, Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function AdminLogin({ onLogin }: { onLogin: (password: string) => boolean }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const ok = onLogin(password)
    setError(!ok)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-96 w-96 animate-float rounded-full bg-primary/20 blur-[110px]" />
      </div>
      <Card className="relative w-full max-w-sm p-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        <p className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">Admin Portal</p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <div>
            <FieldLabel htmlFor="admin-password">Password</FieldLabel>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(false)
                }}
                placeholder="Enter admin password"
                className="pl-10"
                autoFocus
              />
            </div>
            {error && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-danger">
                <AlertCircle className="h-3.5 w-3.5" /> Incorrect password. Try again.
              </p>
            )}
          </div>
          <Button type="submit" className="w-full justify-center">
            Sign In
          </Button>
        </form>
      </Card>
    </div>
  )
}
