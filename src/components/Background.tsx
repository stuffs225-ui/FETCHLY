/** A quiet backdrop: flat colour with the faintest light from above. When they are together it warms very slightly. */
export function Background({ together }: { together: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-night" aria-hidden>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(90% 60% at 50% 0%, color-mix(in srgb, var(--accent) 7%, transparent), transparent 70%)' }} />
      <div
        className="absolute inset-0 transition-opacity duration-[3000ms] ease-out"
        style={{ opacity: together ? 1 : 0, background: 'radial-gradient(60% 45% at 50% 40%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 75%)' }}
      />
    </div>
  )
}
