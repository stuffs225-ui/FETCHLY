import { useState } from 'react'
import { Check, Copy, MessageCircle } from 'lucide-react'
import { copyText, inviteText, linkFor, whatsappUrl } from '@/lib/share'
import type { Who } from '@/lib/types'

/** The other person's private link, with one-tap WhatsApp / copy. */
export function LinkCard({ receiver, keyValue, title }: { receiver: Who; keyValue: string; title: string }) {
  const [copied, setCopied] = useState(false)
  const text = inviteText(receiver, keyValue)
  const copy = async () => {
    if (await copyText(text)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }
  return (
    <div className="rounded-2xl border border-glass-line bg-glass p-4 text-start">
      <p className="text-[15px] font-medium text-ink">{title}</p>
      <p dir="ltr" className="mt-2 truncate rounded-xl bg-night/60 px-3 py-2 text-start text-xs text-mist">{linkFor(keyValue)}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a href={whatsappUrl(text)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-on-accent active:scale-[0.97]">
          <MessageCircle className="h-4 w-4" /> واتساب
        </a>
        <button onClick={copy} className="flex items-center justify-center gap-2 rounded-xl border border-glass-line py-3 text-sm text-ink active:scale-[0.97]">
          {copied ? <><Check className="h-4 w-4" /> تم النسخ</> : <><Copy className="h-4 w-4" /> نسخ الرسالة</>}
        </button>
      </div>
    </div>
  )
}
