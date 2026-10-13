import { useState } from 'react'
import { Check, Copy, MessageCircle } from 'lucide-react'
import { copyText, inviteText, linkFor, whatsappUrl } from '@/lib/share'
import type { Who } from '@/lib/types'

/** The other person's private link: copy the plain link, or send it with a ready message on WhatsApp. */
export function LinkCard({ receiver, keyValue, title, base }: { receiver: Who; keyValue: string; title: string; base?: string | null }) {
  const [copied, setCopied] = useState(false)
  const url = linkFor(keyValue, base)
  const copy = async () => {
    if (await copyText(url)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }
  return (
    <div className="rounded-2xl border border-glass-line bg-glass p-4 text-start">
      <p className="text-[15px] font-medium text-ink">{title}</p>
      <p dir="ltr" className="mt-2 select-all break-all rounded-xl bg-night/60 px-3 py-2 text-start text-xs leading-5 text-mist">{url}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={copy} className="flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-on-accent active:scale-[0.97]">
          {copied ? <><Check className="h-4 w-4" /> تم نسخ الرابط</> : <><Copy className="h-4 w-4" /> نسخ الرابط</>}
        </button>
        <a href={whatsappUrl(inviteText(receiver, keyValue, base))} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-glass-line py-3 text-sm text-ink active:scale-[0.97]">
          <MessageCircle className="h-4 w-4" /> واتساب
        </a>
      </div>
    </div>
  )
}
