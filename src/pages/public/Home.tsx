import Hero from './home/Hero'
import HowItWorksSection from './home/HowItWorksSection'
import ServicesSection from './home/ServicesSection'
import WhyFetchly from './home/WhyFetchly'
import PricingTeaser from './home/PricingTeaser'
import Testimonials from './home/Testimonials'
import CountriesMarquee from './home/CountriesMarquee'
import CtaBanner from './home/CtaBanner'

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorksSection />
      <ServicesSection />
      <WhyFetchly />
      <PricingTeaser />
      <Testimonials />
      <CountriesMarquee />
      <CtaBanner />
    </>
  )
}
