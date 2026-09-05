import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { DirArrow } from '@/components/ui/DirArrow'
import { usePageTitle } from '@/lib/usePageTitle'

export default function About() {
  const { t } = useI18n()
  const p = t.aboutPage
  usePageTitle('من نحن | حلقة الوصل بين احتياجك والسوق العالمي', 'About Us | The Link Between Your Requirement and the Global Market')

  return (
    <>
      <section className="border-b border-border py-16 text-center">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">{p.hero.eyebrow}</span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{p.hero.title}</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-2xl space-y-4 px-6 text-center lg:px-8">
          {p.intro.map((line) => (
            <p key={line} className="text-lg leading-relaxed text-text-muted">{line}</p>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-2xl px-6 lg:px-8">
          <h2 className="text-center text-lg font-bold text-text">{p.whatWeDo.title}</h2>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {p.whatWeDo.steps.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <span className="rounded-full border border-border-light bg-card px-5 py-2.5 text-sm font-semibold text-text">{step}</span>
                {i < p.whatWeDo.steps.length - 1 && <DirArrow className="h-4 w-4 text-text-muted" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-16 text-center">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-text sm:text-3xl">{p.closing.title}</h2>
          <div className="mt-7">
            <Button to="/request" size="lg">
              {p.closing.cta} <DirArrow />
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
