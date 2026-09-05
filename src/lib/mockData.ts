export type RequestStatus =
  | 'draft'
  | 'submitted'
  | 'quoted'
  | 'paid'
  | 'purchased'
  | 'in_transit'
  | 'customs'
  | 'delivered'
  | 'cancelled'

export const PIPELINE_STAGES: { key: RequestStatus; label: string }[] = [
  { key: 'submitted', label: 'Request Submitted' },
  { key: 'quoted', label: 'Quote Sent' },
  { key: 'paid', label: 'Payment Received' },
  { key: 'purchased', label: 'Purchased' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'customs', label: 'Customs Clearance' },
  { key: 'delivered', label: 'Delivered' },
]

export interface ProcurementRequest {
  id: string
  customer: string
  email: string
  company?: string
  accountType: 'Individual' | 'Business'
  product: string
  category: string
  source: 'USA' | 'UK'
  quantity: number
  status: RequestStatus
  date: string
  agent: string
  country: string
  budget: string
  urgency: 'Standard' | 'Express' | 'Urgent'
  notes?: string
}

const names = [
  'Faisal Al-Rashid', 'Layla Haddad', 'Omar Nasser', 'Sara Al-Mansoori', 'Yousef Karam',
  'Nadia Saleh', 'Khalid Otaibi', 'Rania Aziz', 'Tariq Fahd', 'Mona Bishara',
  'Adel Suleiman', 'Huda Qassim', 'Bilal Zaidan', 'Dana Sabbagh', 'Marwan Idris',
]
const companies = ['Al Noor Trading LLC', 'Gulf Summit Group', 'Zenith Holdings', 'Crescent Imports', undefined, 'Pearl Coast Co.', undefined]
const products = [
  'Dell Precision 5680 Workstation', 'Sony A7IV Camera Kit', 'Herman Miller Aeron Chair (x12)',
  'Medical Ultrasound Probe Set', 'Milwaukee M18 Tool Combo', 'Peloton Bike+', 'Industrial 3D Printer Filament (bulk)',
  'Nike Air Force 1 (case of 40)', 'Whey Protein Isolate (bulk)', 'Tesla Wall Connector x6',
  'Bose Professional Speaker System', 'CAT6 Networking Equipment', 'KitchenAid Commercial Mixer x3',
  'Orthopedic Surgical Instruments', 'DJI Mavic 3 Enterprise', 'Vintage Land Rover Parts',
]
const categories = ['Electronics', 'Medical', 'Industrial', 'Automotive', 'Personal Care', 'Food & Supplements', 'Clothing', 'Other']
const agents = ['Sarah Mitchell', 'James Cooper', 'Amira Farouk', 'David Chen', 'Unassigned']
const countries = ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Jordan', 'Egypt', 'Bahrain', 'Oman']
const statuses: RequestStatus[] = ['submitted', 'quoted', 'paid', 'purchased', 'in_transit', 'customs', 'delivered', 'cancelled']

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}
const rand = seededRandom(42)
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

export const requests: ProcurementRequest[] = Array.from({ length: 42 }).map((_, i) => {
  const idx = i + 1
  const status = idx <= 3 ? 'submitted' : pick(statuses)
  const day = 28 - Math.floor(i / 2)
  return {
    id: `REQ-2026-${(10042 + idx).toString()}`,
    customer: pick(names),
    email: `client${idx}@example.com`,
    company: pick(companies),
    accountType: pick(['Individual', 'Business', 'Business']) as 'Individual' | 'Business',
    product: pick(products),
    category: pick(categories),
    source: pick(['USA', 'UK']) as 'USA' | 'UK',
    quantity: Math.max(1, Math.floor(rand() * 20)),
    status,
    date: `2026-0${Math.max(1, 8 - Math.floor(i / 20))}-${String(Math.max(1, day)).padStart(2, '0')}`,
    agent: status === 'submitted' ? 'Unassigned' : pick(agents),
    country: pick(countries),
    budget: `$${(500 + Math.floor(rand() * 15000)).toLocaleString()}`,
    urgency: pick(['Standard', 'Express', 'Urgent']) as 'Standard' | 'Express' | 'Urgent',
    notes: 'Customer requested confirmation of authenticity before purchase.',
  }
})

export interface Quote {
  id: string
  requestId: string
  customer: string
  productCost: number
  serviceFeePct: number
  shipping: number
  customs: number
  total: number
  validUntil: string
  status: 'draft' | 'sent' | 'accepted' | 'expired'
}

export const quotes: Quote[] = requests.slice(0, 18).map((r, i) => {
  const productCost = 400 + Math.floor(rand() * 6000)
  const serviceFeePct = pick([12, 9, 9, 12])
  const shipping = 60 + Math.floor(rand() * 300)
  const customs = 40 + Math.floor(rand() * 200)
  const fee = Math.round(productCost * (serviceFeePct / 100))
  return {
    id: `QT-2026-${(5100 + i).toString()}`,
    requestId: r.id,
    customer: r.customer,
    productCost,
    serviceFeePct,
    shipping,
    customs,
    total: productCost + fee + shipping + customs,
    validUntil: '2026-09-15',
    status: pick(['sent', 'accepted', 'sent', 'expired', 'draft']) as Quote['status'],
  }
})

