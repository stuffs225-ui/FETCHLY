import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Mail, Phone, FileSpreadsheet, Save, Check } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Select, Textarea, Input, FieldLabel } from '@/components/ui/Input'
import { AttachmentPreview } from '@/components/admin/AttachmentPreview'
import { requestsRepo, quotationsForRequest, logAudit, auditLogRepo } from '@/lib/repo'
import { formatDateTime } from '@/lib/utils'
import { REQUEST_STATUSES } from '@/lib/types'
import type { SourcingRequest, RequestStatus } from '@/lib/types'

const sourceLabels: Record<string, string> = { best: 'أفضل مصدر متاح', usa: 'الولايات المتحدة', uk: 'المملكة المتحدة', europe: 'أوروبا', asia: 'آسيا', other: 'دولة أخرى' }
const urgencyLabels: Record<string, string> = { normal: 'عادي', soon: 'قريبًا', urgent: 'عاجل' }

export function RequestDetailDrawer({ request, onClose, onUpdate }: { request: SourcingRequest | null; onClose: () => void; onUpdate: () => void }) {
  const navigate = useNavigate()
  const [notes, setNotes] = useState(request?.internalNotes ?? '')
  const [agent, setAgent] = useState(request?.assignedAgent ?? '')
  const [saved, setSaved] = useState(false)

  if (!request) return null

  const quotations = quotationsForRequest(request.id)
  const activity = auditLogRepo.list().filter((a) => a.entityId === request.id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  const updateStatus = (status: RequestStatus) => {
    requestsRepo.upsert({ ...request, status })
    logAudit({ entityType: 'request', entityId: request.id, action: `تغيير الحالة إلى: ${REQUEST_STATUSES.find((s) => s.key === status)?.label}`, actor: 'المشرف' })
    onUpdate()
  }

  const saveNotes = () => {
    requestsRepo.upsert({ ...request, internalNotes: notes, assignedAgent: agent || undefined })
    logAudit({ entityType: 'request', entityId: request.id, action: 'تحديث الملاحظات الداخلية / الوكيل المسؤول', actor: 'المشرف' })
    setSaved(true)
    onUpdate()
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Drawer open={!!request} onClose={onClose} title={request.requestNumber} widthClass="max-w-2xl">
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusBadge status={request.status} className="text-sm" />
          <Select value={request.status} onChange={(e) => updateStatus(e.target.value as RequestStatus)} className="max-w-[220px]">
            {REQUEST_STATUSES.map((s) => (
              <option key={s.key} value={s.key}>
                تحديث إلى: {s.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">المنتج</h4>
          <p className="mt-2 text-lg font-semibold text-text">{request.productName}</p>
          {request.description && <p className="mt-1 text-sm text-text-muted">{request.description}</p>}
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div><p className="text-text-muted">الكمية</p><p className="mt-0.5 font-medium text-text">{request.quantity}</p></div>
            {request.brand && <div><p className="text-text-muted">العلامة التجارية</p><p className="mt-0.5 font-medium text-text">{request.brand}</p></div>}
            {request.model && <div><p className="text-text-muted">الموديل</p><p className="mt-0.5 font-medium text-text">{request.model}</p></div>}
            {request.partNumber && <div><p className="text-text-muted">Part Number</p><p className="mt-0.5 font-mono font-medium text-text">{request.partNumber}</p></div>}
            {request.productUrl && (
              <div className="col-span-2">
                <p className="text-text-muted">رابط المنتج</p>
                <a href={request.productUrl} target="_blank" rel="noreferrer" className="mt-0.5 block truncate font-medium text-primary hover:underline" dir="ltr">
                  {request.productUrl}
                </a>
              </div>
            )}
            <div><p className="text-text-muted">تفضيل المصدر</p><p className="mt-0.5 font-medium text-text">{sourceLabels[request.sourcePreference]}</p></div>
            {request.deliveryCity && <div><p className="text-text-muted">مدينة التسليم</p><p className="mt-0.5 font-medium text-text">{request.deliveryCity}</p></div>}
            {request.urgency && <div><p className="text-text-muted">الأولوية</p><p className="mt-0.5 font-medium text-text">{urgencyLabels[request.urgency]}</p></div>}
          </div>
        </div>

        <Card className="p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">العميل</h4>
          <p className="mt-2 text-base font-semibold text-text">{request.name}</p>
          <div className="mt-3 space-y-2 text-sm text-text-muted">
            {request.company && <p className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" /> {request.company}</p>}
            <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {request.email}</p>
            <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {request.phone}</p>
          </div>
        </Card>

        {request.attachmentIds.length > 0 && (
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">المرفقات</h4>
            <div className="flex flex-wrap gap-3">
              {request.attachmentIds.map((id) => (
                <AttachmentPreview key={id} id={id} />
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">عروض الأسعار</h4>
          {quotations.length === 0 ? (
            <p className="text-sm text-text-muted">لا توجد عروض أسعار لهذا الطلب بعد.</p>
          ) : (
            <div className="space-y-2">
              {quotations.map((q) => (
                <button
                  key={q.id}
                  onClick={() => navigate(`/admin/quotations/${q.id}`)}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm hover:border-primary/40"
                >
                  <span className="font-mono">{q.quotationNumber}</span>
                  <StatusBadge status={q.status} />
                </button>
              ))}
            </div>
          )}
          <Button onClick={() => navigate(`/admin/quotations/new?requestId=${request.id}`)} className="mt-3 w-full justify-center">
            <FileSpreadsheet className="h-4 w-4" /> إنشاء عرض سعر
          </Button>
        </div>

        <div>
          <FieldLabel>الوكيل المسؤول</FieldLabel>
          <Input value={agent} onChange={(e) => setAgent(e.target.value)} placeholder="اسم الموظف المسؤول عن الطلب" />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">ملاحظات داخلية</h4>
            <span className="text-[10px] text-text-muted">غير مرئية للعميل</span>
          </div>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-2" />
          <Button variant="secondary" size="sm" onClick={saveNotes} className="mt-2">
            {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />} حفظ
          </Button>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">سجل النشاط</h4>
          <ol className="space-y-3 border-s-2 border-border ps-5">
            <li className="relative">
              <span className="absolute -start-[1.4rem] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
              <p className="text-sm text-text">تم إنشاء الطلب</p>
              <p className="text-xs text-text-muted">{formatDateTime(request.createdAt)}</p>
            </li>
            {activity.map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute -start-[1.4rem] top-1 h-2.5 w-2.5 rounded-full bg-border-light" />
                <p className="text-sm text-text">{a.action}</p>
                <p className="text-xs text-text-muted">{formatDateTime(a.createdAt)} · {a.actor}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Drawer>
  )
}
