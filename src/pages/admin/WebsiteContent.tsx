import { useState } from 'react'
import { Save, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FieldLabel, Textarea } from '@/components/ui/Input'
import { contentOverridesStore, type ContentOverrides } from '@/lib/repo'
import { ar } from '@/i18n/ar'
import { en } from '@/i18n/en'

export default function WebsiteContent() {
  const [content, setContent] = useState<ContentOverrides>(contentOverridesStore.get())
  const [saved, setSaved] = useState(false)

  const save = () => {
    contentOverridesStore.set(content)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-4xl space-y-6">
      <p className="text-sm text-text-muted">
        تحكم في نص العنوان الرئيسي على الصفحة الرئيسية. اترك أي حقل فارغًا لاستخدام النص الافتراضي.
      </p>

      <Card className="p-6">
        <h3 className="text-sm font-bold text-gold">العنوان الرئيسي (Hero) — عربي</h3>
        <div className="mt-4 space-y-4">
          <div>
            <FieldLabel>العنوان (افتراضي: {ar.hero.headline})</FieldLabel>
            <Textarea value={content.heroHeadlineAr} onChange={(e) => setContent((c) => ({ ...c, heroHeadlineAr: e.target.value }))} />
          </div>
          <div>
            <FieldLabel>الوصف الفرعي (افتراضي: {ar.hero.sub})</FieldLabel>
            <Textarea value={content.heroSubAr} onChange={(e) => setContent((c) => ({ ...c, heroSubAr: e.target.value }))} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-bold text-gold">Hero Headline — English</h3>
        <div className="mt-4 space-y-4">
          <div>
            <FieldLabel>Headline (default: {en.hero.headline})</FieldLabel>
            <Textarea dir="ltr" value={content.heroHeadlineEn} onChange={(e) => setContent((c) => ({ ...c, heroHeadlineEn: e.target.value }))} />
          </div>
          <div>
            <FieldLabel>Sub-headline (default: {en.hero.sub})</FieldLabel>
            <Textarea dir="ltr" value={content.heroSubEn} onChange={(e) => setContent((c) => ({ ...c, heroSubEn: e.target.value }))} />
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={save}>
          <Save className="h-4 w-4" /> حفظ
        </Button>
        {saved && <span className="flex items-center gap-1.5 text-sm text-emerald"><CheckCircle2 className="h-4 w-4" /> تم الحفظ</span>}
      </div>

      <Card className="p-6">
        <h3 className="text-sm font-bold text-gold">إدارة محتوى أخرى</h3>
        <p className="mt-2 text-sm text-text-muted">
          حالات التوريد، الأسئلة الشائعة، والشهادات لها صفحات إدارة مخصصة في القائمة الجانبية لسهولة الإدارة.
        </p>
      </Card>
    </div>
  )
}
