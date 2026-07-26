import type { Metadata } from "next"
import { getThoughts } from "@/lib/content"
import { StreamTimeline } from "@/components/stream-timeline"

export const metadata: Metadata = {
  title: "碎碎念",
  description: "日常动态与想法",
}

export default async function ThoughtsPage() {
  const thoughts = await getThoughts()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <StreamTimeline items={thoughts} />
    </div>
  )
}
