export function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex h-48 gap-3">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div className="relative flex w-full flex-1 items-end justify-center overflow-hidden">
            <div
              className="w-full max-w-9 rounded-t-md bg-gradient-to-t from-primary to-[#7d93ff] shadow-[0_0_16px_rgba(79,110,247,0.35)] transition-all duration-700 ease-out"
              style={{ height: `${(d.value / max) * 100}%` }}
              title={`$${d.value.toLocaleString()}`}
            />
          </div>
          <span className="text-[11px] font-medium text-text-secondary">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
