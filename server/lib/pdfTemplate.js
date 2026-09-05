import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Static (non-variable) font instances: headless Chromium's PDF exporter
// falls back to per-glyph Type3 (bitmap-like, unselectable) fonts for
// variable fonts, so the original Google Fonts variable woff2 was
// instantiated at fixed weights 400/700 with fonttools ahead of time —
// this lets Chromium embed a real, selectable Type0 font in the PDF.
const fontsDir = path.join(__dirname, '../assets/fonts')
const cairoArabic400 = fs.readFileSync(path.join(fontsDir, 'cairo-arabic-400.ttf')).toString('base64')
const cairoArabic700 = fs.readFileSync(path.join(fontsDir, 'cairo-arabic-700.ttf')).toString('base64')
const cairoLatin400 = fs.readFileSync(path.join(fontsDir, 'cairo-latin-400.ttf')).toString('base64')
const cairoLatin700 = fs.readFileSync(path.join(fontsDir, 'cairo-latin-700.ttf')).toString('base64')

const L = {
  ar: {
    dir: 'rtl',
    title: 'عرض سعر',
    validUntil: 'صالح حتى',
    preparedFor: 'مُعد لـ',
    date: 'التاريخ',
    item: 'البند',
    description: 'الوصف',
    quantity: 'الكمية',
    unitPrice: 'سعر الوحدة',
    total: 'الإجمالي',
    subtotal: 'الإجمالي الفرعي',
    vat: 'ضريبة القيمة المضافة',
    grandTotal: 'الإجمالي الكلي',
    leadTime: 'مدة التوريد',
    paymentTerms: 'شروط الدفع',
    delivery: 'موقع التسليم',
    warranty: 'الضمان',
    notes: 'ملاحظات',
    terms: 'الشروط والأحكام',
  },
  en: {
    dir: 'ltr',
    title: 'QUOTATION',
    validUntil: 'Valid Until',
    preparedFor: 'Prepared For',
    date: 'Date',
    item: 'Item',
    description: 'Description',
    quantity: 'Qty',
    unitPrice: 'Unit Price',
    total: 'Total',
    subtotal: 'Subtotal',
    vat: 'VAT',
    grandTotal: 'Grand Total',
    leadTime: 'Lead Time',
    paymentTerms: 'Payment Terms',
    delivery: 'Delivery Location',
    warranty: 'Warranty',
    notes: 'Notes',
    terms: 'Terms & Conditions',
  },
}

const currencySymbols = { SAR: 'SAR', USD: '$', GBP: '£', EUR: '€' }

