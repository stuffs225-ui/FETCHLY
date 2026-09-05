import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type CurrencyCode = 'SAR' | 'USD' | 'GBP' | 'EUR'

const currencySymbols: Record<CurrencyCode, string> = {
  SAR: 'ر.س',
  USD: '$',
  GBP: '£',
  EUR: '€',
}

export function formatMoney(value: number, currency: CurrencyCode = 'SAR', locale: 'ar' | 'en' = 'ar') {
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
  return locale === 'ar' ? `${formatted} ${currencySymbols[currency]}` : `${currencySymbols[currency]} ${formatted}`
}

export function formatDate(date: string | number | Date, locale: 'ar' | 'en' = 'ar') {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | number | Date, locale: 'ar' | 'en' = 'ar') {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function uid(prefix = ''): string {
  const rand = Math.random().toString(36).slice(2, 9)
  return prefix ? `${prefix}_${Date.now().toString(36)}${rand}` : `${Date.now().toString(36)}${rand}`
}
