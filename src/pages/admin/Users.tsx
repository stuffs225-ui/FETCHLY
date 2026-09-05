import { Card } from '@/components/ui/Card'
import { adminUsersRepo } from '@/lib/repo'
import { useCollectionVersion } from '@/lib/useCollection'

export default function Users() {
  useCollectionVersion()
  const users = adminUsersRepo.list()

  return (
    <div className="max-w-3xl space-y-5">
      <Card className="border-navy-light/40 bg-navy-light/10 p-4 text-sm text-text-muted">
        هذا الإصدار يدعم مستخدمًا واحدًا بصلاحية كاملة (مشرف). البنية جاهزة لإضافة دور "مبيعات / تسعير" لاحقًا (يمكنه عرض الطلبات وإنشاء وإرسال عروض الأسعار دون الوصول لإعدادات الشركة القانونية أو حذف البيانات الحساسة).
      </Card>
      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id} className="flex items-center justify-between p-5">
            <div>
              <p className="font-bold text-text">{u.name}</p>
              <p className="text-sm text-text-muted" dir="ltr">{u.email}</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{u.role === 'admin' ? 'مشرف' : 'مبيعات'}</span>
          </Card>
        ))}
      </div>
    </div>
  )
}