function money(value, currency) {
  return `${currencySymbols[currency] ?? currency} ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Wraps values with no strong directional letters (phone numbers, plain
// digit runs) in an explicit LTR span — otherwise the bidi algorithm can
// reorder a leading "+" to the end inside a surrounding RTL paragraph.
function ltr(value) {
  return `<span dir="ltr" style="unicode-bidi:isolate;">${esc(value)}</span>`
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

function formatDate(iso, lang) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * Builds a fully self-contained HTML document (fonts embedded as base64 data
 * URIs) for the quotation, ready to be handed to Playwright's page.pdf().
 * No network fetch happens at render time, so output is identical whether
 * or not the server has internet access at the moment of generation.
 */
export function renderQuotationHtml(quotation, company) {
  const t = L[quotation.language] ?? L.ar
  const items = quotation.items ?? []
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const vat = quotation.vatEnabled ? subtotal * (quotation.vatRate / 100) : 0
  const grandTotal = subtotal + vat
  const companyName = quotation.language === 'ar' ? company.companyNameAr : company.companyNameEn
  const align = quotation.language === 'ar' ? 'left' : 'right'

  const rows = items
    .map(
      (item, i) => `
      <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f7f5f0'};border-bottom:1px solid #e7e2d6;">
        <td style="padding:10px 12px;font-weight:600;">${esc(item.name)}</td>
        <td style="padding:10px 12px;color:#5b6270;">${esc(item.description)}</td>
        <td style="padding:10px 12px;text-align:center;">${esc(item.quantity)}</td>
        <td style="padding:10px 12px;text-align:end;">${esc(money(item.unitPrice, quotation.currency))}</td>
        <td style="padding:10px 12px;text-align:end;font-weight:700;">${esc(money(item.quantity * item.unitPrice, quotation.currency))}</td>
      </tr>`
    )
    .join('')

  const commercialTerms = [
    quotation.leadTime && [t.leadTime, quotation.leadTime],
    quotation.paymentTerms && [t.paymentTerms, quotation.paymentTerms],
    quotation.deliveryLocation && [t.delivery, quotation.deliveryLocation],
    quotation.warranty && [t.warranty, quotation.warranty],
  ].filter(Boolean)

  return `<!doctype html>
<html dir="${t.dir}" lang="${quotation.language}">
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: 'Cairo';
    font-weight: 400;
    unicode-range: U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFC, U+200C-200E;
    src: url(data:font/ttf;base64,${cairoArabic400}) format('truetype');
  }
  @font-face {
    font-family: 'Cairo';
    font-weight: 600 800;
    unicode-range: U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFC, U+200C-200E;
    src: url(data:font/ttf;base64,${cairoArabic700}) format('truetype');
  }
  @font-face {
    font-family: 'Cairo';
    font-weight: 400;
    unicode-range: U+0000-00FF, U+2000-206F, U+20AC;
    src: url(data:font/ttf;base64,${cairoLatin400}) format('truetype');
  }
  @font-face {
    font-family: 'Cairo';
    font-weight: 600 800;
    unicode-range: U+0000-00FF, U+2000-206F, U+20AC;
    src: url(data:font/ttf;base64,${cairoLatin700}) format('truetype');
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 48px;
    font-family: 'Cairo', sans-serif;
    color: #1a1d24;
    font-size: 14px;
    line-height: 1.6;
  }
  table { border-collapse: collapse; }
