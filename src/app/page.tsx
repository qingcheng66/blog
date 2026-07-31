import { WelcomeSplash } from "@/components/welcome-splash"
import { HeroSection } from "@/components/hero-section"
import { getSettings } from "@/lib/content"

export default async function Home() {
  const settings = await getSettings()
  return (
    <>
      <WelcomeSplash welcome={settings.welcome} />
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <HeroSection />
      </div>
    </>
  )
}
