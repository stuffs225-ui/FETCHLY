import { useEffect, useState } from 'react'
import { MapPin, MapPinOff, Bell, Volume2, Check, Copy, Trash2 } from 'lucide-react'
import { Sheet } from './Sheet'
import { Trash } from './Trash'
import { api } from '@/lib/api'
import { HeartShape } from './Heart'
import { copyText } from '@/lib/share'
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
  sound: boolean
  setSound: (v: boolean) => void
  chimeOn: boolean
  setChimeOn: (v: boolean) => void
  theme: ThemeKey
  setTheme: (k: ThemeKey) => void
  loc: { status: LocStatus; enable: () => void; disable: () => void }
  partner: Who
}

export function Settings({ open, onClose, sound, setSound, chimeOn, setChimeOn, theme, setTheme, loc, partner }: Props) {
  const locOn = loc.status === 'on'
  const [invite, setInvite] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (open) api.get<{ code: string | null }>('/invite').then((r) => setInvite(r.code)).catch(() => {})
  }, [open])
  const [trash, setTrash] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [done, setDone] = useState(false)
  const resetPartner = async () => {
    await api.post('/reset-partner').catch(() => {})
    setConfirmReset(false)
    setDone(true)
    setTimeout(() => setDone(false), 4000)
  }
  return (
    <>
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
            label="مشاركة موقعي"
            hint={loc.status === 'denied' ? 'مغلق من إعدادات المتصفح' : undefined}
            icon={locOn ? <MapPin className="h-5 w-5" /> : <MapPinOff className="h-5 w-5" />}
          />
        )}
        <Toggle on={chimeOn} onChange={(v) => { if (v) void import('@/lib/sound').then((m) => { m.unlockSound(); m.chime() }); setChimeOn(v) }} label="نغمة عند اللمس والرسائل" icon={<Bell className="h-5 w-5" />} />
        <Toggle on={sound} onChange={(v) => { if (v) void import('@/lib/sound').then((m) => m.unlockSound()); setSound(v) }} label="صوت النبض" icon={<Volume2 className="h-5 w-5" />} />

        {invite && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-glass-line bg-glass p-4">
            <div>
              <p className="text-xs text-mist">رمز الدعوة</p>
              <p dir="ltr" className="mt-0.5 select-all text-start text-xl font-bold tracking-[0.25em] text-ink">{invite}</p>
            </div>
            <button
              onClick={async () => { if (await copyText(invite)) { setCopied(true); setTimeout(() => setCopied(false), 2000) } }}
              className="flex items-center gap-1.5 rounded-xl border border-glass-line px-3.5 py-2 text-sm text-ink active:scale-95"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'تم' : 'نسخ'}
            </button>
          </div>
        )}

        <button onClick={() => setTrash(true)} className="flex w-full items-center gap-4 rounded-2xl border border-glass-line bg-glass p-4 text-start active:scale-[0.99]">
          <span className="text-accent-soft"><Trash2 className="h-5 w-5" /></span>
          <span className="flex-1 text-[15px] font-medium text-ink">المحذوفات</span>
        </button>

        <div className="rounded-2xl border border-glass-line bg-glass p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2.5 text-[15px] font-medium text-ink">
              مسح الرمز <HeartShape tone={partner} className="h-5 w-[22px]" />
            </span>
            {done ? (
              <span className="text-sm text-accent-soft">تم</span>
            ) : confirmReset ? (
              <span className="flex gap-2">
                <button onClick={resetPartner} className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-on-accent active:scale-95">تأكيد</button>
                <button onClick={() => setConfirmReset(false)} className="rounded-xl border border-glass-line px-4 py-2 text-sm text-ink active:scale-95">إلغاء</button>
              </span>
            ) : (
              <button onClick={() => setConfirmReset(true)} className="rounded-xl border border-glass-line px-4 py-2 text-sm text-ink active:scale-95">مسح</button>
            )}
          </div>
        </div>
      </div>
    </Sheet>
    <Trash open={trash} onClose={() => setTrash(false)} />
    </>
  )
}
