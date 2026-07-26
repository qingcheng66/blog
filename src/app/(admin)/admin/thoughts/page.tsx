import { getThoughts } from "@/lib/content"
import { ThoughtsManager } from "./manager"

export default async function AdminThoughtsPage() {
  const thoughts = await getThoughts()
  return <ThoughtsManager initial={thoughts} />
}
