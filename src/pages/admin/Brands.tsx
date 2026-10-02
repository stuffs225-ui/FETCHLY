import { useState } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FieldLabel, Input, Textarea } from '@/components/ui/Input'
import { BrandLogo } from '@/components/catalog/BrandLogo'
import { brandsRepo } from '@/lib/repo'
import type { Brand } from '@/lib/types'

const empty = (): Partial<Brand> => ({ slug: '', name: '', country: 'US', color: '#0e4a78', descAr: '', descEn: '', website: '', logoUrl: '', featured: false, published: true, sortOrder: 0 })

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** Reads a small image file into a data URL so the logo is stored with the brand. */
function readLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

export default function Brands() {
  const { data: items, refetch } = brandsRepo.useList()
  const [draft, setDraft] = useState<Partial<Brand> | null>(null)
  const [error, setError] = useState('')

  const save = async () => {
    if (!draft?.name?.trim()) return setError('اسم العلامة مطلوب')
    const body = { ...draft, slug: draft.slug?.trim() || slugify(draft.name) }
    try {
      if (draft.id) await brandsRepo.update(draft.id, body)
      else await brandsRepo.create(body)
      setDraft(null)
      setError('')
      refetch()
    } catch {
      setError('تعذر الحفظ — تأكد أن المعرّف (slug) غير مكرر')
    }
  }

  const remove = async (b: Brand) => {
    if (!confirm(`حذف ${b.name}؟ يجب حذف منتجاتها أولًا أو نقلها.`)) return
    await brandsRepo.remove(b.id)
    refetch()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">العلامات التي تظهر في الموقع. ارفع الشعار الرسمي لتحل صورته محل الاسم المكتوب.</p>
        <Button onClick={() => setDraft(empty())}><Plus className="h-4 w-4" /> إضافة علامة</Button>
      </div>

      {draft && (
        <Card className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div><FieldLabel>الاسم</FieldLabel><Input dir="ltr" value={draft.name ?? ''} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div><FieldLabel>المعرّف (slug)</FieldLabel><Input dir="ltr" value={draft.slug ?? ''} placeholder={slugify(draft.name ?? '')} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} /></div>
            <div><FieldLabel>الموقع الرسمي</FieldLabel><Input dir="ltr" value={draft.website ?? ''} onChange={(e) => setDraft({ ...draft, website: e.target.value })} /></div>
            <div><FieldLabel>لون الاسم</FieldLabel><input type="color" value={draft.color || '#0e4a78'} onChange={(e) => setDraft({ ...draft, color: e.target.value })} className="h-10 w-full rounded-lg border border-border" /></div>
            <div><FieldLabel>الترتيب</FieldLabel><Input type="number" value={draft.sortOrder ?? 0} onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })} /></div>
            <div>
              <FieldLabel>الشعار (صورة)</FieldLabel>
              <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="text-sm"
                onChange={async (e) => { const f = e.target.files?.[0]; if (f) { if (f.size > 500_000) return setError('حجم الشعار يجب أن يكون أقل من 500KB'); setDraft({ ...draft, logoUrl: await readLogo(f) }) } }} />
            </div>
            <div className="sm:col-span-3 flex items-center gap-4"><span className="text-xs text-text-muted">المعاينة:</span><BrandLogo brand={{ name: draft.name || 'Brand', color: draft.color ?? null, logoUrl: draft.logoUrl || null }} size="lg" />
              {draft.logoUrl && <button className="text-xs text-danger" onClick={() => setDraft({ ...draft, logoUrl: '' })}>إزالة الشعار</button>}</div>
            <div className="sm:col-span-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><FieldLabel>الوصف (عربي)</FieldLabel><Textarea value={draft.descAr ?? ''} onChange={(e) => setDraft({ ...draft, descAr: e.target.value })} /></div>
              <div><FieldLabel>Description (English)</FieldLabel><Textarea dir="ltr" value={draft.descEn ?? ''} onChange={(e) => setDraft({ ...draft, descEn: e.target.value })} /></div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={!!draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} className="accent-primary" /> يظهر في الصفحة الرئيسية</label>
            <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={!!draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} className="accent-primary" /> منشور</label>
            {error && <span className="text-sm text-danger">{error}</span>}
          </div>
          <div className="flex gap-2">
            <Button onClick={save}><Save className="h-4 w-4" /> حفظ</Button>
            <Button variant="ghost" onClick={() => { setDraft(null); setError('') }}>إلغاء</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...items].sort((a, b) => a.sortOrder - b.sortOrder).map((b) => (
          <Card key={b.id} className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <BrandLogo brand={b} size="sm" />
              <p className="mt-1 text-xs text-text-muted">{b.published ? 'منشور' : 'مخفي'}{b.featured ? ' · رئيسية' : ''}</p>
              <button onClick={() => setDraft(b)} className="mt-1 text-xs font-semibold text-primary hover:underline">تعديل</button>
            </div>
            <button onClick={() => remove(b)} className="text-text-muted hover:text-danger"><Trash2 className="h-4 w-4" /></button>
          </Card>
        ))}
      </div>
    </div>
  )
}
