import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <span className="font-mono text-sm font-medium text-primary">404</span>
      <h1 className="mt-3 font-display text-4xl font-extrabold text-text">Page not found</h1>
      <p className="mt-3 max-w-sm text-text-secondary">The page you're looking for doesn't exist or has moved.</p>
      <Button to="/" className="mt-8">
        Back to Home
      </Button>
    </section>
  )
}
