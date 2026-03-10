import HeroSection from '@/components/public/landing/HeroSection'
import MissionStrip from '@/components/public/landing/MissionStrip'
import ImpactHighlights from '@/components/public/landing/ImpactHighlights'
import CounterStripWrapper from '@/components/public/landing/CounterStripWrapper'

export const revalidate = 60

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <CounterStripWrapper />
      <ImpactHighlights />
      <MissionStrip />
    </>
  )
}
