import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getGallery, saveGallery } from "@/lib/content"
import type { GalleryItem } from "@/lib/content"

interface Params {
  params: Promise<{ id: string }>
}

export async function PUT(req: Request, { params }: Params) {
  const err = await auth()
  if (err) return err

  const { id } = await params
  try {
    const data = (await req.json()) as Partial<GalleryItem>
    const items = await getGallery()
    const idx = items.findIndex((g) => g.id === id)

    if (idx < 0) {
      return NextResponse.json({ error: "照片不存在" }, { status: 404 })
    }

    items[idx] = { ...items[idx], ...data, id }
    await saveGallery(items)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const err = await auth()
  if (err) return err

  const { id } = await params
  const items = await getGallery()
  const filtered = items.filter((g) => g.id !== id)
  await saveGallery(filtered)
  return NextResponse.json({ ok: true })
}
