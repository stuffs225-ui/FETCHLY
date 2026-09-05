import { useEffect, useState } from 'react'
import { Save, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FieldLabel, Textarea } from '@/components/ui/Input'
import { getContentOverrides, updateContentOverrides, type ContentOverrides } from '@/lib/repo'
import { useAsyncData } from '@/lib/useAsync'
import { ar } from '@/i18n/ar'
import { en } from '@/i18n/en'

export default function WebsiteContent() {
  const { data: initial } = useAsyncData(getContentOverrides, [])
  const [content, setContent] = useState<ContentOverrides | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (initial && !content) setContent(initial)
  }, [initial, content])

  const save = async () => {
    if (!content) return
    await updateContentOverrides(content)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (!content) return null

  return (
    <div className="max-w-4xl space-y-6">
      <p className="text-sm text-text-muted">
        تحكم في نص العنوان الرئيسي على الصفحة الرئيسية. اترك أي حقل فارغًا لاستخدام النص الافتراضي.
      </p>

      <Card className="p-6">
        <h3 className="text-sm font-bold text-primary">العنوان الرئيسي (Hero) — عربي</h3>
        <div className="mt-4 space-y-4">
          <div>
            <FieldLabel>العنوان (افتراضي: {ar.hero.headline})</FieldLabel>
            <Textarea value={content.heroHeadlineAr} onChange={(e) => setContent((c) => c && { ...c, heroHeadlineAr: e.target.value })} />
          </div>
          <div>
            <FieldLabel>الوصف الفرعي (افتراضي: {ar.hero.sub})</FieldLabel>
            <Textarea value={content.heroSubAr} onChange={(e) => setContent((c) => c && { ...c, heroSubAr: e.target.value })} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-bold text-primary">Hero Headline — English</h3>
        <div className="mt-4 space-y-4">
          <div>
            <FieldLabel>Headline (default: {en.hero.headline})</FieldLabel>
            <Textarea dir="ltr" value={content.heroHeadlineEn} onChange={(e) => setContent((c) => c && { ...c, heroHeadlineEn: e.target.value })} />
          </div>
          <div>
            <FieldLabel>Sub-headline (default: {en.hero.sub})</FieldLabel>
            <Textarea dir="ltr" value={content.heroSubEn} onChange={(e) => setContent((c) => c && { ...c, heroSubEn: e.target.value })} />
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
        <h3 className="text-sm font-bold text-primary">إدارة محتوى أخرى</h3>
        <p className="mt-2 text-sm text-text-muted">
          حالات التوريد، الأسئلة الشائعة، والشهادات لها صفحات إدارة مخصصة في القائمة الجانبية لسهولة الإدارة.
        </p>
      </Card>
    </div>
  )
}
