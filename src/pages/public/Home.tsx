import { usePageTitle } from '@/lib/usePageTitle'
import Hero from './home/Hero'
import TrustStrip from './home/TrustStrip'
import SendAnyway from './home/SendAnyway'
import HowItWorksHome from './home/HowItWorksHome'
import GlobalSourcing from './home/GlobalSourcing'
import WhatWeSourceHome from './home/WhatWeSourceHome'
import HardToFind from './home/HardToFind'
import WhyUs from './home/WhyUs'
import CasesSection from './home/CasesSection'
import TrustCta from './home/TrustCta'
import RequestSection from './home/RequestSection'

export default function Home() {
  usePageTitle(
    'مصدر توريد عالمي للسعودية | ما لقيته محليًا، نوفره من أي مكان في العالم',
    'Global Sourcing for Saudi Arabia | Whatever You Need, Wherever It Is',
  )
  return (
    <>
      <Hero />
      <TrustStrip />
      <SendAnyway />
      <HowItWorksHome />
      <GlobalSourcing />
      <WhatWeSourceHome />
      <HardToFind />
      <WhyUs />
      <CasesSection />
      <TrustCta />
      <RequestSection />
    </>
  )
}
