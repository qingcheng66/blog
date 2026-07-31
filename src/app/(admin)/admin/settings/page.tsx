import { getSettings } from "@/lib/content"
import { SettingsEditor } from "./editor"

export default async function AdminSettingsPage() {
  const settings = await getSettings()
  return <SettingsEditor initial={settings} />
}
