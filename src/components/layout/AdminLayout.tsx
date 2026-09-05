import { useEffect, useState } from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'
import AdminLogin from '@/pages/admin/AdminLogin'
import { fetchCurrentUser, logout as apiLogout, type AdminSessionUser } from '@/lib/adminAuth'
import { cn } from '@/lib/utils'

const titles: Record<string, string> = {
  '/admin/dashboard': 'الرئيسية',
  '/admin/requests': 'الطلبات',
  '/admin/quotations': 'عروض الأسعار',
  '/admin/saved-products': 'المنتجات المحفوظة',
  '/admin/cases': 'حالات التوريد',
  '/admin/faqs': 'الأسئلة الشائعة',
  '/admin/trust': 'الشهادات والتوثيق',
  '/admin/content': 'محتوى الموقع',
  '/admin/company': 'إعدادات الشركة',
  '/admin/email': 'إعدادات البريد',
  '/admin/users': 'المستخدمون',
}

export default function AdminLayout() {
  const [user, setUser] = useState<AdminSessionUser | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .finally(() => setCheckingSession(false))
  }, [])

  const handleLogout = () => {
    apiLogout().finally(() => setUser(null))
  }

  if (checkingSession) {
    return <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-text-muted">جارٍ التحميل...</div>
  }

  if (!user) {
    return <AdminLogin onLogin={setUser} />
  }

  if (location.pathname === '/admin' || location.pathname === '/admin/') {
    return <Navigate to="/admin/dashboard" replace />
  }

  const title = Object.entries(titles).find(([path]) => location.pathname.startsWith(path))?.[1] ?? 'لوحة التحكم'

  return (
    <div dir="rtl" lang="ar" className="flex min-h-screen bg-ink">
      <AdminSidebar onLogout={handleLogout} />

      {/* mobile drawer */}
      <div className={cn('fixed inset-0 z-50 lg:hidden', mobileOpen ? 'pointer-events-auto' : 'pointer-events-none')}>
        <div onClick={() => setMobileOpen(false)} className={cn('absolute inset-0 bg-black/60 transition-opacity', mobileOpen ? 'opacity-100' : 'opacity-0')} />
        <div className={cn('absolute inset-y-0 start-0 w-64 bg-surface transition-transform', mobileOpen ? 'translate-x-0' : 'translate-x-full')}>
          <AdminSidebar onLogout={handleLogout} />
        </div>
      </div>

      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
        <div className="flex items-center gap-2 border-b border-border bg-surface/60 px-4 py-3 lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-lg text-text">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold text-text">{title}</span>
        </div>
        <div className="hidden lg:block">
          <AdminTopbar title={title} />
        </div>
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {mobileOpen && (
        <button onClick={() => setMobileOpen(false)} className="fixed end-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-text lg:hidden">
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
