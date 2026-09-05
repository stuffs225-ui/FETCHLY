import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Drawer({
  open,
  onClose,
  title,
  children,
  widthClass = 'max-w-xl',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  widthClass?: string
}) {
  return (
    <div className={cn('fixed inset-0 z-50', open ? 'pointer-events-auto' : 'pointer-events-none')}>
      <div
        onClick={onClose}
        className={cn('absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')}
      />
      <div
        className={cn(
          'absolute inset-y-0 end-0 flex h-full w-full flex-col border-s border-border bg-surface shadow-2xl transition-transform duration-300 ease-out',
          widthClass,
          open ? 'translate-x-0' : 'rtl:-translate-x-full ltr:translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-lg font-bold text-text">{title}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/5">
            <X className="h-4.5 w-4.5 text-text-muted" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
