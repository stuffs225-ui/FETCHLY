import { useRef, useState } from 'react'
import { Save, Upload, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FieldLabel, Input, Select, Textarea } from '@/components/ui/Input'
import { companySettingsStore } from '@/lib/repo'
import type { CompanySettings } from '@/lib/types'

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function CompanySettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>(companySettingsStore.get())
  const [saved, setSaved] = useState(false)
  const logoInput = useRef<HTMLInputElement>(null)
  const logoArInput = useRef<HTMLInputElement>(null)

  const update = <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => setSettings((s) => ({ ...s, [key]: value }))

  const handleLogo = async (file: File | undefined, key: 'logoDataUrl' | 'logoArDataUrl') => {
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    update(key, dataUrl)
  }

  const handleSave = () => {
    companySettingsStore.set(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Card className="p-6">
        <h3 className="text-sm font-bold text-gold">الشعار واسم الشركة</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel>اسم الشركة (عربي)</FieldLabel>
            <Input value={settings.companyNameAr} onChange={(e) => update('companyNameAr', e.target.value)} />
          </div>
          <div>
            <FieldLabel>اسم الشركة (إنجليزي)</FieldLabel>
            <Input value={settings.companyNameEn} onChange={(e) => update('companyNameEn', e.target.value)} dir="ltr" />
          </div>
          <div>
            <FieldLabel>الشعار (عام)</FieldLabel>
            <div className="flex items-center gap-3">
              {settings.logoDataUrl && <img src={settings.logoDataUrl} alt="logo" className="h-10 w-auto rounded border border-border-light bg-white p-1" />}
              <Button variant="secondary" size="sm" onClick={() => logoInput.current?.click()}>
                <Upload className="h-3.5 w-3.5" /> رفع شعار
              </Button>
              <input ref={logoInput} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogo(e.target.files?.[0], 'logoDataUrl')} />
            </div>
          </div>
          <div>
            <FieldLabel>شعار عربي بديل (اختياري)</FieldLabel>
            <div className="flex items-center gap-3">
              {settings.logoArDataUrl && <img src={settings.logoArDataUrl} alt="logo ar" className="h-10 w-auto rounded border border-border-light bg-white p-1" />}
              <Button variant="secondary" size="sm" onClick={() => logoArInput.current?.click()}>
                <Upload className="h-3.5 w-3.5" /> رفع شعار
              </Button>
              <input ref={logoArInput} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogo(e.target.files?.[0], 'logoArDataUrl')} />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-bold text-gold">البيانات النظامية</h3>
        <p className="mt-1 text-xs text-text-muted">استبدل القيم بين الأقواس [ ] ببياناتك الفعلية قبل الإطلاق الفعلي للموقع.</p>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div><FieldLabel>رقم السجل التجاري</FieldLabel><Input value={settings.crNumber} onChange={(e) => update('crNumber', e.target.value)} dir="ltr" /></div>
          <div><FieldLabel>الرقم الضريبي (VAT)</FieldLabel><Input value={settings.vatNumber} onChange={(e) => update('vatNumber', e.target.value)} dir="ltr" /></div>
          <div><FieldLabel>شهادة الزكاة</FieldLabel><Input value={settings.zakatCertificate} onChange={(e) => update('zakatCertificate', e.target.value)} dir="ltr" /></div>
          <div><FieldLabel>رقم توثيق منصة الأعمال</FieldLabel><Input value={settings.sbcNumber} onChange={(e) => update('sbcNumber', e.target.value)} dir="ltr" /></div>
          <div><FieldLabel>العنوان الوطني</FieldLabel><Input value={settings.nationalAddress} onChange={(e) => update('nationalAddress', e.target.value)} /></div>
          <div><FieldLabel>رخصة بلدي</FieldLabel><Input value={settings.baladyLicense} onChange={(e) => update('baladyLicense', e.target.value)} dir="ltr" /></div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-bold text-gold">التواصل</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div><FieldLabel>الهاتف</FieldLabel><Input value={settings.phone} onChange={(e) => update('phone', e.target.value)} dir="ltr" /></div>
          <div><FieldLabel>واتساب (مع رمز الدولة)</FieldLabel><Input value={settings.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} dir="ltr" placeholder="+9665XXXXXXXX" /></div>
          <div><FieldLabel>البريد الإلكتروني للأعمال</FieldLabel><Input value={settings.businessEmail} onChange={(e) => update('businessEmail', e.target.value)} dir="ltr" /></div>
          <div><FieldLabel>بريد إرسال عروض الأسعار</FieldLabel><Input value={settings.quotationEmail} onChange={(e) => update('quotationEmail', e.target.value)} dir="ltr" /></div>
          <div><FieldLabel>نطاق الموقع</FieldLabel><Input value={settings.websiteDomain} onChange={(e) => update('websiteDomain', e.target.value)} dir="ltr" /></div>
          <div><FieldLabel>العنوان</FieldLabel><Input value={settings.address} onChange={(e) => update('address', e.target.value)} /></div>
        </div>
        <div className="mt-5">
          <FieldLabel>نص الفوتر</FieldLabel>
          <Textarea value={settings.footerText} onChange={(e) => update('footerText', e.target.value)} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-bold text-gold">إعدادات التسعير الافتراضية</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel>نسبة ضريبة القيمة المضافة الافتراضية %</FieldLabel>
            <Input type="number" value={settings.defaultVatRate} onChange={(e) => update('defaultVatRate', Number(e.target.value) || 0)} />
          </div>
          <div>
            <FieldLabel>العملة الافتراضية</FieldLabel>
            <Select value={settings.defaultCurrency} onChange={(e) => update('defaultCurrency', e.target.value as CompanySettings['defaultCurrency'])}>
              <option value="SAR">SAR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
            </Select>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4" /> حفظ الإعدادات
        </Button>
        {saved && <span className="flex items-center gap-1.5 text-sm text-emerald"><CheckCircle2 className="h-4 w-4" /> تم الحفظ</span>}
      </div>
    </div>
  )
}
