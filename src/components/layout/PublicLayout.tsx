import { Outlet } from 'react-router-dom'
import PublicHeader from './PublicHeader'
import PublicFooter from './PublicFooter'
import { WhatsAppButton } from './WhatsAppButton'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
      <WhatsAppButton />
    </div>
  )
}
