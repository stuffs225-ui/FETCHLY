import { useState } from 'react'
import type { FormEvent } from 'react'
import { Lock, Mail, AlertCircle, Globe2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { FieldLabel, Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { getPublicCompany } from '@/lib/repo'
import { useAsyncData } from '@/lib/useAsync'
import { login, type AdminSessionUser } from '@/lib/adminAuth'
import { ApiError } from '@/lib/api'

const errorMessages: Record<string, string> = {
  invalid: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  locked: 'تم قفل الحساب مؤقتًا بسبب محاولات دخول متكررة فاشلة. حاول مرة أخرى بعد 15 دقيقة.',
  too_many_attempts: 'محاولات كثيرة جدًا. حاول مرة أخرى بعد قليل.',
  missing_credentials: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور.',
}

export default function AdminLogin({ onLogin }: { onLogin: (user: AdminSessionUser) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { data: settings } = useAsyncData(getPublicCompany, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const user = await login(email, password)
      onLogin(user)
    } catch (err) {
      const reason = err instanceof ApiError ? err.message : 'invalid'
      setError(errorMessages[reason] ?? errorMessages.invalid)
    } finally {
      setSubmitting(false)
    }
  }

  const name = settings?.companyNameAr.trim() ?? ''

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
            <FieldLabel htmlFor="admin-email">البريد الإلكتروني</FieldLabel>
            <div className="relative">
              <Mail className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null) }}
                placeholder="admin@example.com"
                className="ps-10"
                dir="ltr"
                autoFocus
              />
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="admin-password">كلمة المرور</FieldLabel>
            <div className="relative">
              <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                placeholder="أدخل كلمة المرور"
                className="ps-10"
              />
            </div>
            {error && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-danger">
                <AlertCircle className="h-3.5 w-3.5" /> {error}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full justify-center" disabled={submitting}>
            {submitting ? 'جارٍ الدخول...' : 'تسجيل الدخول'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
