import { useState } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FieldLabel, Input } from '@/components/ui/Input'
import { casesRepo } from '@/lib/repo'
import { useCollectionVersion } from '@/lib/useCollection'
import { uid } from '@/lib/utils'
import type { SourcingCase } from '@/lib/types'

function emptyCase(): SourcingCase {
  return { id: uid('case'), titleAr: '', titleEn: '', sourceAr: '', sourceEn: '', challengeAr: '', challengeEn: '', solutionAr: '', solutionEn: '', published: true }
}

export default function Cases() {
  useCollectionVersion()
  const [draft, setDraft] = useState<SourcingCase | null>(null)
  const cases = casesRepo.list()

  const save = () => {
    if (!draft) return
    casesRepo.upsert(draft)
    setDraft(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setDraft(emptyCase())}>
          <Plus className="h-4 w-4" /> إضافة حالة توريد
        </Button>
      </div>

      {draft && (
        <Card className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><FieldLabel>العنوان (عربي)</FieldLabel><Input value={draft.titleAr} onChange={(e) => setDraft({ ...draft, titleAr: e.target.value })} /></div>
            <div><FieldLabel>العنوان (إنجليزي)</FieldLabel><Input dir="ltr" value={draft.titleEn} onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })} /></div>
            <div><FieldLabel>المصدر (عربي)</FieldLabel><Input value={draft.sourceAr} onChange={(e) => setDraft({ ...draft, sourceAr: e.target.value })} /></div>
            <div><FieldLabel>المصدر (إنجليزي)</FieldLabel><Input dir="ltr" value={draft.sourceEn} onChange={(e) => setDraft({ ...draft, sourceEn: e.target.value })} /></div>
            <div><FieldLabel>التحدي (عربي، اختياري)</FieldLabel><Input value={draft.challengeAr ?? ''} onChange={(e) => setDraft({ ...draft, challengeAr: e.target.value })} /></div>
            <div><FieldLabel>Challenge (English, optional)</FieldLabel><Input dir="ltr" value={draft.challengeEn ?? ''} onChange={(e) => setDraft({ ...draft, challengeEn: e.target.value })} /></div>
            <div><FieldLabel>الحل (عربي، اختياري)</FieldLabel><Input value={draft.solutionAr ?? ''} onChange={(e) => setDraft({ ...draft, solutionAr: e.target.value })} /></div>
            <div><FieldLabel>Solution (English, optional)</FieldLabel><Input dir="ltr" value={draft.solutionEn ?? ''} onChange={(e) => setDraft({ ...draft, solutionEn: e.target.value })} /></div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save}><Save className="h-4 w-4" /> حفظ</Button>
            <Button variant="ghost" onClick={() => setDraft(null)}>إلغاء</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cases.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-text">{c.titleAr}</h3>
                <p className="text-xs text-text-muted">{c.sourceAr}</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-text-muted">
                  <input type="checkbox" checked={c.published} onChange={(e) => casesRepo.upsert({ ...c, published: e.target.checked })} className="h-3.5 w-3.5 accent-gold" />
                  منشور
                </label>
                <button onClick={() => casesRepo.remove(c.id)} className="text-text-muted hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {c.challengeAr && <p className="mt-2 text-sm text-text-muted">التحدي: {c.challengeAr}</p>}
            {c.solutionAr && <p className="mt-1 text-sm text-text-muted">الحل: {c.solutionAr}</p>}
            <button onClick={() => setDraft(c)} className="mt-3 text-xs font-semibold text-gold hover:underline">تعديل</button>
          </Card>
        ))}
      </div>
    </div>
  )
}
