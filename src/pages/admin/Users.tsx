import { useState } from 'react'
import { Plus, Save } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FieldLabel, Input, Select } from '@/components/ui/Input'
import { adminUsersRepo } from '@/lib/repo'
import { api, ApiError } from '@/lib/api'

export default function Users() {
  const { data: users, refetch } = adminUsersRepo.useList()
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'sales' as 'admin' | 'sales' })
  const [error, setError] = useState<string | null>(null)

  const createUser = async () => {
    setError(null)
    try {
      await api.post('/users', form)
      setForm({ name: '', email: '', password: '', role: 'sales' })
      setCreating(false)
      refetch()
    } catch (err) {
      setError(err instanceof ApiError && err.message === 'email_taken' ? 'هذا البريد الإلكتروني مستخدم بالفعل.' : 'تعذر إنشاء المستخدم. تأكد من كلمة مرور لا تقل عن 8 أحرف.')
    }
  }

  const toggleActive = async (id: string, active: boolean) => {
    await adminUsersRepo.patch(id, { active })
    refetch()
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setCreating((v) => !v)}>
          <Plus className="h-4 w-4" /> إضافة مستخدم
        </Button>
      </div>

      {creating && (
        <Card className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><FieldLabel>الاسم</FieldLabel><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div><FieldLabel>البريد الإلكتروني</FieldLabel><Input dir="ltr" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
            <div><FieldLabel>كلمة المرور</FieldLabel><Input dir="ltr" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} /></div>
            <div>
              <FieldLabel>الدور</FieldLabel>
              <Select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'admin' | 'sales' }))}>
                <option value="sales">مبيعات / تسعير</option>
                <option value="admin">مشرف</option>
              </Select>
            </div>
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={createUser}><Save className="h-4 w-4" /> حفظ</Button>
            <Button variant="ghost" onClick={() => setCreating(false)}>إلغاء</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id} className="flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-text">{u.name}</p>
              <p className="text-sm text-text-muted" dir="ltr">{u.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{u.role === 'admin' ? 'مشرف' : 'مبيعات'}</span>
              <label className="flex items-center gap-1.5 text-xs text-text-muted">
                <input type="checkbox" checked={u.active} onChange={(e) => toggleActive(u.id, e.target.checked)} className="h-3.5 w-3.5 accent-primary" />
                نشط
              </label>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
