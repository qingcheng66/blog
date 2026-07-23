import type { Metadata } from "next"
import { GalleryGrid } from "./gallery-grid"

export const metadata: Metadata = {
  title: "相册",
  description: "照片与图像记录",
}

export default function GalleryPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <GalleryGrid />
    </div>
  )
}
