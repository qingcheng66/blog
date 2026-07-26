import { getGallery } from "@/lib/content"
import { GalleryManager } from "./manager"

export default async function AdminGalleryPage() {
  const items = await getGallery()
  return <GalleryManager initial={items} />
}
