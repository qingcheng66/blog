import { getMusic } from "@/lib/content"
import { MusicEditor } from "./editor"

export default async function AdminMusicPage() {
  const music = await getMusic()
  return <MusicEditor initial={music} />
}
