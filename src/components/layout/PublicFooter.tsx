import { Link } from 'react-router-dom'
import { MessageCircle, Mail } from 'lucide-react'
import { Logo } from './Logo'

const columns = [
  {
    title: 'Company',
    links: [
      { label: 'How It Works', to: '/how-it-works' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Corporate Procurement', to: '/how-it-works' },
      { label: 'Track Order', to: '/track' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Refund Policy', to: '/refund' },
    ],
  },
]

export default function PublicFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[2fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-secondary">
              The World. Delivered. Source anything from the US &amp; UK — we handle the rest.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="mailto:hello@fetchly.com"
                className="flex items-center gap-2 rounded-lg border border-border-light px-3.5 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-primary hover:text-text"
              >
                <Mail className="h-3.5 w-3.5" /> hello@fetchly.com
              </a>
              <a
                href="#"
                className="flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 px-3.5 py-2 text-xs font-medium text-success transition-colors hover:bg-success/20"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-text-secondary transition-colors hover:text-text">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">Sourcing From</h4>
            <div className="space-y-3 text-sm text-text-secondary">
              <p>🇺🇸 United States</p>
              <p>🇬🇧 United Kingdom</p>
            </div>
            <h4 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">Admin</h4>
            <Link to="/admin" className="text-sm text-text-secondary transition-colors hover:text-text">
              Admin Portal →
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-text-secondary sm:flex-row">
          <p>© 2026 FETCHLY. All rights reserved.</p>
          <p>🇺🇸 Sourcing from USA &amp; UK 🇬🇧 &nbsp;|&nbsp; Delivered Worldwide 🌍</p>
        </div>
      </div>
    </footer>
  )
}
