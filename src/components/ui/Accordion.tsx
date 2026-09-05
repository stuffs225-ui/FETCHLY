import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
          >
            <span className="font-medium text-text">{item.q}</span>
            <Plus
              className={cn('h-5 w-5 shrink-0 text-primary transition-transform duration-300', open === i && 'rotate-45')}
            />
          </button>
          <div
            className={cn(
              'grid overflow-hidden transition-all duration-300 ease-in-out',
              open === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
            )}
          >
            <div className="overflow-hidden">
              <p className="px-6 pb-5 text-sm leading-relaxed text-text-muted">{item.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
