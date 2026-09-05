import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Logo } from './Logo'
import { LanguageSwitch } from './LanguageSwitch'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

export default function PublicHeader() {
  const { t } = useI18n()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { to: '/how-it-works', label: t.nav.howItWorks },
    { to: '/what-we-source', label: t.nav.whatWeSource },
    { to: '/about', label: t.nav.about },
    { to: '/trust', label: t.nav.trust },
    { to: '/faq', label: t.nav.faq },
    { to: '/contact', label: t.nav.contact },
  ]

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-all duration-300',
        scrolled ? 'border-border bg-ink/85 backdrop-blur-lg' : 'border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 py-3.5 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-7 xl:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => cn('text-sm font-medium transition-colors hover:text-text', isActive ? 'text-primary' : 'text-text-muted')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <LanguageSwitch />
          <Button to="/request" size="sm">
            {t.nav.requestQuote}
          </Button>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <LanguageSwitch />
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-text" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'grid overflow-hidden border-t border-border bg-ink/95 backdrop-blur-lg transition-all duration-300 xl:hidden',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] border-t-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted hover:bg-black/5 hover:text-text">
                {link.label}
              </Link>
            ))}
            <Button to="/request" size="sm" className="mt-2 w-full justify-center" onClick={() => setOpen(false)}>
              {t.nav.requestQuote}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