export interface Order {
  id: string
  requestId: string
  customer: string
  product: string
  total: number
  status: RequestStatus
  paymentStatus: 'pending' | 'paid' | 'partial'
  date: string
}

export const orders: Order[] = requests
  .filter((r) => ['paid', 'purchased', 'in_transit', 'customs', 'delivered'].includes(r.status))
  .map((r, i) => ({
    id: `ORD-2026-${(3200 + i).toString()}`,
    requestId: r.id,
    customer: r.customer,
    product: r.product,
    total: 500 + Math.floor(rand() * 8000),
    status: r.status,
    paymentStatus: pick(['paid', 'paid', 'partial']) as Order['paymentStatus'],
    date: r.date,
  }))

export interface Shipment {
  id: string
  orderId: string
  tracking: string
  carrier: string
  customsStatus: 'pending' | 'cleared' | 'held'
  eta: string
  status: RequestStatus
}

export const shipments: Shipment[] = orders
  .filter((o) => ['in_transit', 'customs', 'delivered'].includes(o.status))
  .map((o, i) => ({
    id: `SHP-2026-${(9000 + i).toString()}`,
    orderId: o.id,
    tracking: `1Z${(999000000 + i * 137).toString()}`,
    carrier: pick(['DHL Express', 'FedEx International', 'UPS Worldwide']),
    customsStatus: pick(['pending', 'cleared', 'cleared', 'held']) as Shipment['customsStatus'],
    eta: '2026-09-20',
    status: o.status,
  }))

export interface Customer {
  id: string
  name: string
  email: string
  type: 'Individual' | 'Corporate'
  country: string
  requestsCount: number
  ordersCount: number
  totalSpend: number
  joined: string
}

export const customers: Customer[] = Array.from(new Set(requests.map((r) => r.customer))).map((name, i) => {
  const custRequests = requests.filter((r) => r.customer === name)
  return {
    id: `CUS-${(1000 + i).toString()}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
    type: custRequests[0]?.accountType === 'Business' ? 'Corporate' : 'Individual',
    country: custRequests[0]?.country ?? 'UAE',
    requestsCount: custRequests.length,
    ordersCount: orders.filter((o) => o.customer === name).length,
    totalSpend: orders.filter((o) => o.customer === name).reduce((s, o) => s + o.total, 0),
    joined: '2025-11-02',
  }
})

export interface Payment {
  id: string
  orderId: string
  customer: string
  amount: number
  method: 'Wire Transfer' | 'Credit Card' | 'PayPal' | 'NET30 Invoice'
  status: 'pending' | 'confirmed'
  date: string
}

export const payments: Payment[] = orders.map((o, i) => ({
  id: `PAY-2026-${(7000 + i).toString()}`,
  orderId: o.id,
  customer: o.customer,
  amount: o.total,
  method: pick(['Wire Transfer', 'Credit Card', 'PayPal', 'NET30 Invoice']) as Payment['method'],
  status: o.paymentStatus === 'paid' ? 'confirmed' : 'pending',
  date: o.date,
}))

export const testimonials = [
  {
    quote: "FETCHLY sourced medical equipment for our clinic that no local supplier could get. Customs clearance was seamless — we didn't lift a finger.",
    name: 'Dr. Amina Khalil',
    role: 'Operations Director',
    company: 'Riyadh Medical Group',
    country: '🇸🇦 Saudi Arabia',
  },
  {
    quote: 'We use FETCHLY for all our corporate tech procurement now. NET30 terms and a dedicated agent made scaling our office setup effortless.',
    name: 'Karim El-Sayed',
    role: 'Head of Operations',
    company: 'Zenith Holdings',
    country: '🇦🇪 UAE',
  },
  {
    quote: "Transparent pricing, real tracking, zero surprises. I've ordered everything from camera gear to furniture through them.",
    name: 'Noura Al-Fahad',
    role: 'Founder',
    company: 'Studio Noura',
    country: '🇶🇦 Qatar',
  },
]

export const countriesServed = [
  { flag: '🇸🇦', name: 'Saudi Arabia' },
  { flag: '🇦🇪', name: 'UAE' },
  { flag: '🇶🇦', name: 'Qatar' },
  { flag: '🇰🇼', name: 'Kuwait' },
  { flag: '🇯🇴', name: 'Jordan' },
  { flag: '🇪🇬', name: 'Egypt' },
  { flag: '🇧🇭', name: 'Bahrain' },
  { flag: '🇴🇲', name: 'Oman' },
  { flag: '🇱🇧', name: 'Lebanon' },
  { flag: '🇮🇶', name: 'Iraq' },
  { flag: '🇲🇦', name: 'Morocco' },
  { flag: '🇹🇳', name: 'Tunisia' },
]
