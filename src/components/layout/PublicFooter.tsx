import { Link } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'
import { Logo } from './Logo'
import { TrustBar } from './TrustBar'
import { useI18n } from '@/i18n'
import { companySettingsStore } from '@/lib/repo'
import { useCollectionVersion } from '@/lib/useCollection'

export default function PublicFooter() {
  useCollectionVersion()
  const { t } = useI18n()
  const settings = companySettingsStore.get()

  return (
    <footer>
      <TrustBar />
      <div className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.3fr]">
            <div>
              <Logo />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-muted">{t.hero.eyebrow}</p>
              <div className="mt-6 flex flex-col gap-2 text-sm text-text-muted">
                <a href={`mailto:${settings.businessEmail}`} className="flex items-center gap-2 hover:text-text">
                  <Mail className="h-3.5 w-3.5" /> {settings.businessEmail}
                </a>
                <a href={`tel:${settings.phone}`} className="flex items-center gap-2 hover:text-text">
                  <Phone className="h-3.5 w-3.5" /> {settings.phone}
                </a>
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-semibold text-text-muted">{t.footer.companyHeading}</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/about" className="text-text-muted hover:text-text">{t.footer.links.about}</Link></li>
                <li><Link to="/how-it-works" className="text-text-muted hover:text-text">{t.footer.links.howItWorks}</Link></li>
                <li><Link to="/trust" className="text-text-muted hover:text-text">{t.footer.links.trust}</Link></li>
                <li><Link to="/contact" className="text-text-muted hover:text-text">{t.footer.links.contact}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-semibold text-text-muted">{t.footer.servicesHeading}</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/request" className="text-text-muted hover:text-text">{t.footer.links.requestQuote}</Link></li>
                <li><Link to="/what-we-source" className="text-text-muted hover:text-text">{t.footer.links.whatWeSource}</Link></li>
                <li><Link to="/faq" className="text-text-muted hover:text-text">{t.footer.links.faq}</Link></li>
              </ul>
              <h4 className="mb-3 mt-6 text-xs font-semibold text-text-muted">{t.footer.legalHeading}</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/legal/privacy" className="text-text-muted hover:text-text">{t.footer.links.privacy}</Link></li>
                <li><Link to="/legal/terms" className="text-text-muted hover:text-text">{t.footer.links.terms}</Link></li>
                <li><Link to="/legal/complaints" className="text-text-muted hover:text-text">{t.footer.links.complaints}</Link></li>
                <li><Link to="/legal/cookies" className="text-text-muted hover:text-text">{t.footer.links.cookies}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-semibold text-text-muted">{t.footer.companyDataHeading}</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>{settings.companyNameAr}</li>
                <li>CR: {settings.crNumber}</li>
                <li>VAT: {settings.vatNumber}</li>
                <li>{settings.nationalAddress}</li>
                <li>{settings.websiteDomain}</li>
              </ul>
              <Link to="/admin" className="mt-4 inline-block text-xs text-text-muted/60 hover:text-text-muted">
                {t.nav.admin}
              </Link>
            </div>
          </div>

          <div className="mt-14 border-t border-border pt-8 text-center text-xs text-text-muted">
            <p>© {new Date().getFullYear()} {settings.companyNameAr} — {t.footer.rights}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
