import { useState } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FieldLabel, Input, Textarea } from '@/components/ui/Input'
import { faqsRepo } from '@/lib/repo'
import { useCollectionVersion } from '@/lib/useCollection'
import { uid } from '@/lib/utils'
import type { FaqItem } from '@/lib/types'

function emptyFaq(): FaqItem {
  return { id: uid('faq'), qAr: '', qEn: '', aAr: '', aEn: '', published: true }
}

export default function Faqs() {
  useCollectionVersion()
  const [draft, setDraft] = useState<FaqItem | null>(null)
  const items = faqsRepo.list()

  const save = () => {
    if (!draft) return
    faqsRepo.upsert(draft)
    setDraft(null)
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-text-muted">
        عند إضافة أسئلة هنا، ستحل محل قائمة الأسئلة الافتراضية في صفحة الأسئلة الشائعة العامة. إن تركت القائمة فارغة، ستظهر الأسئلة الافتراضية.
      </p>
      <div className="flex justify-end">
        <Button onClick={() => setDraft(emptyFaq())}>
          <Plus className="h-4 w-4" /> إضافة سؤال
        </Button>
      </div>

      {draft && (
        <Card className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><FieldLabel>السؤال (عربي)</FieldLabel><Input value={draft.qAr} onChange={(e) => setDraft({ ...draft, qAr: e.target.value })} /></div>
            <div><FieldLabel>Question (English)</FieldLabel><Input dir="ltr" value={draft.qEn} onChange={(e) => setDraft({ ...draft, qEn: e.target.value })} /></div>
            <div><FieldLabel>الإجابة (عربي)</FieldLabel><Textarea value={draft.aAr} onChange={(e) => setDraft({ ...draft, aAr: e.target.value })} /></div>
            <div><FieldLabel>Answer (English)</FieldLabel><Textarea dir="ltr" value={draft.aEn} onChange={(e) => setDraft({ ...draft, aEn: e.target.value })} /></div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save}><Save className="h-4 w-4" /> حفظ</Button>
            <Button variant="ghost" onClick={() => setDraft(null)}>إلغاء</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {items.map((f) => (
          <Card key={f.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="font-bold text-text">{f.qAr}</p>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-text-muted">
                  <input type="checkbox" checked={f.published} onChange={(e) => faqsRepo.upsert({ ...f, published: e.target.checked })} className="h-3.5 w-3.5 accent-primary" />
                  منشور
                </label>
                <button onClick={() => faqsRepo.remove(f.id)} className="text-text-muted hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="mt-1.5 text-sm text-text-muted">{f.aAr}</p>
            <button onClick={() => setDraft(f)} className="mt-2 text-xs font-semibold text-primary hover:underline">تعديل</button>
          </Card>
        ))}
        {items.length === 0 && <p className="text-sm text-text-muted">لا توجد أسئلة مخصصة — يتم عرض الأسئلة الافتراضية.</p>}
      </div>
    </div>
  )
}
