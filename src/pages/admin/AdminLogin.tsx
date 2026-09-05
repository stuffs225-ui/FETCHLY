import { useState } from 'react'
import type { FormEvent } from 'react'
import { Lock, AlertCircle, Globe2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { FieldLabel, Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { companySettingsStore } from '@/lib/repo'

export default function AdminLogin({ onLogin }: { onLogin: (password: string) => boolean }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const settings = companySettingsStore.get()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError(!onLogin(password))
  }

  const name = settings.companyNameAr.trim()

  return (
    <div dir="rtl" lang="ar" className="flex min-h-screen items-center justify-center bg-surface px-6">
      <Card className="w-full max-w-sm p-8">
        <div className="text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-navy">
            {name ? <span className="font-bold text-white">{name.charAt(0)}</span> : <Globe2 className="h-5 w-5 text-white" />}
          </span>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">لوحة التحكم</p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <div>
            <FieldLabel htmlFor="admin-password">كلمة المرور</FieldLabel>
            <div className="relative">
              <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(false)
                }}
                placeholder="أدخل كلمة المرور"
                className="ps-10"
                autoFocus
              />
            </div>
            {error && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-danger">
                <AlertCircle className="h-3.5 w-3.5" /> كلمة المرور غير صحيحة.
              </p>
            )}
          </div>
          <Button type="submit" className="w-full justify-center">
            تسجيل الدخول
          </Button>
        </form>
      </Card>
    </div>
  )
}
