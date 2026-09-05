import { useState } from 'react'
import { Save, CheckCircle2, Mail } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FieldLabel, Input, Textarea } from '@/components/ui/Input'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { emailSettingsStore, emailLogRepo } from '@/lib/repo'
import { useCollectionVersion } from '@/lib/useCollection'
import { formatDateTime } from '@/lib/utils'
import type { EmailSettings, EmailLogEntry } from '@/lib/types'

const kindLabels: Record<EmailLogEntry['kind'], string> = { acknowledgement: 'تأكيد استلام', quotation: 'عرض سعر', contact: 'تواصل' }

export default function EmailSettingsPage() {
  useCollectionVersion()
  const [settings, setSettings] = useState<EmailSettings>(emailSettingsStore.get())
  const [saved, setSaved] = useState(false)
  const log = [...emailLogRepo.list()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  const handleSave = () => {
    emailSettingsStore.set(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const columns: Column<EmailLogEntry>[] = [
    { key: 'createdAt', header: 'التاريخ', render: (e) => formatDateTime(e.createdAt) },
    { key: 'kind', header: 'النوع', render: (e) => kindLabels[e.kind] },
    { key: 'to', header: 'إلى', className: 'max-w-[180px] truncate', render: (e) => <span dir="ltr">{e.to}</span> },
    { key: 'subject', header: 'الموضوع', className: 'max-w-[240px] truncate' },
    { key: 'status', header: 'الحالة', render: (e) => <span className="text-xs text-text-muted">{e.status === 'simulated' ? 'محاكاة (لا يوجد مزود بريد فعلي)' : e.status}</span> },
  ]

  return (
    <div className="max-w-4xl space-y-6">
      <Card className="border-navy-light/40 bg-navy-light/10 p-4 text-sm text-text-muted">
        لم يتم ربط مزود بريد فعلي (مثل SMTP أو Resend) بعد. الرسائل أدناه تُسجَّل في سجل البريد للمراجعة بدلاً من إرسالها فعليًا — اربط <code className="font-mono text-gold">src/lib/emailService.ts</code> بمزود حقيقي عند الإطلاق.
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-bold text-gold">إعدادات المرسل</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div><FieldLabel>اسم المرسل</FieldLabel><Input value={settings.senderName} onChange={(e) => setSettings((s) => ({ ...s, senderName: e.target.value }))} /></div>
          <div><FieldLabel>بريد المرسل</FieldLabel><Input dir="ltr" value={settings.senderEmail} onChange={(e) => setSettings((s) => ({ ...s, senderEmail: e.target.value }))} /></div>
          <div><FieldLabel>بريد الرد (Reply-To)</FieldLabel><Input dir="ltr" value={settings.replyToEmail} onChange={(e) => setSettings((s) => ({ ...s, replyToEmail: e.target.value }))} /></div>
          <div><FieldLabel>بريد الإشعارات الداخلية</FieldLabel><Input dir="ltr" value={settings.internalNotificationEmails} onChange={(e) => setSettings((s) => ({ ...s, internalNotificationEmails: e.target.value }))} /></div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-bold text-gold">قالب تأكيد استلام الطلب</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold text-text-muted">عربي</p>
            <FieldLabel>الموضوع</FieldLabel>
            <Input value={settings.ackTemplateAr.subject} onChange={(e) => setSettings((s) => ({ ...s, ackTemplateAr: { ...s.ackTemplateAr, subject: e.target.value } }))} />
            <FieldLabel className="mt-3">النص</FieldLabel>
            <Textarea className="min-h-[160px]" value={settings.ackTemplateAr.body} onChange={(e) => setSettings((s) => ({ ...s, ackTemplateAr: { ...s.ackTemplateAr, body: e.target.value } }))} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-text-muted">English</p>
            <FieldLabel>Subject</FieldLabel>
            <Input dir="ltr" value={settings.ackTemplateEn.subject} onChange={(e) => setSettings((s) => ({ ...s, ackTemplateEn: { ...s.ackTemplateEn, subject: e.target.value } }))} />
            <FieldLabel className="mt-3">Body</FieldLabel>
            <Textarea dir="ltr" className="min-h-[160px]" value={settings.ackTemplateEn.body} onChange={(e) => setSettings((s) => ({ ...s, ackTemplateEn: { ...s.ackTemplateEn, body: e.target.value } }))} />
          </div>
        </div>
        <p className="mt-3 text-xs text-text-muted">المتغيرات المتاحة: {'{{name}}'}, {'{{requestNumber}}'}</p>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-bold text-gold">قالب إرسال عرض السعر</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold text-text-muted">عربي</p>
            <FieldLabel>الموضوع</FieldLabel>
            <Input value={settings.quoteTemplateAr.subject} onChange={(e) => setSettings((s) => ({ ...s, quoteTemplateAr: { ...s.quoteTemplateAr, subject: e.target.value } }))} />
            <FieldLabel className="mt-3">النص</FieldLabel>
            <Textarea className="min-h-[160px]" value={settings.quoteTemplateAr.body} onChange={(e) => setSettings((s) => ({ ...s, quoteTemplateAr: { ...s.quoteTemplateAr, body: e.target.value } }))} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-text-muted">English</p>
            <FieldLabel>Subject</FieldLabel>
            <Input dir="ltr" value={settings.quoteTemplateEn.subject} onChange={(e) => setSettings((s) => ({ ...s, quoteTemplateEn: { ...s.quoteTemplateEn, subject: e.target.value } }))} />
            <FieldLabel className="mt-3">Body</FieldLabel>
            <Textarea dir="ltr" className="min-h-[160px]" value={settings.quoteTemplateEn.body} onChange={(e) => setSettings((s) => ({ ...s, quoteTemplateEn: { ...s.quoteTemplateEn, body: e.target.value } }))} />
          </div>
        </div>
        <p className="mt-3 text-xs text-text-muted">المتغيرات المتاحة: {'{{name}}'}, {'{{requestNumber}}'}, {'{{quotationNumber}}'}, {'{{validUntil}}'}</p>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4" /> حفظ الإعدادات
        </Button>
        {saved && <span className="flex items-center gap-1.5 text-sm text-emerald"><CheckCircle2 className="h-4 w-4" /> تم الحفظ</span>}
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gold">
          <Mail className="h-4 w-4" /> سجل البريد الإلكتروني
        </h3>
        <DataTable columns={columns} data={log} rowKey={(e) => e.id} pageSize={8} emptyLabel="لا توجد رسائل بعد" />
      </div>
    </div>
  )
}
