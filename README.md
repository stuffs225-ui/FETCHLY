# FETCHLY

**The World. Delivered.** A premium global procurement platform that sources products from the USA 🇺🇸 and UK 🇬🇧 for businesses and individuals across the Middle East and beyond.

FETCHLY acts as a trusted procurement agent: clients submit a product request, FETCHLY quotes, sources, ships, and delivers — handling everything including customs clearance.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router (BrowserRouter)
- lucide-react icons

All data in this build is mocked/static — there is no backend.

## Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Structure

- `src/pages/public/` — Homepage, How It Works, Submit Request, Track Order, Pricing
- `src/pages/admin/` — Admin panel (Dashboard, Requests, Quotes, Orders, Shipments, Customers, Payments, Settings)
- `src/components/` — Shared UI primitives, layout, and admin components
- `src/lib/mockData.ts` — Mock dataset and pipeline status definitions

## Admin Portal

Visit `/admin` and sign in with the password `fetchly-admin` (hardcoded client-side gate for demo purposes only).
