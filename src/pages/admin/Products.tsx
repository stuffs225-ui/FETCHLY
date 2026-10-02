import { useState } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FieldLabel, Input, Textarea } from '@/components/ui/Input'
import { brandsRepo, productsRepo } from '@/lib/repo'
import { categories } from '@/lib/catalog'
import type { Product } from '@/lib/types'

const empty = (brandId = ''): Partial<Product> => ({ slug: '', brandId, category: 'oils', nameAr: '', nameEn: '', descAr: '', descEn: '', specsAr: '', specsEn: '', partNumber: '', imageUrl: '', featured: false, published: true, sortOrder: 0 })
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function Products() {
  const { data: items, refetch } = productsRepo.useList()
  const { data: brands } = brandsRepo.useList()
  const [draft, setDraft] = useState<Partial<Product> | null>(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const brandName = (id: string) => brands.find((b) => b.id === id)?.name ?? '—'

  const save = async () => {
    if (!draft?.nameAr?.trim() || !draft.nameEn?.trim() || !draft.brandId) return setError('الاسم بالعربي والإنجليزي والعلامة مطلوبة')
    const body = { ...draft, slug: draft.slug?.trim() || slugify(draft.nameEn) }
    try {
      if (draft.id) await productsRepo.update(draft.id, body)
      else await productsRepo.create(body)
      setDraft(null)
      setError('')
      refetch()
    } catch {
      setError('تعذر الحفظ — تأكد أن المعرّف (slug) غير مكرر')
    }
  }

  const remove = async (p: Product) => {
    if (!confirm(`حذف ${p.nameAr}؟`)) return
    await productsRepo.remove(p.id)
    refetch()
  }

  const shown = items.filter((p) => !filter || p.brandId === filter)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
          <option value="">كل العلامات ({items.length})</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <Button onClick={() => setDraft(empty(filter || brands[0]?.id))}><Plus className="h-4 w-4" /> إضافة منتج</Button>
      </div>

      {draft && (
        <Card className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div><FieldLabel>العلامة</FieldLabel>
              <select value={draft.brandId ?? ''} onChange={(e) => setDraft({ ...draft, brandId: e.target.value })} className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select></div>
            <div><FieldLabel>الفئة</FieldLabel>
              <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
                {categories.map((c) => <option key={c.key} value={c.key}>{c.ar}</option>)}
              </select></div>
            <div><FieldLabel>رقم القطعة (اختياري)</FieldLabel><Input dir="ltr" value={draft.partNumber ?? ''} onChange={(e) => setDraft({ ...draft, partNumber: e.target.value })} /></div>
            <div><FieldLabel>الاسم (عربي)</FieldLabel><Input value={draft.nameAr ?? ''} onChange={(e) => setDraft({ ...draft, nameAr: e.target.value })} /></div>
            <div><FieldLabel>Name (English)</FieldLabel><Input dir="ltr" value={draft.nameEn ?? ''} onChange={(e) => setDraft({ ...draft, nameEn: e.target.value })} /></div>
            <div><FieldLabel>المعرّف (slug)</FieldLabel><Input dir="ltr" value={draft.slug ?? ''} placeholder={slugify(draft.nameEn ?? '')} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} /></div>
            <div><FieldLabel>الوصف (عربي)</FieldLabel><Textarea value={draft.descAr ?? ''} onChange={(e) => setDraft({ ...draft, descAr: e.target.value })} /></div>
            <div><FieldLabel>Description (English)</FieldLabel><Textarea dir="ltr" value={draft.descEn ?? ''} onChange={(e) => setDraft({ ...draft, descEn: e.target.value })} /></div>
            <div><FieldLabel>رابط الصورة (اختياري)</FieldLabel><Input dir="ltr" value={draft.imageUrl ?? ''} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} /></div>
            <div><FieldLabel>المواصفات (عربي) — سطر لكل بند «العنوان: القيمة»</FieldLabel><Textarea value={draft.specsAr ?? ''} onChange={(e) => setDraft({ ...draft, specsAr: e.target.value })} /></div>
            <div><FieldLabel>Specs (English) — one per line “Label: value”</FieldLabel><Textarea dir="ltr" value={draft.specsEn ?? ''} onChange={(e) => setDraft({ ...draft, specsEn: e.target.value })} /></div>
            <div><FieldLabel>الترتيب</FieldLabel><Input type="number" value={draft.sortOrder ?? 0} onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })} /></div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={!!draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} className="accent-primary" /> مميّز (الرئيسية)</label>
            <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={!!draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} className="accent-primary" /> منشور</label>
            {error && <span className="text-sm text-danger">{error}</span>}
          </div>
          <div className="flex gap-2">
            <Button onClick={save}><Save className="h-4 w-4" /> حفظ</Button>
            <Button variant="ghost" onClick={() => { setDraft(null); setError('') }}>إلغاء</Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {shown.map((p) => (
          <Card key={p.id} className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate font-bold text-text">{p.nameAr}</p>
              <p className="text-xs text-text-muted" dir="ltr">{brandName(p.brandId)} · {p.nameEn} {p.published ? '' : '· hidden'}</p>
              <button onClick={() => setDraft(p)} className="mt-1 text-xs font-semibold text-primary hover:underline">تعديل</button>
            </div>
            <button onClick={() => remove(p)} className="text-text-muted hover:text-danger"><Trash2 className="h-4 w-4" /></button>
          </Card>
        ))}
      </div>
    </div>
  )
}
