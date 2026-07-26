import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getArticleBySlug, saveArticle, deleteArticle } from "@/lib/content"
import type { Article } from "@/lib/content"

interface Params {
  params: Promise<{ slug: string }>
}

export async function GET(_req: Request, { params }: Params) {
  const err = await auth()
  if (err) return err

  const { slug } = await params
  const result = await getArticleBySlug(slug)
  if (!result) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 })
  }
  return NextResponse.json(result)
}

export async function PUT(req: Request, { params }: Params) {
  const err = await auth()
  if (err) return err

  const { slug } = await params
  try {
    const { meta, content } = (await req.json()) as {
      meta: Article
      content: string
    }
    await saveArticle(slug, meta, content || "")
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const err = await auth()
  if (err) return err

  const { slug } = await params
  await deleteArticle(slug)
  return NextResponse.json({ ok: true })
}