</style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0e4a78;padding-bottom:20px;">
    <div style="display:flex;align-items:center;gap:12px;">
      ${
        company.logoDataUrl
          ? `<img src="${esc(company.logoDataUrl)}" alt="" style="height:48px;object-fit:contain;" />`
          : `<div style="height:48px;width:48px;border-radius:10px;background:#1b2a4a;display:flex;align-items:center;justify-content:center;color:#0e4a78;font-weight:800;font-size:20px;">${esc(companyName.charAt(0))}</div>`
      }
      <div>
        <div style="font-weight:800;font-size:18px;">${esc(companyName)}</div>
        <div style="font-size:11px;color:#5b6270;">${ltr(company.websiteDomain)}</div>
      </div>
    </div>
    <div style="text-align:${align};">
      <div style="font-size:22px;font-weight:800;color:#1b2a4a;">${esc(t.title)}</div>
      <div style="font-size:12px;color:#5b6270;margin-top:4px;">${esc(quotation.quotationNumber)}</div>
    </div>
  </div>

  <div style="display:flex;justify-content:space-between;margin-top:24px;gap:24px;">
    <div style="flex:1;">
      <div style="font-size:11px;font-weight:700;color:#9ca3b5;text-transform:uppercase;margin-bottom:6px;">${esc(t.preparedFor)}</div>
      <div style="font-weight:700;">${esc(quotation.customerName)}</div>
      ${quotation.customerCompany ? `<div>${esc(quotation.customerCompany)}</div>` : ''}
      <div style="font-size:12px;color:#5b6270;">${ltr(quotation.customerEmail)}</div>
      <div style="font-size:12px;color:#5b6270;">${ltr(quotation.customerPhone)}</div>
      ${quotation.customerCity ? `<div style="font-size:12px;color:#5b6270;">${esc(quotation.customerCity)}</div>` : ''}
    </div>
    <div style="flex:1;text-align:${align};">
      <table style="margin-inline-start:auto;font-size:12px;">
        <tbody>
          <tr><td style="color:#5b6270;padding-inline-end:12px;">${esc(t.date)}</td><td style="font-weight:700;">${esc(formatDate(quotation.createdAt, quotation.language))}</td></tr>
          <tr><td style="color:#5b6270;padding-inline-end:12px;">${esc(t.validUntil)}</td><td style="font-weight:700;">${esc(formatDate(quotation.validUntilDate, quotation.language))}</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <table style="width:100%;margin-top:28px;font-size:13px;">
    <thead>
      <tr style="background:#1b2a4a;color:#ffffff;">
        <th style="padding:10px 12px;text-align:start;">${esc(t.item)}</th>
        <th style="padding:10px 12px;text-align:start;">${esc(t.description)}</th>
        <th style="padding:10px 12px;text-align:center;">${esc(t.quantity)}</th>
        <th style="padding:10px 12px;text-align:end;">${esc(t.unitPrice)}</th>
        <th style="padding:10px 12px;text-align:end;">${esc(t.total)}</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div style="display:flex;justify-content:flex-end;margin-top:16px;">
    <table style="min-width:280px;font-size:13px;">
      <tbody>
        <tr><td style="padding:4px 12px;color:#5b6270;">${esc(t.subtotal)}</td><td style="padding:4px 12px;text-align:end;font-weight:600;">${esc(money(subtotal, quotation.currency))}</td></tr>
        ${
          quotation.vatEnabled
            ? `<tr><td style="padding:4px 12px;color:#5b6270;">${esc(t.vat)} (${esc(quotation.vatRate)}%)</td><td style="padding:4px 12px;text-align:end;font-weight:600;">${esc(money(vat, quotation.currency))}</td></tr>`
            : ''
        }
        <tr style="border-top:2px solid #1b2a4a;"><td style="padding:8px 12px;font-weight:800;font-size:15px;">${esc(t.grandTotal)}</td><td style="padding:8px 12px;text-align:end;font-weight:800;font-size:15px;color:#1b2a4a;">${esc(money(grandTotal, quotation.currency))}</td></tr>
      </tbody>
    </table>
  </div>

  ${
    commercialTerms.length > 0
      ? `<div style="margin-top:28px;display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:12px;">
    ${commercialTerms.map(([label, value]) => `<div><div style="color:#9ca3b5;font-weight:700;">${esc(label)}</div><div>${esc(value)}</div></div>`).join('')}
  </div>`
      : ''
  }

  ${
    quotation.notes
      ? `<div style="margin-top:16px;font-size:12px;"><div style="color:#9ca3b5;font-weight:700;">${esc(t.notes)}</div><div style="white-space:pre-wrap;">${esc(quotation.notes)}</div></div>`
      : ''
  }

  ${
    quotation.termsAndConditions
      ? `<div style="margin-top:16px;font-size:11px;color:#5b6270;"><div style="color:#9ca3b5;font-weight:700;">${esc(t.terms)}</div><div style="white-space:pre-wrap;">${esc(quotation.termsAndConditions)}</div></div>`
      : ''
  }

  <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e7e2d6;font-size:10px;color:#9ca3b5;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;">
    <span>${esc(companyName)}</span>
    ${company.crNumber ? `<span>CR: ${ltr(company.crNumber)}</span>` : ''}
    ${company.vatNumber ? `<span>VAT: ${ltr(company.vatNumber)}</span>` : ''}
    ${company.businessEmail ? `<span>${ltr(company.businessEmail)}</span>` : ''}
    ${company.phone ? `<span>${ltr(company.phone)}</span>` : ''}
    ${company.websiteDomain ? `<span>${ltr(company.websiteDomain)}</span>` : ''}
  </div>
</body>
</html>`
}
