import { forwardRef } from 'react'
import type { Quotation, CompanySettings } from '@/lib/types'
import { formatDate } from '@/lib/utils'

const L = {
  ar: {
    dir: 'rtl' as const,
    title: 'عرض سعر',
    quotationNumber: 'رقم العرض',
    date: 'التاريخ',
    validUntil: 'صالح حتى',
    preparedFor: 'مُعد لـ',
    company: 'الشركة',
    email: 'البريد الإلكتروني',
    phone: 'الجوال',
    city: 'المدينة',
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
    dir: 'ltr' as const,
    title: 'QUOTATION',
    quotationNumber: 'Quotation Number',
    date: 'Date',
    validUntil: 'Valid Until',
    preparedFor: 'Prepared For',
    company: 'Company',
    email: 'Email',
    phone: 'Phone',
    city: 'City',
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

const currencySymbols: Record<Quotation['currency'], string> = { SAR: 'SAR', USD: '$', GBP: '£', EUR: '€' }

function money(value: number, currency: Quotation['currency']) {
  return `${currencySymbols[currency]} ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const QuotationPrintTemplate = forwardRef<HTMLDivElement, { quotation: Quotation; company: CompanySettings }>(
  ({ quotation, company }, ref) => {
    const t = L[quotation.language]
    const subtotal = quotation.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
    const vat = quotation.vatEnabled ? subtotal * (quotation.vatRate / 100) : 0
    const grandTotal = subtotal + vat
    const companyName = quotation.language === 'ar' ? company.companyNameAr : company.companyNameEn

    return (
      <div
        ref={ref}
        dir={t.dir}
        style={{
          width: '794px',
          minHeight: '1123px',
          background: '#ffffff',
          color: '#1a1d24',
          fontFamily: quotation.language === 'ar' ? "'Cairo', sans-serif" : "'Inter', sans-serif",
          padding: '48px',
          boxSizing: 'border-box',
          fontSize: '14px',
          lineHeight: 1.6,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #c9a227', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {company.logoDataUrl ? (
              <img src={company.logoDataUrl} alt={companyName} style={{ height: '48px', objectFit: 'contain' }} />
            ) : (
              <div style={{ height: '48px', width: '48px', borderRadius: '10px', background: '#1b2a4a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9a227', fontWeight: 800, fontSize: '20px' }}>
                {companyName.replace('[', '').charAt(0)}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 800, fontSize: '18px' }}>{companyName}</div>
              <div style={{ fontSize: '11px', color: '#5b6270' }}>{company.websiteDomain}</div>
            </div>
          </div>
          <div style={{ textAlign: quotation.language === 'ar' ? 'left' : 'right' }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1b2a4a' }}>{t.title}</div>
            <div style={{ fontSize: '12px', color: '#5b6270', marginTop: '4px' }}>{quotation.quotationNumber}</div>
          </div>
        </div>

        {/* Meta + customer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', gap: '24px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3b5', textTransform: 'uppercase', marginBottom: '6px' }}>{t.preparedFor}</div>
            <div style={{ fontWeight: 700 }}>{quotation.customerName}</div>
            {quotation.customerCompany && <div>{quotation.customerCompany}</div>}
            <div style={{ fontSize: '12px', color: '#5b6270' }}>{quotation.customerEmail}</div>
            <div style={{ fontSize: '12px', color: '#5b6270' }}>{quotation.customerPhone}</div>
            <div style={{ fontSize: '12px', color: '#5b6270' }}>{quotation.customerCity}</div>
          </div>
          <div style={{ flex: 1, textAlign: quotation.language === 'ar' ? 'left' : 'right' }}>
            <table style={{ marginInlineStart: 'auto', fontSize: '12px' }}>
              <tbody>
                <tr>
                  <td style={{ color: '#5b6270', paddingInlineEnd: '12px' }}>{t.date}</td>
                  <td style={{ fontWeight: 700 }}>{formatDate(quotation.createdAt, quotation.language)}</td>
                </tr>
                <tr>
                  <td style={{ color: '#5b6270', paddingInlineEnd: '12px' }}>{t.validUntil}</td>
                  <td style={{ fontWeight: 700 }}>{formatDate(quotation.validUntilDate, quotation.language)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Items */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '28px', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#1b2a4a', color: '#ffffff' }}>
              <th style={{ padding: '10px 12px', textAlign: 'start' }}>{t.item}</th>
              <th style={{ padding: '10px 12px', textAlign: 'start' }}>{t.description}</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>{t.quantity}</th>
              <th style={{ padding: '10px 12px', textAlign: 'end' }}>{t.unitPrice}</th>
              <th style={{ padding: '10px 12px', textAlign: 'end' }}>{t.total}</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items.map((item, i) => (
              <tr key={item.id} style={{ background: i % 2 === 0 ? '#ffffff' : '#f7f5f0', borderBottom: '1px solid #e7e2d6' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{item.name}</td>
                <td style={{ padding: '10px 12px', color: '#5b6270' }}>{item.description}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '10px 12px', textAlign: 'end' }}>{money(item.unitPrice, quotation.currency)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'end', fontWeight: 700 }}>{money(item.quantity * item.unitPrice, quotation.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <table style={{ minWidth: '280px', fontSize: '13px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 12px', color: '#5b6270' }}>{t.subtotal}</td>
                <td style={{ padding: '4px 12px', textAlign: 'end', fontWeight: 600 }}>{money(subtotal, quotation.currency)}</td>
              </tr>
              {quotation.vatEnabled && (
                <tr>
                  <td style={{ padding: '4px 12px', color: '#5b6270' }}>{t.vat} ({quotation.vatRate}%)</td>
                  <td style={{ padding: '4px 12px', textAlign: 'end', fontWeight: 600 }}>{money(vat, quotation.currency)}</td>
                </tr>
              )}
              <tr style={{ borderTop: '2px solid #1b2a4a' }}>
                <td style={{ padding: '8px 12px', fontWeight: 800, fontSize: '15px' }}>{t.grandTotal}</td>
                <td style={{ padding: '8px 12px', textAlign: 'end', fontWeight: 800, fontSize: '15px', color: '#1b2a4a' }}>{money(grandTotal, quotation.currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Commercial terms */}
        <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12px' }}>
          {quotation.leadTime && (
            <div><div style={{ color: '#9ca3b5', fontWeight: 700 }}>{t.leadTime}</div><div>{quotation.leadTime}</div></div>
          )}
          {quotation.paymentTerms && (
            <div><div style={{ color: '#9ca3b5', fontWeight: 700 }}>{t.paymentTerms}</div><div>{quotation.paymentTerms}</div></div>
          )}
          {quotation.deliveryLocation && (
            <div><div style={{ color: '#9ca3b5', fontWeight: 700 }}>{t.delivery}</div><div>{quotation.deliveryLocation}</div></div>
          )}
          {quotation.warranty && (
            <div><div style={{ color: '#9ca3b5', fontWeight: 700 }}>{t.warranty}</div><div>{quotation.warranty}</div></div>
          )}
        </div>

        {quotation.notes && (
          <div style={{ marginTop: '16px', fontSize: '12px' }}>
            <div style={{ color: '#9ca3b5', fontWeight: 700 }}>{t.notes}</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{quotation.notes}</div>
          </div>
        )}

        {quotation.termsAndConditions && (
          <div style={{ marginTop: '16px', fontSize: '11px', color: '#5b6270' }}>
            <div style={{ color: '#9ca3b5', fontWeight: 700 }}>{t.terms}</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{quotation.termsAndConditions}</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '40px', paddingTop: '16px', borderTop: '1px solid #e7e2d6', fontSize: '10px', color: '#9ca3b5', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span>{companyName}</span>
          <span>CR: {company.crNumber}</span>
          <span>VAT: {company.vatNumber}</span>
          <span>{company.businessEmail}</span>
          <span>{company.phone}</span>
          <span>{company.websiteDomain}</span>
        </div>
      </div>
    )
  },
)
QuotationPrintTemplate.displayName = 'QuotationPrintTemplate'
