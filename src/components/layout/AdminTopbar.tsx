import { Bell, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminTopbar({ title }: { title: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface/60 px-6 backdrop-blur">
      <h1 className="text-xl font-bold text-text">{title}</h1>
      <div className="flex items-center gap-4">
        <Link to="/" target="_blank" className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text">
          <ExternalLink className="h-3.5 w-3.5" /> عرض الموقع
        </Link>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-white/5 hover:text-text">
          <Bell className="h-4.5 w-4.5" />
        </button>
        <div className="flex items-center gap-2.5 border-s border-border ps-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gold to-navy text-xs font-bold text-white">أد</div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-text">المشرف</p>
          </div>
        </div>
      </div>
    </header>
  )
}
