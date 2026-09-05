import { MessageCircle } from 'lucide-react'
import { useI18n } from '@/i18n'
import { companySettingsStore } from '@/lib/repo'
import { useCollectionVersion } from '@/lib/useCollection'

export function WhatsAppButton() {
  useCollectionVersion()
  const { t } = useI18n()
  const settings = companySettingsStore.get()
  const phone = settings.whatsapp.replace(/[^\d]/g, '')
  const href = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(t.whatsapp.message)}` : undefined

  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={t.whatsapp.label}
      className="fixed bottom-5 end-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_-6px_rgba(37,211,102,0.6)] transition-transform hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" fill="white" />
    </a>
  )
}
