import type { Metadata } from "next"
import { getAbout } from "@/lib/content"
import { AboutSection } from "./about-section"

export const metadata: Metadata = {
  title: "关于",
  description: "关于我",
}

export default async function AboutPage() {
  const about = await getAbout()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <AboutSection about={about} />
    </div>
  )
}
