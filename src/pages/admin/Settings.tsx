import { useState } from 'react'
import { Save } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FieldLabel, Input, Select } from '@/components/ui/Input'

export default function Settings() {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Card className="p-6">
        <h3 className="font-display text-base font-bold text-text">Company Profile</h3>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel>Company Name</FieldLabel>
            <Input defaultValue="FETCHLY Global Procurement" />
          </div>
          <div>
            <FieldLabel>Support Email</FieldLabel>
            <Input defaultValue="hello@fetchly.com" />
          </div>
          <div>
            <FieldLabel>Default Currency</FieldLabel>
            <Select defaultValue="USD">
              <option>USD</option>
              <option>GBP</option>
            </Select>
          </div>
          <div>
            <FieldLabel>Timezone</FieldLabel>
            <Select defaultValue="GST">
              <option>GST (UTC+4)</option>
              <option>AST (UTC+3)</option>
              <option>UTC</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-display text-base font-bold text-text">Fee Tiers</h3>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <FieldLabel>Standard Fee %</FieldLabel>
            <Input type="number" defaultValue={12} />
          </div>
          <div>
            <FieldLabel>Business Fee %</FieldLabel>
            <Input type="number" defaultValue={9} />
          </div>
          <div>
            <FieldLabel>Enterprise Fee %</FieldLabel>
            <Input type="number" defaultValue={6} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-display text-base font-bold text-text">Notifications</h3>
        <div className="mt-4 space-y-3">
          {['New request submitted', 'Quote expiring in 24h', 'Payment received', 'Shipment held at customs'].map((label) => (
            <label key={label} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm">
              <span className="text-text">{label}</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
            </label>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4" /> Save Changes
        </Button>
        {saved && <span className="text-sm text-success">Settings saved.</span>}
      </div>
    </div>
  )
}
