# Global Sourcing Platform (مصدر توريد عالمي)

A Saudi-based global sourcing / procurement request platform. Customers submit a
sourcing request (a photo, a link, a part number, or just a description) with no
account or registration; the internal team reviews it, sources the product
globally, and sends a quotation back by email. There is no public catalog, no
shopping cart, and no online payment — the website's job is to make submitting
a request effortless and to build enough trust that a procurement manager feels
comfortable doing so.

Arabic (RTL) is the default and primary experience; English (LTR) is a complete
alternate version via the header language switch.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router (BrowserRouter)
- react-three-fiber / three.js — the hero's 3D sourcing globe (lazy-loaded,
  with a lightweight SVG fallback on small/low-power screens)
- jsPDF + html2canvas — quotation PDF generation (the DOM is rasterized rather
  than drawn with jsPDF's own text API, which has no Arabic shaping)
- lucide-react icons

## Data & integrations — what's real vs. simulated

No backend, database, file storage, or email provider is provisioned in this
environment. To make this **something you can actually click through end to
end** rather than a static mockup, the app ships a client-side persistence
layer that behaves like a real backend and is shaped so swapping it for one is
a contained change:

- **"Database"**: `src/lib/storage.ts` + `src/lib/repo.ts` — typed repositories
  (`requestsRepo`, `quotationsRepo`, `credentialsRepo`, …) backed by
  `localStorage`, with the same get/list/upsert/remove shape a real REST/SQL
  API would expose.
- **File uploads**: `src/lib/attachments.ts` — request attachments (images,
  PDFs, datasheets) are stored as blobs in IndexedDB (localStorage's ~5MB quota
  can't hold real files) and referenced by id.
- **Email**: `src/lib/emailService.ts` — no SMTP/Resend/SendGrid credentials
  exist here, so `sendEmail()` renders the subject/body/attachment name and
  records it in an **Email Log** (visible at Admin → Email Settings) instead of
  actually delivering it. Every call site already awaits a promise and checks
  the result, so wiring a real provider is a one-file change.
- **Admin auth**: `src/lib/adminAuth.ts` — a client-side password gate (see
  `.env.example`) with the session flag in `sessionStorage`. This is a
  dev-tier stand-in; replace with real server-side session/JWT auth before any
  real deployment.

None of this is presented to the end user as fake — company registration
numbers, VAT numbers, etc. are shown as literal `[BRACKET_PLACEHOLDER]` tokens
until entered in Admin → Company Settings, and credential cards show "قيد
الإعداد" (pending configuration) rather than invented numbers.

## Getting started

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

Copy `.env.example` to `.env.local` and set `VITE_ADMIN_PASSWORD` before
deploying (default: `admin@2026`).

## Structure

- `src/i18n/` — `ar.ts` (default) / `en.ts` dictionaries + the locale/RTL
  context (`useI18n()`)
- `src/pages/public/` — Home, How It Works, What We Source, About, Trust &
  Compliance, FAQ, Contact, Request a Quote
- `src/pages/legal/` — Privacy, Terms, Cookies, Complaints, Disclaimer
  (`/legal/:slug`)
- `src/pages/admin/` — Dashboard, Requests, Quotations (+ the quotation
  builder/PDF/revisions), Saved Products, Cases, FAQs, Trust credentials,
  Website Content, Company Settings, Email Settings, Users
- `src/components/three/` — the hero globe (`GlobeStage` picks the WebGL
  version or the SVG fallback) and its error boundary
- `src/lib/` — the persistence layer, PDF generation, email service, types

## Admin

Visit `/admin` and sign in with the password from `VITE_ADMIN_PASSWORD`
(`admin@2026` by default). From there:

- **Requests** — review submitted requests, see attachments, set status,
  assign an agent, leave internal notes, jump to "Create Quotation".
- **Quotations** — line items with automatic quantity × unit price → subtotal
  → VAT (configurable, defaults to 15%) → grand total math; currency
  (SAR/USD/GBP/EUR); bilingual quotation language independent of the site's
  language; saved products/terms for faster reuse; generate/preview/download a
  branded A4 PDF; send it to the customer (updates the request status and
  writes to the audit log); create numbered revisions (`QT-2026-0001-R1`, …)
  without losing history.
- **Company Settings** — logo upload, CR/VAT/Zakat/National Address/Balady
  fields, contact details, default VAT rate & currency.
- **Trust & Compliance, Cases, FAQs** — the content shown on the matching
  public pages; anything left unconfigured shows a "pending" state instead of
  a fabricated value.

## Known simplifications (documented, not hidden)

- No SSR — this is a client-rendered SPA, so `document.title` is set
  per-route (`usePageTitle`) but full per-locale `hreflang` alternate URLs
  would need locale-prefixed routing, which wasn't introduced.
- The "database" and "email" layers are the local stand-ins described above;
  productionizing this means swapping those two modules for a real backend and
  a real transactional email provider, not rearchitecting the UI.
