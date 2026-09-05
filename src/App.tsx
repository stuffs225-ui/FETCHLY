import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ScrollToTop from '@/components/ScrollToTop'
import PublicLayout from '@/components/layout/PublicLayout'
import AdminLayout from '@/components/layout/AdminLayout'

import Home from '@/pages/public/Home'
import HowItWorks from '@/pages/public/HowItWorks'
import SubmitRequest from '@/pages/public/SubmitRequest'
import TrackOrder from '@/pages/public/TrackOrder'
import Pricing from '@/pages/public/Pricing'
import NotFound from '@/pages/public/NotFound'

import Dashboard from '@/pages/admin/Dashboard'
import AdminRequests from '@/pages/admin/Requests'
import AdminQuotes from '@/pages/admin/Quotes'
import AdminOrders from '@/pages/admin/Orders'
import AdminShipments from '@/pages/admin/Shipments'
import AdminCustomers from '@/pages/admin/Customers'
import AdminPayments from '@/pages/admin/Payments'
import AdminSettings from '@/pages/admin/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/request" element={<SubmitRequest />} />
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="quotes" element={<AdminQuotes />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="shipments" element={<AdminShipments />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
