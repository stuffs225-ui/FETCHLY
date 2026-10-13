import { useState } from 'react'
import { MapPin, MapPinOff, Smartphone, Volume2, Check } from 'lucide-react'
import { Sheet } from './Sheet'
import { api } from '@/lib/api'
import { GENDERS } from '@/lib/types'
import type { Who } from '@/lib/types'
import { THEMES } from '@/lib/theme'
import type { ThemeKey } from '@/lib/theme'
import type { LocStatus } from '@/lib/location'

function Toggle({ on, onChange, label, hint, icon }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string; icon: React.ReactNode }) {
  return (
    <button onClick={() => onChange(!on)} role="switch" aria-checked={on} className="flex w-full items-center gap-4 rounded-2xl border border-glass-line bg-glass p-4 text-start transition-colors">
      <span className="text-accent-soft">{icon}</span>
      <span className="flex-1">
        <span className="block text-[15px] font-medium text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-mist">{hint}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-accent' : 'bg-mist/30'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'start-[22px]' : 'start-0.5'}`} />
      </span>
    </button>
  )
}

interface Props {
  open: boolean
  onClose: () => void
  haptics: boolean
  setHaptics: (v: boolean) => void
  sound: boolean
  setSound: (v: boolean) => void
  theme: ThemeKey
  setTheme: (k: ThemeKey) => void
  loc: { status: LocStatus; enable: () => void; disable: () => void }
  partner: Who
}

export function Settings({ open, onClose, haptics, setHaptics, sound, setSound, theme, setTheme, loc, partner }: Props) {
  const locOn = loc.status === 'on'
  const [confirmReset, setConfirmReset] = useState(false)
  const [done, setDone] = useState(false)
  const her = GENDERS[partner] === 'f'
  const resetPartner = async () => {
    await api.post('/reset-partner').catch(() => {})
    setConfirmReset(false)
    setDone(true)
    setTimeout(() => setDone(false), 4000)
  }
  return (
    <Sheet open={open} onClose={onClose} title="الإعدادات">
      <div className="space-y-3">
        <div className="rounded-2xl border border-glass-line bg-glass p-4">
          <p className="mb-3 text-[15px] font-medium text-ink">الألوان</p>
          <div className="grid grid-cols-3 gap-2.5">
            {THEMES.map((t) => (
              <button key={t.key} onClick={() => setTheme(t.key)} aria-pressed={theme === t.key} className="relative rounded-2xl p-2.5 transition-transform active:scale-95" style={{ background: t.base, border: `1.5px solid ${theme === t.key ? t.a : 'rgba(128,128,128,.3)'}` }}>
                <span className="mx-auto flex h-8 items-center justify-center">
                  <svg viewBox="0 0 100 90" className="-me-2 h-7 w-8"><path d="M50 88C18 62 2 42 2 26 2 12 13 2 27 2c10 0 18 5 23 13C55 7 63 2 73 2c14 0 25 10 25 24 0 16-16 36-48 62z" fill={t.a} /></svg>
                  <svg viewBox="0 0 100 90" className="h-7 w-8"><path d="M50 88C18 62 2 42 2 26 2 12 13 2 27 2c10 0 18 5 23 13C55 7 63 2 73 2c14 0 25 10 25 24 0 16-16 36-48 62z" fill={t.b} /></svg>
                </span>
                <span className="mt-1.5 block text-center text-[11px]" style={{ color: t.base === '#f4efe8' ? '#2b2623' : '#e8e4de' }}>{t.label}</span>
                {theme === t.key && <Check className="absolute end-1.5 top-1.5 h-3.5 w-3.5" style={{ color: t.a }} />}
              </button>
            ))}
          </div>
        </div>

        {loc.status !== 'unsupported' && (
          <Toggle
            on={locOn}
            onChange={(v) => (v ? loc.enable() : loc.disable())}
            label="مشاركة موقعي لنعرف المسافة بيننا"
            hint={loc.status === 'denied' ? 'الموقع مغلق من إعدادات المتصفح' : 'لا يرى الطرف الثاني إلا المسافة'}
            icon={locOn ? <MapPin className="h-5 w-5" /> : <MapPinOff className="h-5 w-5" />}
          />
        )}
        <Toggle on={haptics} onChange={setHaptics} label="اهتزاز مع كل نبضة عندما تكونان معًا" icon={<Smartphone className="h-5 w-5" />} />
        <Toggle on={sound} onChange={(v) => { if (v) void import('@/lib/sound').then((m) => m.unlockSound()); setSound(v) }} label="صوت نبض القلب" hint="هادئ ومنخفض" icon={<Volume2 className="h-5 w-5" />} />

        <div className="rounded-2xl border border-glass-line bg-glass p-4">
          <p className="text-[15px] font-medium text-ink">{her ? 'نسيَت رمزها؟' : 'نسي رمزه؟'}</p>
          <p className="mt-1 text-xs leading-6 text-mist">{her ? 'امسح رمزها لتختار رمزًا جديدًا عند دخولها القادم.' : 'امسح رمزه ليختار رمزًا جديدًا عند دخوله القادم.'}</p>
          {done ? (
            <p className="mt-3 text-sm text-accent-soft">تم. {her ? 'ستختار رمزًا جديدًا عند دخولها' : 'سيختار رمزًا جديدًا عند دخوله'}.</p>
          ) : confirmReset ? (
            <div className="mt-3 flex gap-2">
              <button onClick={resetPartner} className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-bold text-on-accent active:scale-95">نعم، امسحه</button>
              <button onClick={() => setConfirmReset(false)} className="flex-1 rounded-xl border border-glass-line py-2.5 text-sm text-ink active:scale-95">إلغاء</button>
            </div>
          ) : (
            <button onClick={() => setConfirmReset(true)} className="mt-3 rounded-xl border border-glass-line px-4 py-2.5 text-sm text-ink active:scale-95">{her ? 'مسح رمزها' : 'مسح رمزه'}</button>
          )}
        </div>
      </div>
    </Sheet>
  )
}
