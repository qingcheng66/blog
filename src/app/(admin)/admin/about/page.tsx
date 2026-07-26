import { getAbout } from "@/lib/content"
import { AboutEditor } from "./editor"

export default async function AdminAboutPage() {
  const about = await getAbout()
  return <AboutEditor initial={about} />
}
