import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DirArrow } from './DirArrow'
import { useI18n } from '@/i18n'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  pageSize?: number
  emptyLabel?: string
}

export function DataTable<T>({ columns, data, rowKey, onRowClick, pageSize = 10, emptyLabel = 'لا توجد بيانات' }: DataTableProps<T>) {
  const { dir } = useI18n()
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    if (!sortKey) return data
    const col = columns.find((c) => c.key === sortKey)
    if (!col?.sortValue) return data
    const copy = [...data]
    copy.sort((a, b) => {
      const av = col.sortValue!(a)
      const bv = col.sortValue!(b)
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return copy
  }, [data, sortKey, sortDir, columns])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageData = sorted.slice(page * pageSize, page * pageSize + pageSize)

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const PrevIcon = dir === 'rtl' ? ChevronUp : ChevronUp

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-start text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              {columns.map((col) => (
                <th key={col.key} className={cn('px-4 py-3 text-start text-xs font-semibold text-text-muted', col.className)}>
                  {col.sortValue ? (
                    <button className="inline-flex items-center gap-1 hover:text-text" onClick={() => toggleSort(col.key)}>
                      {col.header}
                      <span className="flex flex-col -space-y-1 opacity-70">
                        <PrevIcon className={cn('h-3 w-3', sortKey === col.key && sortDir === 'asc' && 'text-primary')} />
                        <ChevronDown className={cn('h-3 w-3', sortKey === col.key && sortDir === 'desc' && 'text-primary')} />
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={cn('border-b border-border last:border-0 transition-colors hover:bg-black/[0.02]', onRowClick && 'cursor-pointer')}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3.5 text-text', col.className)}>
                    {col.render ? col.render(row) : String((row as never)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
            {pageData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-text-muted">
                  {emptyLabel}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-text-muted">
        <span>
          {pageData.length === 0 ? 0 : page * pageSize + 1}–{Math.min(sorted.length, page * pageSize + pageSize)} من {sorted.length}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border-light disabled:opacity-30 hover:not-disabled:bg-black/5"
          >
            <DirArrow className="h-3.5 w-3.5 rotate-180" />
          </button>
          <span className="px-2 font-mono">{page + 1} / {totalPages}</span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border-light disabled:opacity-30 hover:not-disabled:bg-black/5"
          >
            <DirArrow className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
