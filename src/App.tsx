import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { I18nProvider } from '@/i18n'
import ScrollToTop from '@/components/ScrollToTop'
import PublicLayout from '@/components/layout/PublicLayout'

import Home from '@/pages/public/Home'
import HowItWorks from '@/pages/public/HowItWorks'
import WhatWeSource from '@/pages/public/WhatWeSource'
import About from '@/pages/public/About'
import Trust from '@/pages/public/Trust'
import Faq from '@/pages/public/Faq'
import Contact from '@/pages/public/Contact'
import RequestPage from '@/pages/public/RequestPage'
import NotFound from '@/pages/public/NotFound'
import LegalPage from '@/pages/legal/LegalPage'

// Admin pulls in jsPDF/html2canvas and the whole back-office UI — keep it out
// of the public bundle entirely via lazy loading.
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'))
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'))
const Requests = lazy(() => import('@/pages/admin/Requests'))
const Quotations = lazy(() => import('@/pages/admin/Quotations'))
const QuotationEditor = lazy(() => import('@/pages/admin/quotations/QuotationEditor'))
const SavedProducts = lazy(() => import('@/pages/admin/SavedProducts'))
const Cases = lazy(() => import('@/pages/admin/Cases'))
const Faqs = lazy(() => import('@/pages/admin/Faqs'))
const AdminTrust = lazy(() => import('@/pages/admin/Trust'))
const WebsiteContent = lazy(() => import('@/pages/admin/WebsiteContent'))
const CompanySettings = lazy(() => import('@/pages/admin/CompanySettings'))
const EmailSettings = lazy(() => import('@/pages/admin/EmailSettings'))
const Users = lazy(() => import('@/pages/admin/Users'))

function AdminFallback() {
  return <div className="flex min-h-screen items-center justify-center bg-ink text-text-muted">جاري التحميل...</div>
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/what-we-source" element={<WhatWeSource />} />
            <Route path="/about" element={<About />} />
            <Route path="/trust" element={<Trust />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/request" element={<RequestPage />} />
            <Route path="/legal/:slug" element={<LegalPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route
            path="/admin"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminLayout />
              </Suspense>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="requests" element={<Requests />} />
            <Route path="quotations" element={<Quotations />} />
            <Route path="quotations/:id" element={<QuotationEditor />} />
            <Route path="saved-products" element={<SavedProducts />} />
            <Route path="cases" element={<Cases />} />
            <Route path="faqs" element={<Faqs />} />
            <Route path="trust" element={<AdminTrust />} />
            <Route path="content" element={<WebsiteContent />} />
            <Route path="company" element={<CompanySettings />} />
            <Route path="email" element={<EmailSettings />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  )
}
