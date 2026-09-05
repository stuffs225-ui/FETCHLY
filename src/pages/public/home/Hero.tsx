import { ArrowRight, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const stats = [
  { value: '2,400+', label: 'Products Sourced' },
  { value: '98%', label: 'On-Time Delivery' },
  { value: '60+', label: 'Countries Served' },
  { value: '$0', label: 'Hidden Fees' },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-[32rem] w-[32rem] animate-float rounded-full bg-primary/25 blur-[110px]" />
        <div className="absolute top-10 right-[-10rem] h-[28rem] w-[28rem] animate-float-slow rounded-full bg-gold/20 blur-[110px]" />
        <div className="absolute inset-0 bg-noise opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-8">
        <div className="animate-fade-up mb-7 inline-flex items-center gap-2 rounded-full border border-border-light bg-white/5 px-4 py-1.5 text-sm font-medium text-text-secondary backdrop-blur">
          <span>🇺🇸</span> USA + <span>🇬🇧</span> UK Sourcing Network
        </div>

        <h1 className="animate-fade-up text-balance font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-text sm:text-6xl lg:text-7xl" style={{ animationDelay: '80ms' }}>
          Source Anything from the{' '}
          <span className="bg-gradient-to-r from-primary via-[#7d93ff] to-gold bg-clip-text text-transparent">
            US & UK
          </span>
        </h1>

        <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-text-secondary sm:text-xl" style={{ animationDelay: '160ms' }}>
          Submit a request. Get a quote in 24h. We handle purchasing, shipping & customs —
          door to door.
        </p>

        <div className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ animationDelay: '240ms' }}>
          <Button to="/request" size="lg">
            Submit a Request <ArrowRight className="h-5 w-5" />
          </Button>
          <Button to="/how-it-works" variant="secondary" size="lg">
            <PlayCircle className="h-5 w-5" /> How It Works
          </Button>
        </div>

        <div className="animate-fade-up mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-8 border-t border-border pt-10 sm:grid-cols-4" style={{ animationDelay: '320ms' }}>
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-mono text-3xl font-bold text-text sm:text-4xl">{s.value}</div>
              <div className="mt-1.5 text-xs font-medium uppercase tracking-wider text-text-secondary">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
