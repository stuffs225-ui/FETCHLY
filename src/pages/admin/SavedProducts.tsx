import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Input, FieldLabel } from '@/components/ui/Input'
import { savedProductsRepo } from '@/lib/repo'
import { useCollectionVersion } from '@/lib/useCollection'
import { formatDate, formatMoney } from '@/lib/utils'
import type { SavedProduct } from '@/lib/types'

export default function SavedProducts() {
  useCollectionVersion()
  const [search, setSearch] = useState('')
  const data = savedProductsRepo.list().filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  const columns: Column<SavedProduct>[] = [
    { key: 'name', header: 'اسم المنتج', sortValue: (p) => p.name },
    { key: 'description', header: 'الوصف', className: 'max-w-[220px] truncate', render: (p) => p.description || '—' },
    { key: 'lastPrice', header: 'آخر سعر', render: (p) => formatMoney(p.lastPrice, p.currency, 'ar'), sortValue: (p) => p.lastPrice },
    { key: 'lastQuotedAt', header: 'آخر تسعير', render: (p) => formatDate(p.lastQuotedAt), sortValue: (p) => p.lastQuotedAt },
    {
      key: 'actions',
      header: '',
      render: (p) => (
        <button onClick={() => savedProductsRepo.remove(p.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-danger/10 hover:text-danger">
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <FieldLabel>بحث</FieldLabel>
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن منتج محفوظ..." className="max-w-sm" />
      </Card>
      <p className="text-sm text-text-muted">تُحفظ المنتجات تلقائيًا من كل عرض سعر يتم حفظه، لتسهيل إعادة استخدامها في عروض أسعار مستقبلية.</p>
      <DataTable columns={columns} data={data} rowKey={(p) => p.id} pageSize={10} emptyLabel="لا توجد منتجات محفوظة بعد" />
    </div>
  )
}
