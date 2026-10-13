import { useEffect, useState } from 'react'
import { Bell, BellOff, LogOut, Smartphone, Volume2 } from 'lucide-react'
import { Sheet } from './Sheet'
import { api } from '@/lib/api'
import type { Profile } from '@/lib/types'
import { currentSubscription, disablePush, enablePush, pushSupported } from '@/lib/push'
import { unlockSound } from '@/lib/sound'
import { useToast } from './Toast'
import type { Copy } from '@/lib/copy'

function Toggle({ on, onChange, label, hint, icon }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string; icon: React.ReactNode }) {
  return (
    <button onClick={() => onChange(!on)} role="switch" aria-checked={on} className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-start transition-colors hover:bg-white/[0.07]">
      <span className="text-rose-soft">{icon}</span>
      <span className="flex-1">
        <span className="block text-[15px] font-medium text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-mist">{hint}</span>}
      </span>
      <span className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-rose' : 'bg-white/15'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'start-[22px]' : 'start-0.5'}`} />
      </span>
    </button>
  )
}

interface Props {
  open: boolean
  onClose: () => void
  profile: Profile
  copy: Copy
  onProfile: (p: Profile) => void
  onLeave: () => void
  haptics: boolean
  setHaptics: (v: boolean) => void
  sound: boolean
  setSound: (v: boolean) => void
}

export function Settings({ open, onClose, profile, copy, onProfile, onLeave, haptics, setHaptics, sound, setSound }: Props) {
  const toast = useToast()
  const [name, setName] = useState(profile.names[profile.who])
  const [push, setPush] = useState(false)
  const canPush = pushSupported()

  useEffect(() => {
    if (!open) return
    setName(profile.names[profile.who])
    currentSubscription().then((s) => setPush(Boolean(s) && Notification.permission === 'granted')).catch(() => {})
  }, [open, profile])

  const saveName = async () => {
    const n = name.trim()
    if (!n || n === profile.names[profile.who]) return
    try {
      onProfile(await api.put<Profile>('/profile', { name: n }))
      toast(copy.toast.saved)
    } catch {
      toast(copy.toast.error)
    }
  }

  const togglePush = async (v: boolean) => {
    try {
      if (v) {
        const r = await enablePush()
        if (r === 'ok') setPush(true)
        else toast(r === 'denied' ? 'لم يُسمح بالإشعارات من المتصفح' : 'جهازك لا يدعم الإشعارات هنا')
      } else {
        await disablePush()
        setPush(false)
      }
    } catch {
      toast(copy.toast.error)
    }
  }

  const iosNeedsInstall = /iphone|ipad/i.test(navigator.userAgent) && !('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone)

  return (
    <Sheet open={open} onClose={onClose} title="الإعدادات">
      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <label className="block text-xs text-mist">كيف تحب أن تُنادى؟</label>
          <div className="mt-2 flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveName()}
              maxLength={24}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-ink outline-none focus:border-rose/50"
            />
            <button onClick={saveName} className="rounded-xl bg-white/10 px-5 text-sm text-ink transition-colors hover:bg-white/15 active:scale-95">حفظ</button>
          </div>
        </div>

        {canPush ? (
          <Toggle on={push} onChange={togglePush} label="إشعارات عندما تدخل أو ترمي زجاجة" hint={iosNeedsInstall ? 'على الآيفون: أضف الموقع إلى الشاشة الرئيسية أولًا' : undefined} icon={push ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />} />
        ) : (
          <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs leading-6 text-mist">
            الإشعارات غير متاحة في هذا المتصفح.{iosNeedsInstall ? ' على الآيفون: اضغط مشاركة ثم «إضافة إلى الشاشة الرئيسية».' : ''}
          </p>
        )}
        <Toggle on={haptics} onChange={setHaptics} label="اهتزاز مع كل نبضة عندما تكونان معًا" icon={<Smartphone className="h-5 w-5" />} />
        <Toggle on={sound} onChange={(v) => { if (v) unlockSound(); setSound(v) }} label="صوت نبض القلب" hint="هادئ ومنخفض" icon={<Volume2 className="h-5 w-5" />} />

        <button onClick={onLeave} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm text-mist transition-colors hover:text-ink">
          <LogOut className="h-4 w-4" /> خروج من هذا الجهاز
        </button>
      </div>
    </Sheet>
  )
}
