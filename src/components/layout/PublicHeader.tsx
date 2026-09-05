import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ArrowRight } from 'lucide-react'
import { Logo } from './Logo'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/track', label: 'Track Order' },
]

export default function PublicHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-all duration-300',
        scrolled ? 'border-border bg-bg/85 backdrop-blur-lg' : 'border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium transition-colors hover:text-text',
                  isActive ? 'text-text' : 'text-text-secondary',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button to="/request" variant="primary" size="sm">
            Submit a Request <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-text lg:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          'grid overflow-hidden border-t border-border bg-bg/95 backdrop-blur-lg transition-all duration-300 lg:hidden',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] border-t-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-white/5 hover:text-text"
              >
                {link.label}
              </Link>
            ))}
            <Button to="/request" variant="primary" size="sm" className="mt-2 w-full" onClick={() => setOpen(false)}>
              Submit a Request <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
