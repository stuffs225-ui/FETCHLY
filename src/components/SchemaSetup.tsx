import { useState } from 'react'
import { Check, Copy, ExternalLink, RefreshCw } from 'lucide-react'
import { copyText } from '@/lib/share'

/** One-time database setup, shown right on the door screen so nothing has to be hunted down. */
export function SchemaSetup({ sql, dashboard }: { sql: string; dashboard: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    if (await copyText(sql)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }
  return (
    <div className="mt-6 w-full max-w-sm space-y-3 text-start">
      <p className="text-center text-lg text-ink">خطوة واحدة في Supabase</p>
      <ol className="space-y-1.5 px-1 text-sm leading-7 text-mist">
        <li>١) اضغط «نسخ الكود».</li>
        <li>٢) افتح Supabase ← الصق الكود ← اضغط <b className="text-ink">Run</b>.</li>
        <li>٣) ارجع هنا واضغط «تحديث».</li>
      </ol>
      <button onClick={copy} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-base font-bold text-on-accent active:scale-[0.98]">
        {copied ? <><Check className="h-4.5 w-4.5" /> تم النسخ</> : <><Copy className="h-4.5 w-4.5" /> نسخ الكود</>}
      </button>
      <a href={dashboard} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-glass-line py-3 text-sm text-ink active:scale-[0.98]">
        <ExternalLink className="h-4 w-4" /> فتح Supabase (SQL Editor)
      </a>
      <button onClick={() => location.reload()} className="flex w-full items-center justify-center gap-2 py-2 text-sm text-mist">
        <RefreshCw className="h-4 w-4" /> تحديث
      </button>
      <p className="px-2 text-center text-[11px] leading-5 text-mist/70">الكود آمن: ينشئ جداول جديدة أسماؤها تبدأ بـ nb_ ولا يلمس منتجاتك أو جداولك الأخرى.</p>
    </div>
  )
}
