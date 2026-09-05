import { NavLink, Link } from 'react-router-dom'
import { Globe2,
  LayoutDashboard, ClipboardList, FileSpreadsheet, Boxes, MapPinned, HelpCircle, ShieldCheck, FileCog, Building2, Mail, Users, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { companySettingsStore } from '@/lib/repo'
import { useCollectionVersion } from '@/lib/useCollection'

const links = [
  { to: '/admin/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { to: '/admin/requests', label: 'الطلبات', icon: ClipboardList },
  { to: '/admin/quotations', label: 'عروض الأسعار', icon: FileSpreadsheet },
  { to: '/admin/saved-products', label: 'المنتجات المحفوظة', icon: Boxes },
  { to: '/admin/cases', label: 'حالات التوريد', icon: MapPinned },
  { to: '/admin/faqs', label: 'الأسئلة الشائعة', icon: HelpCircle },
  { to: '/admin/trust', label: 'الشهادات والتوثيق', icon: ShieldCheck },
  { to: '/admin/content', label: 'محتوى الموقع', icon: FileCog },
  { to: '/admin/company', label: 'إعدادات الشركة', icon: Building2 },
  { to: '/admin/email', label: 'إعدادات البريد', icon: Mail },
  { to: '/admin/users', label: 'المستخدمون', icon: Users },
]

export default function AdminSidebar({ onLogout }: { onLogout: () => void }) {
  useCollectionVersion()
  const settings = companySettingsStore.get()
  const name = settings.companyNameAr.trim()

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-navy lg:flex">
      <Link to="/admin/dashboard" className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          {name ? <span className="font-bold text-white">{name.charAt(0)}</span> : <Globe2 className="h-4.5 w-4.5 text-white" />}
        </span>
        <span className="text-lg font-extrabold text-white">{name || 'لوحة التحكم'}</span>
      </Link>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white',
              )
            }
          >
            <link.icon className="h-4.5 w-4.5" />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/55 hover:bg-white/5 hover:text-white">
          <LogOut className="h-4.5 w-4.5" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}
