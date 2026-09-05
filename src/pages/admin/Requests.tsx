import { useMemo, useState } from 'react'
import { Search, UserCog, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { requests as initialRequests, type ProcurementRequest, type RequestStatus } from '@/lib/mockData'
import { formatDate } from '@/lib/utils'
import { RequestDetailDrawer } from './requests/RequestDetailDrawer'

const statusOptions: RequestStatus[] = ['submitted', 'quoted', 'paid', 'purchased', 'in_transit', 'customs', 'delivered', 'cancelled']
const agentOptions = ['Sarah Mitchell', 'James Cooper', 'Amira Farouk', 'David Chen', 'Unassigned']

export default function Requests() {
  const [data, setData] = useState<ProcurementRequest[]>(initialRequests)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [agentFilter, setAgentFilter] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [active, setActive] = useState<ProcurementRequest | null>(null)
  const [bulkAgent, setBulkAgent] = useState(agentOptions[0])
  const [bulkStatus, setBulkStatus] = useState(statusOptions[0])

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (sourceFilter !== 'all' && r.source !== sourceFilter) return false
      if (agentFilter !== 'all' && r.agent !== agentFilter) return false
      if (search && !`${r.id} ${r.customer} ${r.product}`.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [data, search, statusFilter, sourceFilter, agentFilter])

  const updateStatus = (id: string, status: RequestStatus) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    setActive((prev) => (prev && prev.id === id ? { ...prev, status } : prev))
  }

  const applyBulkAgent = () => {
    if (selected.size === 0) return
    setData((prev) => prev.map((r) => (selected.has(r.id) ? { ...r, agent: bulkAgent } : r)))
    setSelected(new Set())
  }

  const applyBulkStatus = () => {
    if (selected.size === 0) return
    setData((prev) => prev.map((r) => (selected.has(r.id) ? { ...r, status: bulkStatus } : r)))
    setSelected(new Set())
  }

  const columns: Column<ProcurementRequest>[] = [
    { key: 'id', header: 'Request #', render: (r) => <span className="font-mono text-xs">{r.id}</span>, sortValue: (r) => r.id },
    { key: 'customer', header: 'Customer', sortValue: (r) => r.customer },
    { key: 'product', header: 'Product', className: 'max-w-[200px] truncate' },
    { key: 'source', header: 'Source', render: (r) => (r.source === 'USA' ? '🇺🇸 USA' : '🇬🇧 UK') },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} />, sortValue: (r) => r.status },
    { key: 'date', header: 'Date', render: (r) => formatDate(r.date), sortValue: (r) => r.date },
    { key: 'agent', header: 'Agent' },
  ]

  return (
    <div className="space-y-5">
      <Card className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search requests..." className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-[160px]">
            <option value="all">All Statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </Select>
          <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="max-w-[140px]">
            <option value="all">All Sources</option>
            <option value="USA">🇺🇸 USA</option>
            <option value="UK">🇬🇧 UK</option>
          </Select>
          <Select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} className="max-w-[170px]">
            <option value="all">All Agents</option>
            {agentOptions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Select>
        </div>
      </Card>

      {selected.size > 0 && (
        <Card className="flex flex-wrap items-center gap-3 border-primary/40 bg-primary-glow p-4">
          <span className="text-sm font-semibold text-text">{selected.size} selected</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Select value={bulkAgent} onChange={(e) => setBulkAgent(e.target.value)} className="max-w-[170px]">
              {agentOptions.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </Select>
            <Button size="sm" variant="secondary" onClick={applyBulkAgent}>
              <UserCog className="h-3.5 w-3.5" /> Assign Agent
            </Button>
            <Select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as RequestStatus)} className="max-w-[160px]">
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </Select>
            <Button size="sm" variant="secondary" onClick={applyBulkStatus}>
              <RefreshCw className="h-3.5 w-3.5" /> Update Status
            </Button>
          </div>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(r) => r.id}
        onRowClick={(r) => setActive(r)}
        selectable
        selected={selected}
        onSelectChange={setSelected}
        pageSize={10}
      />

      <RequestDetailDrawer request={active} onClose={() => setActive(null)} onUpdateStatus={updateStatus} />
    </div>
  )
}
