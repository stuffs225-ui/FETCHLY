import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

/** Points in the "forward/next" reading direction: left in RTL, right in LTR. */
export function DirArrow({ className }: { className?: string }) {
  const { dir } = useI18n()
  const Icon = dir === 'rtl' ? ArrowLeft : ArrowRight
  return <Icon className={cn('h-4 w-4', className)} />
}
