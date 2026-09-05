import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, MessageCircle, CheckCircle2 } from 'lucide-react'
import { useI18n } from '@/i18n'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DirArrow } from '@/components/ui/DirArrow'
import { FieldLabel, Input, Textarea } from '@/components/ui/Input'
import { companySettingsStore } from '@/lib/repo'
import { useCollectionVersion } from '@/lib/useCollection'
import { sendEmail } from '@/lib/emailService'
import { usePageTitle } from '@/lib/usePageTitle'

export default function Contact() {
  useCollectionVersion()
  const { t } = useI18n()
  usePageTitle('تواصل معنا', 'Contact Us')
  const settings = companySettingsStore.get()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const submit = async () => {
    if (!form.name || !form.email || !form.message) return
    await sendEmail({
      to: settings.businessEmail,
      subject: `[Contact] ${form.subject || form.name}`,
      body: `From: ${form.name} <${form.email}>\n\n${form.message}`,
      kind: 'contact',
    })
    setSent(true)
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">{t.contactPage.hero.eyebrow}</span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">{t.contactPage.hero.title}</h1>
        <div className="mt-8">
          <Button to="/request" size="lg">
            {t.contactPage.primaryCta} <DirArrow />
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 px-6 lg:grid-cols-2 lg:px-8">
        <Card className="space-y-5 p-7">
          <div className="flex items-center gap-3">
            <Mail className="h-4.5 w-4.5 text-primary" />
            <div>
              <p className="text-xs text-text-muted">{t.contactPage.fields.email}</p>
              <p className="font-medium text-text">{settings.businessEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4.5 w-4.5 text-primary" />
            <div>
              <p className="text-xs text-text-muted">{t.contactPage.fields.phone}</p>
              <p className="font-medium text-text">{settings.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MessageCircle className="h-4.5 w-4.5 text-primary" />
            <div>
              <p className="text-xs text-text-muted">{t.contactPage.fields.whatsapp}</p>
              <p className="font-medium text-text">{settings.whatsapp}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4.5 w-4.5 text-primary" />
            <div>
              <p className="text-xs text-text-muted">{t.contactPage.fields.address}</p>
              <p className="font-medium text-text">{settings.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4.5 w-4.5 text-primary" />
            <div>
              <p className="text-xs text-text-muted">{t.contactPage.fields.hours}</p>
              <p className="font-medium text-text">{t.contactPage.hoursValue}</p>
            </div>
          </div>
        </Card>

        <Card className="p-7">
          <h3 className="font-bold text-text">{t.contactPage.formTitle}</h3>
          {sent ? (
            <div className="mt-6 flex items-center gap-2 rounded-lg bg-emerald/10 px-4 py-3 text-sm text-emerald">
              <CheckCircle2 className="h-4 w-4" /> {t.requestForm.success.emailNote}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div>
                <FieldLabel>{t.contactPage.form.name}</FieldLabel>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <FieldLabel>{t.contactPage.form.email}</FieldLabel>
                <Input type="email" dir="ltr" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <FieldLabel>{t.contactPage.form.subject}</FieldLabel>
                <Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
              </div>
              <div>
                <FieldLabel>{t.contactPage.form.message}</FieldLabel>
                <Textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
              </div>
              <Button onClick={submit} className="w-full justify-center">
                {t.contactPage.form.submit}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </section>
  )
}
