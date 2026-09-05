import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  selectable?: boolean
  selected?: Set<string>
  onSelectChange?: (selected: Set<string>) => void
  pageSize?: number
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  selectable,
  selected,
  onSelectChange,
  pageSize = 8,
}: DataTableProps<T>) {
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
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const allSelected = selectable && pageData.length > 0 && pageData.every((r) => selected?.has(rowKey(r)))

  const toggleAll = () => {
    if (!onSelectChange || !selected) return
    const next = new Set(selected)
    if (allSelected) {
      pageData.forEach((r) => next.delete(rowKey(r)))
    } else {
      pageData.forEach((r) => next.add(rowKey(r)))
    }
    onSelectChange(next)
  }

  const toggleOne = (id: string) => {
    if (!onSelectChange || !selected) return
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectChange(next)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={!!allSelected} onChange={toggleAll} className="h-4 w-4 accent-primary" />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary', col.className)}>
                  {col.sortValue ? (
                    <button className="inline-flex items-center gap-1 hover:text-text" onClick={() => toggleSort(col.key)}>
                      {col.header}
                      <span className="flex flex-col -space-y-1 opacity-70">
                        <ChevronUp className={cn('h-3 w-3', sortKey === col.key && sortDir === 'asc' && 'text-primary')} />
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
            {pageData.map((row) => {
              const id = rowKey(row)
              return (
                <tr
                  key={id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-border last:border-0 transition-colors hover:bg-[#1A1A28]',
                    onRowClick && 'cursor-pointer',
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected?.has(id) ?? false}
                        onChange={() => toggleOne(id)}
                        className="h-4 w-4 accent-primary"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3.5 text-text', col.className)}>
                      {col.render ? col.render(row) : String((row as never)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              )
            })}
            {pageData.length === 0 && (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center text-text-secondary">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-text-secondary">
        <span>
          Showing {pageData.length === 0 ? 0 : page * pageSize + 1}–{Math.min(sorted.length, page * pageSize + pageSize)} of {sorted.length}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border-light disabled:opacity-30 hover:not-disabled:bg-white/5"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="px-2 font-mono">
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border-light disabled:opacity-30 hover:not-disabled:bg-white/5"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
