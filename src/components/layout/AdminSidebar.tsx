import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquareText,
  Package,
  CreditCard,
  Ship,
  Users,
  Settings,
  LogOut,
} from 'lucide-react'
import { Logo } from './Logo'
import { cn } from '@/lib/utils'

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/requests', label: 'Requests', icon: ClipboardList },
  { to: '/admin/quotes', label: 'Quotes', icon: MessageSquareText },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/shipments', label: 'Shipments', icon: Ship },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminSidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="px-5 py-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-glow text-primary shadow-[0_0_0_1px_rgba(79,110,247,0.3)]'
                  : 'text-text-secondary hover:bg-white/5 hover:text-text',
              )
            }
          >
            <link.icon className="h-4.5 w-4.5" />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-text"
        >
          <LogOut className="h-4.5 w-4.5" />
          Log Out
        </button>
      </div>
    </aside>
  )
}
