import { useRef, useState } from 'react'
import { Plus, Trash2, Save, Upload } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FieldLabel, Input, Select } from '@/components/ui/Input'
import { credentialsRepo } from '@/lib/repo'
import { useCollectionVersion } from '@/lib/useCollection'
import { putAttachment } from '@/lib/attachments'
import { uid } from '@/lib/utils'
import type { Credential, CredentialKey } from '@/lib/types'

const keyLabels: Record<CredentialKey, string> = {
  cr: 'السجل التجاري', sbc: 'توثيق منصة الأعمال', vat: 'ضريبة القيمة المضافة', zakat: 'شهادة الزكاة', address: 'العنوان الوطني', balady: 'رخصة بلدي', iso: 'أيزو', other: 'أخرى',
}

function emptyCredential(): Credential {
  return { id: uid('cred'), key: 'other', labelAr: '', labelEn: '', visible: true }
}

export default function Trust() {
  useCollectionVersion()
  const [draft, setDraft] = useState<Credential | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const credentials = credentialsRepo.list()

  const save = () => {
    if (!draft) return
    credentialsRepo.upsert(draft)
    setDraft(null)
  }

  const uploadDoc = async (file: File | undefined) => {
    if (!file || !draft) return
    const id = uid('att')
    await putAttachment({ id, requestId: draft.id, fileName: file.name, mimeType: file.type, size: file.size, blob: file, createdAt: new Date().toISOString() })
    setDraft({ ...draft, documentAttachmentId: id })
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setDraft(emptyCredential())}>
          <Plus className="h-4 w-4" /> إضافة اعتماد
        </Button>
      </div>

      {draft && (
        <Card className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>نوع الاعتماد</FieldLabel>
              <Select value={draft.key} onChange={(e) => setDraft({ ...draft, key: e.target.value as CredentialKey })}>
                {(Object.keys(keyLabels) as CredentialKey[]).map((k) => (
                  <option key={k} value={k}>{keyLabels[k]}</option>
                ))}
              </Select>
            </div>
            <div><FieldLabel>التسمية (عربي)</FieldLabel><Input value={draft.labelAr} onChange={(e) => setDraft({ ...draft, labelAr: e.target.value })} /></div>
            <div><FieldLabel>Label (English)</FieldLabel><Input dir="ltr" value={draft.labelEn} onChange={(e) => setDraft({ ...draft, labelEn: e.target.value })} /></div>
            <div><FieldLabel>الجهة المصدرة</FieldLabel><Input value={draft.authority ?? ''} onChange={(e) => setDraft({ ...draft, authority: e.target.value })} /></div>
            <div><FieldLabel>الرقم</FieldLabel><Input dir="ltr" value={draft.number ?? ''} onChange={(e) => setDraft({ ...draft, number: e.target.value })} /></div>
            <div><FieldLabel>تاريخ الإصدار</FieldLabel><Input type="date" value={draft.issuedDate ?? ''} onChange={(e) => setDraft({ ...draft, issuedDate: e.target.value })} /></div>
            <div><FieldLabel>تاريخ الانتهاء</FieldLabel><Input type="date" value={draft.expiryDate ?? ''} onChange={(e) => setDraft({ ...draft, expiryDate: e.target.value })} /></div>
            <div><FieldLabel>رابط التحقق</FieldLabel><Input dir="ltr" value={draft.verifyUrl ?? ''} onChange={(e) => setDraft({ ...draft, verifyUrl: e.target.value })} placeholder="https://..." /></div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => fileInput.current?.click()}>
              <Upload className="h-3.5 w-3.5" /> رفع المستند
            </Button>
            <input ref={fileInput} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => uploadDoc(e.target.files?.[0])} />
            {draft.documentAttachmentId && <span className="text-xs text-emerald">تم رفع المستند</span>}
          </div>
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input type="checkbox" checked={draft.visible} onChange={(e) => setDraft({ ...draft, visible: e.target.checked })} className="h-4 w-4 accent-gold" />
            عرض في الموقع العام
          </label>
          <div className="flex gap-2">
            <Button onClick={save}><Save className="h-4 w-4" /> حفظ</Button>
            <Button variant="ghost" onClick={() => setDraft(null)}>إلغاء</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {credentials.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-text-muted">{keyLabels[c.key]}</p>
                <h3 className="font-bold text-text">{c.labelAr}</h3>
                <p className="mt-1 font-mono text-sm text-text-muted">{c.number || '—'}</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-text-muted">
                  <input type="checkbox" checked={c.visible} onChange={(e) => credentialsRepo.upsert({ ...c, visible: e.target.checked })} className="h-3.5 w-3.5 accent-gold" />
                  ظاهر
                </label>
                <button onClick={() => credentialsRepo.remove(c.id)} className="text-text-muted hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <button onClick={() => setDraft(c)} className="mt-3 text-xs font-semibold text-gold hover:underline">تعديل</button>
          </Card>
        ))}
      </div>
    </div>
  )
}
