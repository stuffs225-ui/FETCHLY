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

  const legalLines = [
    settings.crNumber && `CR: ${settings.crNumber}`,
    settings.vatNumber && `VAT: ${settings.vatNumber}`,
    settings.nationalAddress,
  ].filter(Boolean) as string[]

  return (
    <footer className="bg-navy">
      <TrustBar />
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
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

            <div>
              <h4 className="mb-4 text-xs font-semibold text-white/40">{t.footer.companyHeading}</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/about" className="text-white/60 hover:text-white">{t.footer.links.about}</Link></li>
                <li><Link to="/how-it-works" className="text-white/60 hover:text-white">{t.footer.links.howItWorks}</Link></li>
                <li><Link to="/trust" className="text-white/60 hover:text-white">{t.footer.links.trust}</Link></li>
                <li><Link to="/contact" className="text-white/60 hover:text-white">{t.footer.links.contact}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-semibold text-white/40">{t.footer.servicesHeading}</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/request" className="text-white/60 hover:text-white">{t.footer.links.requestQuote}</Link></li>
                <li><Link to="/what-we-source" className="text-white/60 hover:text-white">{t.footer.links.whatWeSource}</Link></li>
                <li><Link to="/faq" className="text-white/60 hover:text-white">{t.footer.links.faq}</Link></li>
              </ul>
              <h4 className="mb-3 mt-6 text-xs font-semibold text-white/40">{t.footer.legalHeading}</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/legal/privacy" className="text-white/60 hover:text-white">{t.footer.links.privacy}</Link></li>
                <li><Link to="/legal/terms" className="text-white/60 hover:text-white">{t.footer.links.terms}</Link></li>
                <li><Link to="/legal/complaints" className="text-white/60 hover:text-white">{t.footer.links.complaints}</Link></li>
                <li><Link to="/legal/cookies" className="text-white/60 hover:text-white">{t.footer.links.cookies}</Link></li>
              </ul>
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
      </div>
    </footer>
  )
}
