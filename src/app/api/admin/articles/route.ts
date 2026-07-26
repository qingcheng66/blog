import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getArticles, saveArticle } from "@/lib/content"
import type { Article } from "@/lib/content"

export async function GET() {
  const err = await auth()
  if (err) return err
  const articles = await getArticles()
  return NextResponse.json(articles)
}

export async function POST(req: Request) {
  const err = await auth()
  if (err) return err

  try {
    const { meta, content } = (await req.json()) as {
      meta: Article
      content: string
    }

    if (!meta?.slug || !meta?.title) {
      return NextResponse.json(
        { error: "slug 和 title 为必填项" },
        { status: 400 }
      )
    }

    await saveArticle(meta.slug, meta, content || "")
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 })
  }
}
