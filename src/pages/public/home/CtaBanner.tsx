import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function CtaBanner() {
  return (
    <section className="border-t border-border py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-gold/10 px-8 py-16 text-center">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 animate-pulse-glow rounded-full bg-primary/30 blur-[100px]" />
          <h2 className="relative font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            Ready to source your first product?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-text-secondary">
            Join thousands of businesses and individuals sourcing confidently from the US &amp; UK.
          </p>
          <div className="relative mt-8">
            <Button to="/request" size="lg">
              Start Your Request <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
