import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getThoughts, saveThoughts } from "@/lib/content"
import type { Thought } from "@/lib/content"

interface Params {
  params: Promise<{ id: string }>
}

export async function PUT(req: Request, { params }: Params) {
  const err = await auth()
  if (err) return err

  const { id } = await params
  try {
    const data = (await req.json()) as Partial<Thought>
    const thoughts = await getThoughts()
    const idx = thoughts.findIndex((t) => t.id === id)

    if (idx < 0) {
      return NextResponse.json({ error: "动态不存在" }, { status: 404 })
    }

    thoughts[idx] = { ...thoughts[idx], ...data, id }
    await saveThoughts(thoughts)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const err = await auth()
  if (err) return err

  const { id } = await params
  const thoughts = await getThoughts()
  const filtered = thoughts.filter((t) => t.id !== id)
  await saveThoughts(filtered)
  return NextResponse.json({ ok: true })
}
