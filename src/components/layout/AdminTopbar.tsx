import { Bell } from 'lucide-react'

export default function AdminTopbar({ title }: { title: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface/60 px-6 backdrop-blur">
      <h1 className="font-display text-xl font-bold text-text">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-white/5 hover:text-text">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold" />
        </button>
        <div className="flex items-center gap-2.5 border-l border-border pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-gold font-display text-xs font-bold text-white">
            AM
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-text">Amira Farouk</p>
            <p className="text-xs text-text-secondary">Operations Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}
