import { useState } from 'react'
import { Search, CheckCircle2, Circle, XCircle, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/StatusBadge'
import { requests, PIPELINE_STAGES } from '@/lib/mockData'
import { cn, formatDate } from '@/lib/utils'

export default function TrackOrder() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<(typeof requests)[number] | null | 'not_found'>(null)

  const handleSearch = () => {
    const q = query.trim().toLowerCase()
    if (!q) return
    const found = requests.find((r) => r.id.toLowerCase().includes(q))
    setResult(found ?? 'not_found')
  }

  const stageIndex = result && result !== 'not_found' ? PIPELINE_STAGES.findIndex((s) => s.key === result.status) : -1
  const cancelled = result && result !== 'not_found' && result.status === 'cancelled'

  return (
    <section className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Track Order</span>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
          Where's Your Order?
        </h1>
        <p className="mt-4 text-text-secondary">Enter your Request # or Order # to see live status.</p>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. REQ-2026-10045"
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Track Now</Button>
      </div>
      <p className="mt-3 text-center text-xs text-text-secondary">
        Try a sample: <button onClick={() => { setQuery(requests[0].id); }} className="font-mono font-semibold text-primary hover:underline">{requests[0].id}</button>
      </p>

      {result === 'not_found' && (
        <Card className="mt-10 flex flex-col items-center gap-3 p-10 text-center">
          <XCircle className="h-10 w-10 text-danger" />
          <p className="font-medium text-text">We couldn't find that request.</p>
          <p className="text-sm text-text-secondary">Double-check your Request # or Order # and try again.</p>
        </Card>
      )}

      {result && result !== 'not_found' && (
        <Card className="mt-10 p-7 sm:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary">Request Number</p>
              <p className="mt-1 font-mono text-lg font-bold text-text">{result.id}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={result.status} />
              <span className="text-xs text-text-secondary">Updated {formatDate(result.date)}</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-b border-border pb-6 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-text-secondary">Product</p>
              <p className="mt-1 font-medium text-text">{result.product}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Source</p>
              <p className="mt-1 font-medium text-text">{result.source === 'USA' ? '🇺🇸 USA' : '🇬🇧 UK'}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Destination</p>
              <p className="mt-1 font-medium text-text">{result.country}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Agent</p>
              <p className="mt-1 font-medium text-text">{result.agent}</p>
            </div>
          </div>

          <div className="mt-8">
            {cancelled ? (
              <div className="flex items-center gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-red-300">
                <XCircle className="h-5 w-5 shrink-0" /> This request was cancelled.
              </div>
            ) : (
              <ol className="space-y-0">
                {PIPELINE_STAGES.map((stage, i) => {
                  const done = i < stageIndex
                  const current = i === stageIndex
                  return (
                    <li key={stage.key} className="relative flex gap-4 pb-8 last:pb-0">
                      {i < PIPELINE_STAGES.length - 1 && (
                        <span
                          className={cn(
                            'absolute left-[15px] top-8 h-full w-0.5',
                            done ? 'bg-primary' : 'bg-border',
                          )}
                        />
                      )}
                      <span
                        className={cn(
                          'z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
                          done && 'border-primary bg-primary text-white',
                          current && 'border-primary bg-bg text-primary shadow-[0_0_0_4px_rgba(79,110,247,0.2)]',
                          !done && !current && 'border-border-light bg-bg text-text-secondary',
                        )}
                      >
                        {done ? <CheckCircle2 className="h-4.5 w-4.5" /> : current ? <Package className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                      </span>
                      <div className="pt-1">
                        <p className={cn('text-sm font-semibold', current ? 'text-primary' : done ? 'text-text' : 'text-text-secondary')}>
                          {stage.label}
                        </p>
                        {current && <p className="mt-0.5 text-xs text-text-secondary">In progress — we'll notify you at the next update.</p>}
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </Card>
      )}
    </section>
  )
}
