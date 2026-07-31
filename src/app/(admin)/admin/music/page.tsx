import { getMusicList } from "@/lib/content"
import { MusicEditor } from "./editor"

export default async function AdminMusicPage() {
  const list = await getMusicList()
  return <MusicEditor initial={list} />
}
