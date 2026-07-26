import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getGallery, saveGallery } from "@/lib/content"
import type { GalleryItem } from "@/lib/content"

export async function GET() {
  const err = await auth()
  if (err) return err
  const items = await getGallery()
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const err = await auth()
  if (err) return err

  try {
    const item = (await req.json()) as GalleryItem & { id?: string }

    if (!item.src || !item.label) {
      return NextResponse.json(
        { error: "src 和 label 为必填项" },
        { status: 400 }
      )
    }

    const items = await getGallery()

    if (item.id) {
      const idx = items.findIndex((g) => g.id === item.id)
      if (idx >= 0) {
        items[idx] = item as GalleryItem
      } else {
        return NextResponse.json({ error: "照片不存在" }, { status: 404 })
      }
    } else {
      item.id =
        Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
      items.push(item as GalleryItem)
    }

    await saveGallery(items)
    return NextResponse.json({ ok: true, id: item.id })
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 })
  }
}
