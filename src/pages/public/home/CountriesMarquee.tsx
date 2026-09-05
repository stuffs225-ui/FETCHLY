import { countriesServed } from '@/lib/mockData'

export default function CountriesMarquee() {
  const loop = [...countriesServed, ...countriesServed]
  return (
    <section className="border-t border-border py-16">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Countries We Serve</span>
      </div>
      <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee gap-10 py-2">
          {loop.map((c, i) => (
            <div key={i} className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-text-secondary">
              <span className="text-2xl">{c.flag}</span>
              <span className="text-sm font-medium">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
