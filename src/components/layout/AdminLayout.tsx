import { Outlet, useLocation, Navigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'
import AdminLogin from '@/pages/admin/AdminLogin'
import { useAdminAuth } from '@/hooks/useAdminAuth'

const titles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/dashboard': 'Dashboard',
  '/admin/requests': 'Requests',
  '/admin/quotes': 'Quotes',
  '/admin/orders': 'Orders',
  '/admin/payments': 'Payments',
  '/admin/shipments': 'Shipments',
  '/admin/customers': 'Customers',
  '/admin/settings': 'Settings',
}

export default function AdminLayout() {
  const { authed, login, logout } = useAdminAuth()
  const location = useLocation()

  if (!authed) {
    return <AdminLogin onLogin={login} />
  }

  if (location.pathname === '/admin/') {
    return <Navigate to="/admin/dashboard" replace />
  }

  const title = titles[location.pathname] ?? 'Dashboard'

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar onLogout={logout} />
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar title={title} />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
