import { Compass, Target, Eye, Zap } from 'lucide-react'
import { useI18n } from '@/i18n'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DirArrow } from '@/components/ui/DirArrow'
import { usePageTitle } from '@/lib/usePageTitle'

export default function About() {
  const { t } = useI18n()
  const p = t.aboutPage
  usePageTitle('من نحن | حلقة الوصل بين احتياجك والسوق العالمي', 'About Us | The Link Between Your Requirement and the Global Market')

  return (
    <>
      <section className="border-b border-border py-20 text-center">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">{p.hero.eyebrow}</span>
          <h1 className="mt-3 text-balance text-4xl font-extrabold tracking-tight text-text sm:text-5xl">{p.hero.title}</h1>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-14 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <Compass className="h-7 w-7 text-gold" />
            <h2 className="mt-4 text-2xl font-bold text-text">{p.whyExist.title}</h2>
            <p className="mt-3 leading-relaxed text-text-muted">{p.whyExist.body}</p>
          </div>
          <div>
            <Target className="h-7 w-7 text-gold" />
            <h2 className="mt-4 text-2xl font-bold text-text">{p.whatWeDo.title}</h2>
            <ol className="mt-3 space-y-2.5">
              {p.whatWeDo.steps.map((s, i) => (
                <li key={s} className="flex items-start gap-3 text-text-muted">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/10 font-mono text-[11px] font-bold text-gold">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface/60 py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:px-8">
          <Card className="p-8">
            <Eye className="h-6 w-6 text-gold" />
            <h3 className="mt-4 text-lg font-bold text-text">{p.vision.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">{p.vision.body}</p>
          </Card>
          <Card className="p-8">
            <Zap className="h-6 w-6 text-gold" />
            <h3 className="mt-4 text-lg font-bold text-text">{p.mission.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">{p.mission.body}</p>
          </Card>
        </div>

        <div className="mx-auto mt-10 max-w-5xl px-6 lg:px-8">
          <h3 className="text-center text-lg font-bold text-text">{p.howWeWork.title}</h3>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {p.howWeWork.items.map((item) => (
              <span key={item} className="rounded-full border border-border-light bg-card px-4 py-2 text-sm font-medium text-text-muted">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-center">
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
