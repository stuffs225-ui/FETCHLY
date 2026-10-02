import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, ChevronDown } from 'lucide-react'
import { Logo } from './Logo'
import { useI18n } from '@/i18n'
import { getPublicCompany } from '@/lib/repo'
import { useAsyncData } from '@/lib/useAsync'
import { cn } from '@/lib/utils'
import type { CompanySettings } from '@/lib/types'

const emptySettings: CompanySettings = {
  companyNameAr: '', companyNameEn: '', crNumber: '', vatNumber: '', zakatCertificate: '', sbcNumber: '',
  nationalAddress: '', baladyLicense: '', phone: '', whatsapp: '', businessEmail: '', quotationEmail: '',
  websiteDomain: '', address: '', footerText: '', defaultVatRate: 15, defaultCurrency: 'SAR',
}

/** Collapsible on mobile to keep the footer short; always expanded from `sm:` up. */
function FooterGroup({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/10 py-4 sm:border-0 sm:py-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-start sm:pointer-events-none"
      >
        <h4 className="text-xs font-semibold text-white/40">{title}</h4>
        <ChevronDown className={cn('h-4 w-4 text-white/40 transition-transform sm:hidden', open && 'rotate-180')} />
      </button>
      <div
        className={cn(
          'grid overflow-hidden transition-all duration-300',
          open ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          'sm:mt-4 sm:grid-rows-[1fr] sm:opacity-100',
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  )
}

export default function PublicFooter() {
  const { t } = useI18n()
  const { data } = useAsyncData(getPublicCompany, [])
  const settings = data ?? emptySettings

  const legalLines = [
    settings.crNumber && `CR: ${settings.crNumber}`,
    settings.vatNumber && `VAT: ${settings.vatNumber}`,
    settings.nationalAddress,
  ].filter(Boolean) as string[]

  return (
    <footer className="bg-navy">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.3fr]">
            <div>
              <Logo dark />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">{t.hero.eyebrow}</p>
              <div className="mt-6 flex flex-col gap-2 text-sm text-white/60">
                {settings.businessEmail && (
                  <a href={`mailto:${settings.businessEmail}`} className="flex items-center gap-2 hover:text-white">
                    <Mail className="h-3.5 w-3.5" /> {settings.businessEmail}
                  </a>
                )}
                {settings.phone && (
                  <a href={`tel:${settings.phone}`} className="flex items-center gap-2 hover:text-white">
                    <Phone className="h-3.5 w-3.5" /> {settings.phone}
                  </a>
                )}
              </div>
            </div>

            <FooterGroup title={t.footer.companyHeading}>
              <ul className="space-y-3 text-sm">
                <li><Link to="/about" className="text-white/60 hover:text-white">{t.footer.links.about}</Link></li>
                <li><Link to="/how-it-works" className="text-white/60 hover:text-white">{t.footer.links.howItWorks}</Link></li>
                <li><Link to="/trust" className="text-white/60 hover:text-white">{t.footer.links.trust}</Link></li>
                <li><Link to="/contact" className="text-white/60 hover:text-white">{t.footer.links.contact}</Link></li>
              </ul>
            </FooterGroup>

            <div className="sm:space-y-6">
              <FooterGroup title={t.footer.servicesHeading}>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/request" className="text-white/60 hover:text-white">{t.footer.links.requestQuote}</Link></li>
                  <li><Link to="/products" className="text-white/60 hover:text-white">{t.nav.products}</Link></li>
                  <li><Link to="/brands" className="text-white/60 hover:text-white">{t.nav.brands}</Link></li>
                  <li><Link to="/what-we-source" className="text-white/60 hover:text-white">{t.footer.links.whatWeSource}</Link></li>
                  <li><Link to="/faq" className="text-white/60 hover:text-white">{t.footer.links.faq}</Link></li>
                </ul>
              </FooterGroup>
              <FooterGroup title={t.footer.legalHeading}>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/legal/privacy" className="text-white/60 hover:text-white">{t.footer.links.privacy}</Link></li>
                  <li><Link to="/legal/terms" className="text-white/60 hover:text-white">{t.footer.links.terms}</Link></li>
                  <li><Link to="/legal/complaints" className="text-white/60 hover:text-white">{t.footer.links.complaints}</Link></li>
                  <li><Link to="/legal/cookies" className="text-white/60 hover:text-white">{t.footer.links.cookies}</Link></li>
                </ul>
              </FooterGroup>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-semibold text-white/40">{t.footer.companyDataHeading}</h4>
              <ul className="space-y-2 text-sm text-white/60">
                {settings.companyNameAr && <li>{settings.companyNameAr}</li>}
                {legalLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
                {settings.websiteDomain && <li>{settings.websiteDomain}</li>}
              </ul>
              <Link to="/admin" className="mt-4 inline-block text-xs text-white/30 hover:text-white/50">
                {t.nav.admin}
              </Link>
            </div>
          </div>

          <div className="mt-14 border-t border-white/10 pt-8 text-center text-xs text-white/40">
            <p>© {new Date().getFullYear()} {settings.companyNameAr} — {t.footer.rights}</p>
          </div>
        </div>
    </footer>
  )
}
