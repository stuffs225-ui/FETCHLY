import { usePageTitle } from '@/lib/usePageTitle'
import Hero from './home/Hero'
import TrustSection from './home/TrustSection'
import SendAnyway from './home/SendAnyway'
import WhatWeSourceHome from './home/WhatWeSourceHome'
import HowItWorksHome from './home/HowItWorksHome'
import WhyUs from './home/WhyUs'
import CasesSection from './home/CasesSection'
import RequestSection from './home/RequestSection'

export default function Home() {
  usePageTitle(
    'مصدر توريد عالمي للسعودية | ما لقيته محليًا؟ نوفره لك',
    'Global Sourcing for Saudi Arabia | Can\'t Find It Locally? We\'ll Get It For You',
  )
  return (
    <>
      <Hero />
      <TrustSection />
      <SendAnyway />
      <WhatWeSourceHome />
      <HowItWorksHome />
      <WhyUs />
      <CasesSection />
      <RequestSection />
    </>
  )
}
