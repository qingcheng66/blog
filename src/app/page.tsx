import { WelcomeSplash } from "@/components/welcome-splash"
import { HeroSection } from "@/components/hero-section"

export default function Home() {
  return (
    <>
      <WelcomeSplash />
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <HeroSection />
      </div>
    </>
  )
}
